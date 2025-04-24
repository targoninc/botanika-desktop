import {createClients, getAllMcpTools} from "./mcp/createClient";
import {CLI} from "../CLI";
import {McpInfo} from "./mcp/models/McpInfo";

export async function getMcpTools() {
    CLI.debug(`Initializing MCP clients...`);
    const mcpClients = await createClients();
    const tools = await getAllMcpTools(mcpClients);

    return <McpInfo>{
        tools,
        onClose: () => {
            for (const client of mcpClients) {
                client.close();
            }
        }
    }
}