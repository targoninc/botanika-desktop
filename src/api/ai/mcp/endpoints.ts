import {addMcpServer, deleteMcpServer, getMcpConfig} from "./clientConfig";
import {Application, Request, Response} from "express";

export function getMcpConfigEndpoint(req: Request, res: Response) {
    res.json(getMcpConfig());
}

export function addMcpServerEndpoint(req: Request, res: Response) {
    const url = req.body.url;
    addMcpServer(url);
    res.json({});
}

export function deleteMcpServerEndpoint(req: Request, res: Response) {
    const url = req.body.url;
    deleteMcpServer(url);
    res.json({});
}

export function addMcpEndpoints(app: Application) {
    app.get('/mcpConfig', getMcpConfigEndpoint);
    app.post('/mcpServer', addMcpServerEndpoint);
    app.delete('/mcpServer', deleteMcpServerEndpoint);
}