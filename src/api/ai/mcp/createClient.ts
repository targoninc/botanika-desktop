import {experimental_createMCPClient as createMCPClient, ToolSet} from 'ai';
import {McpConfiguration} from "./mcpConfiguration";
import {TempMcpClient} from "./TempMcpClient";
import {getMcpConfig} from "./clientConfig";

export async function createClient(url: string): Promise<TempMcpClient> {
    return await createMCPClient({
        transport: {
            type: 'sse',
            url,
        },
    }) as unknown as TempMcpClient;
}

export async function createClientsFromConfig(config: McpConfiguration) {
    if (!config.servers) {
        return [];
    }

    const clients: TempMcpClient[] = [];
    for (const server of config.servers) {
        const client = await createClient(server.url);
        clients.push(client);
    }
    return clients;
}

export async function createClients() {
    const config = getMcpConfig();
    return await createClientsFromConfig(config);
}

export async function getAllMcpTools(clients: TempMcpClient[]) {
    const tools: ToolSet = {};
    for (const client of clients) {
        const clientTools = await client.tools() as ToolSet;
        for (const toolKey in clientTools) {
            tools[toolKey] = clientTools[toolKey];
        }
    }
    return tools;
}