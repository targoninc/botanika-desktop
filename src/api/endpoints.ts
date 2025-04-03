import {Application} from "express";
import {addConfigEndpoints} from "./configuration";
import {addChatEndpoints} from "./ai/endpoints";
import {addMcpEndpoints} from "./ai/mcp/endpoints";
import {addFeatureEndpoints} from "./features/endpoints";
import {addAudioEndpoints} from "./ai/tts/endpoints";

export function createEndpoints(app: Application) {
    addConfigEndpoints(app);
    addChatEndpoints(app);
    addMcpEndpoints(app);
    addFeatureEndpoints(app);
    addAudioEndpoints(app);
}