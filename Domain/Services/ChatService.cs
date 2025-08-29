using Domain.Entities;
using Domain.Interfaces;
using Domain.Configuration;
using Domain.DTOs;
using Microsoft.SemanticKernel.Agents.AzureAI;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Azure.AI.Agents.Persistent;

namespace Domain.Services;

public class ChatService : IChatService
{
    private const string USAGE_METADATA_KEY = "Usage";
    private const string TOTAL_TOKENS_PROPERTY = "TotalTokens";
    
    private readonly IChatSessionRepository _sessionRepository;
    private readonly IMessageRepository _messageRepository;
    private readonly IConversationSummaryRepository _summaryRepository;
    private readonly IAzureAgentFactory _azureAgentFactory;
    private readonly AzureAIAgent _SAVAgent;
    private readonly Kernel _kernel;

    public ChatService(
        IChatSessionRepository sessionRepository,
        IMessageRepository messageRepository,
        IConversationSummaryRepository summaryRepository,
        IAzureAgentFactory azureAgentFactory,
        AzureConfiguration azureConfiguration,
        IKernelFactory kernelFactory)
    {
        _sessionRepository = sessionRepository;
        _messageRepository = messageRepository;
        _summaryRepository = summaryRepository;
        _azureAgentFactory = azureAgentFactory;
        _SAVAgent = _azureAgentFactory.GetAgentById(azureConfiguration.SAVAgentId).Result;
        _kernel = kernelFactory.CreateKernel();
    }

    public async Task<ChatSession> CreateSessionAsync()
    {
        var session = new ChatSession
        {
            Id = Guid.NewGuid().ToString(),
            CreatedAt = DateTime.UtcNow,
            LastActivityAt = DateTime.UtcNow,
            IsActive = true,
            MessageCount = 0,
            TokenCount = 0
        };

        await _sessionRepository.CreateAsync(session);
        return session;
    }

    public async Task<(Message message, ChatSession updatedSession)> SendMessageAsync(string sessionId, string content, Entities.MessageRole role, int tokenCount)
    {
        var message = new Message
        {
            Id = Guid.NewGuid().ToString(),
            SessionId = sessionId,
            Role = role,
            Content = content,
            TokenCount = tokenCount,
            CreatedAt = DateTime.UtcNow
        };

        await _messageRepository.CreateAsync(message);
        
        // Update session token count and last activity
        var session = await _sessionRepository.GetByIdAsync(sessionId);
        if (session != null)
        {
            session.TokenCount += message.TokenCount;
            session.MessageCount++;
            session.LastActivityAt = DateTime.UtcNow;
            await _sessionRepository.UpdateAsync(session);
        }

        return (message, session ?? throw new InvalidOperationException($"Session {sessionId} not found after update"));
    }

    public async Task<IEnumerable<Message>> GetConversationAsync(string sessionId, int maxTokens = 4000)
    {
        var messages = await _messageRepository.GetBySessionIdOrderedAsync(sessionId);
        var conversation = new List<Message>();
        var currentTokenCount = 0;
        
        // Get conversation summary if exists
        var summary = await _summaryRepository.GetBySessionIdAsync(sessionId);
        if (summary != null)
        {
            currentTokenCount += summary.TokenCount;
        }
        
        // Add messages in reverse order (newest first) until we hit token limit
        foreach (var message in messages.Reverse())
        {
            if (currentTokenCount + message.TokenCount > maxTokens)
            {
                break;
            }
            
            conversation.Insert(0, message);
            currentTokenCount += message.TokenCount;
        }
        
        return conversation;
    }



