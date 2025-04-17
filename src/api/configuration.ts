import path from "path";
import fs from "fs";
import {Configuration} from "../models/Configuration";
import {defaultConfig} from "../ui/enums/DefaultConfig";
import {appDataPath} from "./appData";
import {CLI} from "./CLI";
import {Application} from "express";
import {ApiEndpoint} from "../models/ApiEndpoints";
import {getConfiguredFeatures} from "./features/configuredFeatures";
import {execSync} from "child_process";

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

export function addConfigEndpoints(app: Application) {
    app.get(ApiEndpoint.CONFIG, async (req, res) => {
        res.status(200).send(getConfig());
    });

    app.get(`${ApiEndpoint.CONFIG_KEY}:key`, async (req, res) => {
        const key = req.params.key;
        res.status(200).send(getConfigKey(key));
    });

    app.put(`${ApiEndpoint.CONFIG_KEY}:key`, async (req, res) => {
        const key = req.params.key;
        const value = req.body.value;
        setConfigKey(key, value);
        res.status(200).send(getConfigKey(key));
    });

    app.get(ApiEndpoint.CONFIGURED_APIS, async (req, res) => {
        const apis = await getConfiguredFeatures();
        res.status(200).json(apis);
    });

    app.post(ApiEndpoint.OPEN_APP_DATA_PATH, async (req, res) => {
        execSync(`start ${appDataPath}`);

        res.status(200).send();
    });
}
