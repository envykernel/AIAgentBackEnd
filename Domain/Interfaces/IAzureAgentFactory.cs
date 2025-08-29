
using Microsoft.SemanticKernel.Agents.AzureAI;

namespace Domain.Interfaces;

public interface IAzureAgentFactory
{
    Task<AzureAIAgent> GetAgentById(string id);
}
