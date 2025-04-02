import {Application} from "express";
import {createSearchServer} from "./search/search.mcp-server";

export function createGoogleServers(app: Application) {
    createSearchServer(app);
}