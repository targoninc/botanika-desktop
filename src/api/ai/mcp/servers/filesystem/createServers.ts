import {Application} from "express";
import {createFilesystemSearchServer} from "./search/filesystem-search.mcp-server";

export function createFilesystemServers(app: Application) {
    createFilesystemSearchServer(app);
}