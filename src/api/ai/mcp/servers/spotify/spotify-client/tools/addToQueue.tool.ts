import {checkIfEnabled, createClient} from "../createClient";
import {ChatToolResult} from "../../../../../../../models/chat/ChatToolResult";
import {wrapTool} from "../../../../tooling";
import {z} from "zod";

async function addToQueue(uri: string, deviceId: string): Promise<SpotifyApi.AddToQueueResponse> {
    const api = await createClient();
    try {
        const response = await api.addToQueue(uri, {
            device_id: deviceId
        });

        return response.body;
    } catch (error: any) {
        console.error("Error occurred while adding to queue:", error.message);
        throw new Error(`Adding to queue failed: ${error.message}`);
    }
}

async function addToQueueToolCall(input: any) {
    await checkIfEnabled();

    await addToQueue(input.uri, input.deviceId);

    return <ChatToolResult>{
        text: "Added item to Spotify playback queue",
        references: []
    };
}

export function spotifyAddToQueueTool() {
    return {
        id: "spotify.addToQueue",
        description: "Add a Spotify URI to the queue.",
        parameters: {
            uri: z.string().describe('The URI to add to the queue'),
            deviceId: z.string().describe('The device ID to add to the queue on'),
        },
        execute: wrapTool("spotify.addToQueue", addToQueueToolCall),
    };
}