import {z} from "zod";
import {ChatToolResult} from "../../../../../../../../models/chat/ChatToolResult";
import {wrapTool} from "../../../../../tooling";
import {checkIfEnabled, createClient} from "../createClient";

async function play(deviceId: string, contextUri: string, uris: string[], positionMs: number): Promise<void> {
    try {
        const api = await createClient();

        await api.play({
            device_id: deviceId,
            context_uri: contextUri,
            uris: uris,
            position_ms: positionMs
        });
    } catch (error: any) {
        console.error("Error occurred while searching:", error.message);
        throw new Error(`Search failed: ${error.message}`);
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
        text: `Started playing on Spotify`,
    };
}

export function spotifyPlayTool() {
    return {
        id: "spotify.play",
        description: "Play a song, album or playlist on Spotify.",
        parameters: {
            deviceId: z.string().describe('The device ID to play on'),
            contextUri: z.string().describe('The context URI to play on'),
            uris: z.array(z.string()).describe('The URIs to play'),
            positionMs: z.number().describe('The position in milliseconds to start playing from'),
        },
        execute: wrapTool("spotify.play", playToolCall),
    };
}