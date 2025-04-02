import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {connectServerWithSse} from "../../connectServer";
import {Application} from "express";
import {googleSearchTool} from "./google-search/google-search.tool";

export function createSearchServer(app: Application) {
    const server = new McpServer({
        name: "Google Search",
        version: "1.0.0",
        capabilities: {
            resources: {},
            tools: {},
        },
    });

    const searchTool = googleSearchTool();
    server.tool(searchTool.id, searchTool.description, searchTool.parameters, searchTool.execute);

    connectServerWithSse(server, "google/search", app);
}