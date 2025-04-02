import {createClients, getAllMcpTools} from "./mcp/createClient";
import {getBuiltinTools} from "../storage/helpers";
import {ToolSet} from "ai";

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
    const mcpClients = await createClients();
    output.mcpTools = await getAllMcpTools(mcpClients);
    Object.assign(output.tools, output.mcpTools);

    // Add builtin tools
    const builtinTools = getBuiltinTools();
    Object.assign(output.tools, builtinTools);

    return output;
}