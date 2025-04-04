import {addMcpServer, deleteMcpServer, getMcpConfig, updateMcpServer} from "./clientConfig";
import {Application, Request, Response} from "express";
import { McpServerConfig } from "./models/McpServerConfig";

export function getMcpConfigEndpoint(req: Request, res: Response) {
    res.json(getMcpConfig());
}

export async function addMcpServerEndpoint(req: Request, res: Response) {
    const url = req.body.url;
    const name = req.body.name;
    addMcpServer(url, name);
    res.json({});
}

export async function deleteMcpServerEndpoint(req: Request, res: Response) {
    const url = req.params.url;
    deleteMcpServer(url);
    res.json({});
}

export async function updateMcpServerEndpoint(req: Request, res: Response) {
    const url = req.params.url;
    const mcpServerConfig = req.body as McpServerConfig;
    updateMcpServer(url, mcpServerConfig);
    res.json({});
}

export function addMcpEndpoints(app: Application) {
    app.get('/mcpConfig', getMcpConfigEndpoint);
    app.post('/mcpServer', addMcpServerEndpoint);
    app.delete('/mcpServer/:url', deleteMcpServerEndpoint);
    app.put('/mcpServer/:url', updateMcpServerEndpoint);
}