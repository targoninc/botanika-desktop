import {createGoogleServers} from "./google/createServers";
import {Application} from "express";

export function createMcpServers(app: Application) {
    createGoogleServers(app);
}