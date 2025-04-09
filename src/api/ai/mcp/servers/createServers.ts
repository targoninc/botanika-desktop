import {createGoogleServers} from "./google/createServers";
import {Application} from "express";
import {createSpotifyServers} from "./spotify/createServers";

export function createMcpServers(app: Application) {
    createGoogleServers(app);
    createSpotifyServers(app);
}