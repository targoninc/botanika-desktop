import dotenv from "dotenv";
import {shell} from "electron";
import {app, currentWindow} from "../../../../../../server-utils";
import {setEnvironmentVariable} from "../../../../../features/environment";
import {CLI} from "../../../../../CLI";
import {featureEnabled} from "../../../../../features/configuredFeatures";
import {BotanikaFeature} from "../../../../../../models/features/BotanikaFeature";

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
let token: string = process.env.SPOTIFY_TOKEN;

async function authorize() {
    if (!token) {
        let code: string;
        app.get('/mcp/spotify/callback', async (req, res) => {
            code = req.query.code;
            if (!code) {
                res.status(400).send('Missing code parameter');
                return;
            }
            CLI.info("Spotify code set");
            res.send(`<html lang="en"><head><script>window.close()</script><title>Spotify Auth Success</title></head></html>`);
        });

        const authorizeURL = api.createAuthorizeURL(scopes, "");
        CLI.info(`Opening Spotify authorization page: ${authorizeURL}`);
        await shell.openExternal(authorizeURL);

        await new Promise<void>((resolve, _) => {
            const interval = setInterval(() => {
                if (code || token) {
                    clearInterval(interval);
                    resolve();
                } else {
                    CLI.debug("Waiting for Spotify authorization code...");
                }
            }, 500);
        });

        try {
            const data = await api.authorizationCodeGrant(code);
            currentWindow.focus();
            await setEnvironmentVariable("SPOTIFY_TOKEN", data.body['access_token']);
            token = data.body['access_token'];

            api.setAccessToken(data.body['access_token']);
            api.setRefreshToken(data.body['refresh_token']);
        } catch (e) {
            if (e.toString().includes("code expired")) {
                token = null;
                await authorize();
                return;
            }
        }
    }
}

export async function createClient() {
    if (!api) {
        api = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: 'http://localhost:48678/mcp/spotify/callback',
        });
    }

    try {
        await api.getMyCurrentPlaybackState();
    } catch (e: any) {
        CLI.warning("Spotify authentication failed, trying to refresh");
        token = null;
        await authorize();
    }

    return api;
}

export async function checkIfEnabled() {
    if (!await featureEnabled(BotanikaFeature.Spotify)) {
        throw new Error("Spotify API is not enabled.");
    }
}