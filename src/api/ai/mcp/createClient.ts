import {experimental_createMCPClient as createMCPClient, ToolSet} from 'ai';
import {getMcpConfig} from "./clientConfig";
import {TempMcpClient} from "./models/TempMcpClient";
import {McpConfiguration} from "./models/McpConfiguration";
import {CLI} from "../../CLI";

export async function createClient(url: string): Promise<TempMcpClient> {
    return await createMCPClient({
        transport: {
            type: 'sse',
            url,
            headers: {
                "Content-Type": "application/json"
            }
        },
        onUncaughtError: (e) => {
            CLI.error(`Error in MCP client: ${e}`);
        }
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