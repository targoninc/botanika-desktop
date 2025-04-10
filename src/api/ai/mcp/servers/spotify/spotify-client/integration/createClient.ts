import {CLI} from "../../../../../../CLI";
import {getConfiguredApis} from "../../../../../../features/configuredFeatures";
import {ConfiguredApi} from "../../../../../../features/configuredApis";
import dotenv from "dotenv";
import * as readline from "node:readline";
import {shell} from "electron";
import {app} from "../../../../../../../server-utils";

const SpotifyWebApi = require("spotify-web-api-node");

dotenv.config();

let api: SpotifyWebApi;

const scopes = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'app-remote-control',
    'streaming',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-follow-read',
    'user-read-playback-position',
    'user-top-read',
    'user-read-recently-played',
    'user-library-modify',
    'user-library-read',
];

export async function createClient() {
    if (api) {
        return api;
    }
    CLI.info("Creating Spotify client");

    api = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: 'http://localhost:48678/mcp/spotify/callback',
    });
    const authorizeURL = api.createAuthorizeURL(scopes, "");
    CLI.info(`Opening Spotify authorization page: ${authorizeURL}`);
    await shell.openExternal(authorizeURL);

    let code: string;
    app.get('/mcp/spotify/callback', async (req, res) => {
        code = req.query.code;
        if (!code) {
            res.status(400).send('Missing code parameter');
            return;
        }
        res.send();
    });

    await new Promise<string>((resolve, reject) => {
        const interval = setInterval(() => {
            if (code) {
                clearInterval(interval);
                resolve(code);
            } else {
                CLI.debug("Waiting for Spotify authorization code...");
            }
        }, 500);
    });

    const data = await api.authorizationCodeGrant(code);

    api.setAccessToken(data.body['access_token']);
    api.setRefreshToken(data.body['refresh_token']);
    return api;
}

export async function checkIfEnabled() {
    const configuredApis = await getConfiguredApis();
    if (!configuredApis[ConfiguredApi.Spotify].enabled) {
        throw new Error("Spotify API is not enabled.");
    }
}