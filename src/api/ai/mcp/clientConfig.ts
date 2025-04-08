import path from "path";
import fs from "fs";
import {appDataPath} from "../../appData";
import {CLI} from "../../CLI";
import {McpConfiguration} from "../../../models/mcp/McpConfiguration";
import {defaultMcpConfig} from "./models/defaultMcpConfig";
import {McpServerConfig} from "../../../models/mcp/McpServerConfig";

const configPath = path.join(appDataPath, 'mcp-config.json');
CLI.log('MCP Config path: ' + configPath);

if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, {recursive: true});
}

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultMcpConfig, null, 4));
}

const config = JSON.parse(fs.readFileSync(configPath).toString()) as McpConfiguration;

export function getMcpConfig() {
    return config;
}

export function addMcpServer(newServer: McpServerConfig) {
    if (config.servers.find(server => server.url === newServer.url)) {
        return;
    }
    config.servers.push(newServer);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}

export function deleteMcpServer(url: string) {
    config.servers = config.servers.filter(server => server.url !== url);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}

export function updateMcpServer(url: string, mcpServerConfig: McpServerConfig) {
    config.servers = config.servers.map(server => {
        if (server.url === url) {
            return mcpServerConfig;
        }
        return server;
    });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}