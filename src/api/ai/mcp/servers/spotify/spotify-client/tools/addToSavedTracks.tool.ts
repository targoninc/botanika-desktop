import {checkIfEnabled, createClient} from "../createClient";
import {ChatToolResult} from "../../../../../../../models/chat/ChatToolResult";
import {wrapTool} from "../../../../tooling";
import {z} from "zod";

async function addToSavedTracks(trackIds: string[]): Promise<SpotifyApi.SaveTracksForUserResponse> {
    const api = await createClient();
    try {
        const response = await api.addToMySavedTracks(trackIds);

        return response.body;
    } catch (error: any) {
        console.error("Error occurred while adding to library:", error.message);
        throw new Error(`Adding to library failed: ${error.message}`);
    }
}

async function addToSavedTracksToolCall(input: any) {
    await checkIfEnabled();

    await addToSavedTracks(input.trackIds);

    return <ChatToolResult>{
        text: "Added tracks to Spotify library",
        references: []
    };
}

export function spotifyAddToSavedTracksTool() {
    return {
        id: "spotify-addToSavedTracks",
        description: "Add a list of Spotify tracks to the library",
        parameters: {
            trackIds: z.array(z.string()).describe("List of Spotify track IDs")
        },
        execute: wrapTool("spotify-addToSavedTracks", addToSavedTracksToolCall),
    };
}