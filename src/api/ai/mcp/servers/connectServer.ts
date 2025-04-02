import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {SSEServerTransport} from "@modelcontextprotocol/sdk/server/sse.js";
import {Application} from "express";

export function connectServerWithSse(server: McpServer, subPath: string, app: Application) {
    let transport: SSEServerTransport | null = null;

    app.get(`/mcp/sse/${subPath}`, async (req, res) => {
        transport = new SSEServerTransport(`/mcp/messages/${subPath}`, res);
        await server.connect(transport);
    });

    app.post(`/mcp/messages/${subPath}`, async (req, res) => {
        if (transport) {
            await transport.handlePostMessage(req, res, req.body);
        }
    });
}