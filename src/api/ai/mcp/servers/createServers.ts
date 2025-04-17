import {createGoogleServers} from "./google/createServers";
import {Application} from "express";
import {createSpotifyServers} from "./spotify/createServers";
import {createFilesystemServers} from "./filesystem/createServers";

export function createMcpServers(app: Application) {
    createFilesystemServers(app);
    createGoogleServers(app);
    createSpotifyServers(app);
}
