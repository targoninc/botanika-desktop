import {createClients, getAllMcpTools} from "./mcp/createClient";
import {ToolSet} from "ai";
import {CLI} from "../CLI";

let initialized = false;
let output: {
    tools: ToolSet,
    mcpTools: ToolSet
} = {
    tools: {},
    mcpTools: {}
};

export async function initializeAi() {
    if (initialized) {
        return output;
    }
    initialized = true;

    // Add MCP clients + tools
    await reinitializeMcpClients();

    return output;
}

export async function reinitializeMcpClients() {
    CLI.debug(`Initializing MCP clients...`);
    const mcpClients = await createClients();
    output.mcpTools = await getAllMcpTools(mcpClients);
    Object.assign(output.tools, output.mcpTools);
}