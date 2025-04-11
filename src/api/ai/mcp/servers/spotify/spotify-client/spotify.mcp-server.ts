import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {connectServerWithSse} from "../../connectServer";
import {Application} from "express";
import {CLI} from "../../../../../CLI";
import {spotifySearchTool} from "./tools/search.tool";
import {spotifyGetDevicesTool} from "./tools/getDevices.tool";
import {spotifyPlayTool} from "./tools/play.tool";
import {spotifyPauseTool} from "./tools/pause.tool";
import {spotifyGetCurrentPlaybackTool} from "./tools/getCurrentPlayback.tool";
import {spotifyGetProfileTool} from "./tools/getProfile.tool";

export function createSpotifyServer(app: Application) {
    const server = new McpServer({
        name: "Spotify",
        version: "1.0.0",
        capabilities: {
            resources: {},
            tools: {},
        },
    });

    const tools = [
        spotifySearchTool(),
        spotifyGetDevicesTool(),
        spotifyPlayTool(),
        spotifyPauseTool(),
        spotifyGetCurrentPlaybackTool(),
        spotifyGetProfileTool(),
    ];

    for (const tool of tools) {
        server.tool(tool.id, tool.description, tool.parameters, tool.execute);
    }

    CLI.log("Creating Spotify server");
    connectServerWithSse(server, "spotify", app);
}