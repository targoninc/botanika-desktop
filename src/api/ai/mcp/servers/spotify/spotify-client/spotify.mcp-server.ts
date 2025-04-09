import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {connectServerWithSse} from "../../connectServer";
import {Application} from "express";
import {spotifySearchTool} from "./integration/search.tool";
import {CLI} from "../../../../../CLI";

export function createSpotifyServer(app: Application) {
    const server = new McpServer({
        name: "Spotify",
        version: "1.0.0",
        capabilities: {
            resources: {},
            tools: {},
        },
    });

    const searchTool = spotifySearchTool();
    server.tool(searchTool.id, searchTool.description, searchTool.parameters, searchTool.execute);

    CLI.log("Creating Spotify server");
    connectServerWithSse(server, "spotify", app);
}