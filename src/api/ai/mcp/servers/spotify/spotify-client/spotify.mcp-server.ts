import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {connectServerWithSse} from "../../connectServer";
import {Application} from "express";
import {CLI} from "../../../../../CLI";
import {spotifySearchTool} from "./tools/search.tool";
import {spotifyGetDevicesTool} from "./tools/getDevices.tool";
import {spotifyPlayTool} from "./tools/play.tool";
import {spotifyPauseTool} from "./tools/pause.tool";
import {spotifyGetCurrentPlaybackTool} from "./tools/getCurrentPlayback.tool";

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

    const pauseTool = spotifyPauseTool();
    server.tool(pauseTool.id, pauseTool.description, pauseTool.parameters, pauseTool.execute);

    const getCurrentPlaybackTool = spotifyGetCurrentPlaybackTool();
    server.tool(getCurrentPlaybackTool.id, getCurrentPlaybackTool.description, getCurrentPlaybackTool.parameters, getCurrentPlaybackTool.execute);

    CLI.log("Creating Spotify server");
    connectServerWithSse(server, "spotify", app);
}