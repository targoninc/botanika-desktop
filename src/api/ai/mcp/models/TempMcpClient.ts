import {ToolSet} from "ai";

declare class TempMcpClient {
    private transport;
    private onUncaughtError?;
    private clientInfo;
    private requestMessageId;
    private responseHandlers;
    private serverCapabilities;
    private isClosed;
    init(): Promise<this>;
    close(): Promise<void>;
    private request;
    private listTools;
    private callTool;
    private notification;
    /**
     * Returns a set of AI SDK tools from the MCP server
     * @returns A record of tool names to their implementations
     */
    tools({ schemas, }?: {
        schemas?: any;
    }): Promise<ToolSet>;
    private onClose;
    private onError;
    private onResponse;
}

export {TempMcpClient};