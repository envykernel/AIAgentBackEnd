using Domain.Interfaces;
using Domain.Configuration;
using Microsoft.Extensions.Options;
using Azure.AI.Agents.Persistent;
using Microsoft.SemanticKernel.Agents.AzureAI;
using Azure.Identity;

namespace Infrastructure.Services;

public class AzureAgentFactory : IAzureAgentFactory
{
    public async Task<AzureAIAgent> GetAgentById(string id)
    {
        // Get agent endpoint from environment variable like in KernelFactory
        string agentEndpoint = Environment.GetEnvironmentVariable("AZURE_AGENT_ENDPOINT") ?? throw new ArgumentNullException("AZURE_AGENT_ENDPOINT");
        
        var credential = new DefaultAzureCredential();
        PersistentAgentsClient client = AzureAIAgent.CreateAgentsClient(agentEndpoint, credential);
        PersistentAgent definition = await client.Administration.GetAgentAsync(id);
        AzureAIAgent agent = new(definition, client);
        return agent;
    }
}
