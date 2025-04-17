import {Application} from "express";
import {addConfigEndpoints} from "./configuration";
import {addChatEndpoints} from "./ai/endpoints";
import {addMcpEndpoints} from "./ai/mcp/endpoints";
import {addFeatureEndpoints} from "./features/endpoints";
import {addAudioEndpoints} from "./ai/tts/endpoints";
import {addShortcutEndpoints} from "./shortcuts/shortcuts";
import {ApiEndpoint} from "../models/ApiEndpoints";

export function createEndpoints(app: Application) {
    addConfigEndpoints(app);
    addChatEndpoints(app);
    addMcpEndpoints(app);
    addFeatureEndpoints(app);
    addAudioEndpoints(app);
    addShortcutEndpoints(app);

    app.get(ApiEndpoint.OPENAI_KEY, (req, res) => {
        res.send(process.env.OPENAI_API_KEY);
    });
}
