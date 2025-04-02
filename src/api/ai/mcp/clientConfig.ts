import path from "path";
import fs from "fs";
import {appDataPath} from "../../appData";
import {CLI} from "../../CLI";
import {McpConfiguration} from "./mcpConfiguration";

const configPath = path.join(appDataPath, 'mcp-config.json');
CLI.log('MCP Config path: ' + configPath);

if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, {recursive: true});
}

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}, null, 4));
}

const config = JSON.parse(fs.readFileSync(configPath).toString()) as McpConfiguration;

export function getMcpConfig() {
    return config;
}

export function addMcpServer(url: string) {
    if (config.servers.find(server => server.url === url)) {
        return;
    }
    config.servers.push({
        url
    });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}

export function deleteMcpServer(url: string) {
    config.servers = config.servers.filter(server => server.url !== url);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}