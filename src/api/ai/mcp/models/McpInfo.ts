import {ToolSet} from "ai";

export interface McpInfo {
    tools: ToolSet;
    onClose: () => void
}