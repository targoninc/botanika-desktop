import {z} from "zod";
import {ChatToolResult} from "../../../../../../../../models/chat/ChatToolResult";
import {wrapTool} from "../../../../../tooling";
import {checkIfEnabled, createClient} from "../createClient";

async function pause(deviceId: string): Promise<void> {
    const api = await createClient();
    try {
        await api.pause({
            device_id: deviceId,
        });
    } catch (error: any) {
        console.error("Error occurred while pausing:", error.message);
        throw new Error(`Pausing failed: ${error.message}`);
    }
}

interface SpotifyPauseOptions {
    deviceId: string;
}

async function pauseToolCall(input: SpotifyPauseOptions) {
    await checkIfEnabled();

    await pause(input.deviceId);

    return <ChatToolResult>{
        text: `Paused playback on Spotify`,
    };
}

export function spotifyPauseTool() {
    return {
        id: "spotify.pause",
        description: "Pause Spotify playback.",
        parameters: {
            deviceId: z.string().describe('The device ID to pause on'),
        },
        execute: wrapTool("spotify.pause", pauseToolCall),
    };
}