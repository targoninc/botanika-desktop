import {Application} from "express";
import {createSpotifyServer} from "./spotify-client/spotify.mcp-server";

export function createSpotifyServers(app: Application) {
    createSpotifyServer(app);
}