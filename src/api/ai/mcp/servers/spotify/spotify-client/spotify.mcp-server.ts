import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {connectServerWithSse} from "../../connectServer";
import {Application} from "express";
import {spotifySearchTool} from "./integration/tools/search.tool";
import {CLI} from "../../../../../CLI";
import {spotifyGetDevicesTool} from "./integration/tools/getDevices.tool";
import {spotifyPlayTool} from "./integration/tools/play.tool";

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

    const getDevicesTool = spotifyGetDevicesTool();
    server.tool(getDevicesTool.id, getDevicesTool.description, getDevicesTool.parameters, getDevicesTool.execute);

    const playTool = spotifyPlayTool();
    server.tool(playTool.id, playTool.description, playTool.parameters, playTool.execute);

    CLI.log("Creating Spotify server");
    connectServerWithSse(server, "spotify", app);
}