import path from "path";
import fs from "fs";
import {Configuration} from "../models/Configuration";
import {defaultConfig} from "../ui/enums/DefaultConfig";
import {appDataPath} from "./appData";
import {CLI} from "./CLI";

const configPath = path.join(appDataPath, 'config.json');
CLI.log('Config path: ' + configPath);

if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, {recursive: true});
}

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));
}
const config = JSON.parse(fs.readFileSync(configPath).toString()) as Configuration;

export function getConfig() {
    return config;
}

export function setConfigKey(key: string, value: any) {
    config[key] = value;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}

export function getConfigKey(key: string) {
    return config[key];
}
