import path from "path";
import {Application} from "express";
import {appDataPath} from "../appData";
import {defaultShortcuts} from "../../models/shortcuts/defaultShortcuts";
import {ShortcutConfiguration} from "../../models/shortcuts/ShortcutConfiguration";
import fs from "fs";
import {mkdir} from "fs/promises";

let config: ShortcutConfiguration;
let configPath: string;

async function initializeConfig() {
    configPath = path.join(appDataPath, 'shortcuts.json');

    if (!fs.existsSync(appDataPath)) {
        await mkdir(appDataPath, {recursive: true});
    }

    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(defaultShortcuts, null, 4));
    }
    config = JSON.parse(fs.readFileSync(configPath).toString()) as ShortcutConfiguration;
}

export function getConfig() {
    return config;
}

export function setConfig(sc: ShortcutConfiguration) {
    config = sc;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}

export function addShortcutEndpoints(app: Application) {
    initializeConfig().then();

    app.get('/shortCutConfig', async (req, res) => {
        res.status(200).send(getConfig());
    });

    app.post('/shortCutConfig', async (req, res) => {
        const sc = req.body as ShortcutConfiguration;
        setConfig(sc);
        res.status(200).send(getConfig());
    });
}