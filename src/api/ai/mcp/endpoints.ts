import {addMcpServer, deleteMcpServer, getMcpConfig, updateMcpServer} from "./clientConfig";
import {Application, Request, Response} from "express";
import { McpServerConfig } from "../../../models/mcp/McpServerConfig";

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
    app.get('/mcpConfig', getMcpConfigEndpoint);
    app.post('/mcpServer', addMcpServerEndpoint);
    app.delete('/mcpServer', deleteMcpServerEndpoint);
    app.put('/mcpServer', updateMcpServerEndpoint);
}