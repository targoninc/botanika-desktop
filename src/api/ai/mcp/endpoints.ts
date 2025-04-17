import {addMcpServer, deleteMcpServer, getMcpConfig, updateMcpServer} from "./clientConfig";
import {Application, Request, Response} from "express";
import { McpServerConfig } from "../../../models/mcp/McpServerConfig";
import { ApiEndpoint } from "../../../models/ApiEndpoints";

export function getMcpConfigEndpoint(req: Request, res: Response) {
    res.json(getMcpConfig());
}

export async function addMcpServerEndpoint(req: Request, res: Response) {
    const server = req.body as McpServerConfig;

    if (!server.url) {
        res.status(400).send('Missing server url');
        return;
    }

    addMcpServer(server);
    res.json({});
}

export async function deleteMcpServerEndpoint(req: Request, res: Response) {
    const url = req.query.url as string;
    deleteMcpServer(url);
    res.json({});
}

export async function updateMcpServerEndpoint(req: Request, res: Response) {
    const url = req.query.url as string;
    const mcpServerConfig = req.body as McpServerConfig;
    updateMcpServer(url, mcpServerConfig);
    res.json({});
}

export function addMcpEndpoints(app: Application) {
    app.get(ApiEndpoint.MCP_CONFIG, getMcpConfigEndpoint);
    app.post(ApiEndpoint.MCP_SERVER, addMcpServerEndpoint);
    app.delete(ApiEndpoint.MCP_SERVER, deleteMcpServerEndpoint);
    app.put(ApiEndpoint.MCP_SERVER, updateMcpServerEndpoint);
}
