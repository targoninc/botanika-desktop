import {z} from "zod";
import {ChatToolResult} from "../../../../../../../models/chat/ChatToolResult";
import {wrapTool} from "../../../../tooling";
import {checkIfEnabled, createClient} from "../createClient";

async function play(deviceId: string, contextUri: string, uris: string[], positionMs: number): Promise<void> {
    const api = await createClient();
    try {
        if (contextUri && contextUri.length > 0) {
            await api.play({
                device_id: deviceId,
                context_uri: contextUri,
                position_ms: positionMs
            });
        } else if (uris && uris.length > 0) {
            await api.play({
                device_id: deviceId,
                uris: uris,
                position_ms: positionMs
            });
        } else {
            throw new Error("No URIs or context URI provided");
        }
    } catch (error: any) {
        console.error("Error occurred while starting playback:", error.message);
        throw new Error(`Playing failed: ${error.message}`);
    }
}

interface SpotifyPlayOptions {
    deviceId: string;
    contextUri: string;
    uris: string[];
    positionMs: number;
}

async function playToolCall(input: SpotifyPlayOptions) {
    await checkIfEnabled();

    await play(input.deviceId, input.contextUri, input.uris, input.positionMs);

    return <ChatToolResult>{
        text: `Started playback on Spotify`,
    };
}

export function spotifyPlayTool() {
    return {
        id: "spotify.play",
        description: "Play a song, album or playlist on Spotify. If you don't know the URIs, use the Spotify search tool first.",
        parameters: {
            deviceId: z.string().describe('The device ID to play on'),
            contextUri: z.string().describe('The context URI to play on').optional(),
            uris: z.array(z.string()).describe('The URIs to play').optional(),
            positionMs: z.number().describe('The position in milliseconds to start playing from'),
        },
        execute: wrapTool("spotify.play", playToolCall),
    };
}