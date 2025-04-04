import {createClients, getAllMcpTools} from "./mcp/createClient";
import {CLI} from "../CLI";

export async function getMcpTools() {
    CLI.debug(`Initializing MCP clients...`);
    const mcpClients = await createClients();
    const tools = await getAllMcpTools(mcpClients);

    return {
        tools,
        onClose: () => {
            for (const client of mcpClients) {
                client.close();
            }
        }
    }
}