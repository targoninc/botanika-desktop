import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { connectServerWithSse } from "../../connectServer";
import { Application } from "express";
import {filesystemSearchTool, initializeSearchIndex} from "./filesystem-search/filesystem-search.tool";

export function createFilesystemSearchServer(app: Application) {
    const server = new McpServer({
        name: "Filesystem Search",
        version: "1.0.0",
        capabilities: {
            resources: {},
            tools: {},
        },
    });

    const searchTool = filesystemSearchTool();
    server.tool(searchTool.id, searchTool.description, searchTool.parameters, searchTool.execute);

    initializeSearchIndex().then();

    connectServerWithSse(server, "filesystem/search", app);
}