    public async Task<AgentResponse> GenerateAgentResponseAsync(IEnumerable<Message> conversation)
    {
        // Create ThreadMessageOptions from conversation
        var threadMessages = CreateThreadMessageOptionsFromConversation(conversation);
        
        AzureAIAgentThread thread = new(client: _SAVAgent.Client, messages: threadMessages);
        try
        {
            // Generate the agent response(s)
            var lastUserMessage = conversation.LastOrDefault(m => m.Role == Entities.MessageRole.User)?.Content ?? "Hello";
            Console.WriteLine($"Generating agent response for message: {lastUserMessage}");
            Console.WriteLine($"Thread messages count: {threadMessages.Count}");
            
            await foreach (ChatMessageContent response in _SAVAgent.InvokeAsync(new ChatMessageContent(AuthorRole.User, lastUserMessage), thread))
            {
                var tokenCount = ExtractTotalTokenCount(response);
                
                Console.WriteLine($"Agent response received: {response.Content}");
                return new AgentResponse
                {
                    Content = response.Content ?? "No content in response.",
                    TokenCount = tokenCount
                };
            }
            
            return new AgentResponse
            {
                Content = "No response generated from agent.",
                TokenCount = 0
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GenerateAgentResponseAsync: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            // Log the exception in production
            return new AgentResponse
            {
                Content = $"I encountered an error while processing your request: {ex.Message}",
                TokenCount = 0
            };
        }
        finally
        {
            await thread.DeleteAsync();
        }
    }

    public async Task<ChatSession?> GetActiveSessionAsync(string sessionId)
    {
        return await _sessionRepository.GetActiveSessionAsync(sessionId);
    }

    public async Task<bool> DeactivateSessionAsync(string sessionId)
    {
        return await _sessionRepository.DeactivateSessionAsync(sessionId);
    }

    public int EstimateTokenCount(string text)
    {
        // Simple token estimation (roughly 4 characters per token)
        // In production, use a proper tokenizer
        return Math.Max(1, text.Length / 4);
    }

    private ChatHistory CreateChatHistoryFromConversation(IEnumerable<Message> conversation)
    {
        var chatHistory = new ChatHistory();
        
        // Exclude the last user message to avoid duplication
        var messagesToInclude = conversation.Take(conversation.Count() - 1);
        
        foreach (var message in messagesToInclude)
        {
            var authorRole = message.Role switch
            {
                Entities.MessageRole.User => AuthorRole.User,
                Entities.MessageRole.Assistant => AuthorRole.Assistant,
                Entities.MessageRole.System => AuthorRole.System,
                _ => AuthorRole.User
            };
            
            chatHistory.AddMessage(authorRole, message.Content);
        }
        
        return chatHistory;
    }

    private List<ThreadMessageOptions> CreateThreadMessageOptionsFromConversation(IEnumerable<Message> conversation)
    {
        var threadMessages = new List<ThreadMessageOptions>();
        
        foreach (var message in conversation)
        {
            var role = message.Role switch
            {
                Entities.MessageRole.User => Azure.AI.Agents.Persistent.MessageRole.User,
                Entities.MessageRole.Assistant => Azure.AI.Agents.Persistent.MessageRole.Agent,
                Entities.MessageRole.System => Azure.AI.Agents.Persistent.MessageRole.User,
                _ => Azure.AI.Agents.Persistent.MessageRole.User
            };
            
            var threadMessage = new ThreadMessageOptions(role: role, content: message.Content);
            threadMessages.Add(threadMessage);
        }
        
        return threadMessages;
    }

    private int ExtractTotalTokenCount(ChatMessageContent response)
    {
        if (response.Metadata?.TryGetValue(USAGE_METADATA_KEY, out var usageObj) == true)
        {
            if (usageObj is OpenAI.Chat.ChatTokenUsage chatUsage)
            {
                return chatUsage.TotalTokenCount;
            }
            else if (usageObj is Azure.AI.Agents.Persistent.RunStepCompletionUsage runUsage)
            {
                var totalTokensProperty = runUsage.GetType().GetProperty(TOTAL_TOKENS_PROPERTY);
                if (totalTokensProperty != null)
                {
                    var totalTokens = totalTokensProperty.GetValue(runUsage);
                    if (totalTokens is int tokenCount)
                    {
                        return tokenCount;
                    }
                    else if (totalTokens is long longTokenCount)
                    {
                        return (int)longTokenCount;
                    }
                }
            }
        }
        
        return 0;
    }
}
