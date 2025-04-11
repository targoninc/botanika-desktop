import {checkIfEnabled, createClient} from "../createClient";
import {ChatToolResult} from "../../../../../../../models/chat/ChatToolResult";
import {wrapTool} from "../../../../tooling";
import {z} from "zod";

async function addToSavedAlbums(albumIds: string[]): Promise<SpotifyApi.AddToQueueResponse> {
    const api = await createClient();
    try {
        const response = await api.addToMySavedAlbums(albumIds);

        return response.body;
    } catch (error: any) {
        console.error("Error occurred while adding to library:", error.message);
        throw new Error(`Adding to library failed: ${error.message}`);
    }
}

async function addToSavedAlbumsToolCall(input: any) {
    await checkIfEnabled();

    await addToSavedAlbums(input.albumIds);

    return <ChatToolResult>{
        text: "Added tracks to Spotify library",
        references: []
    };
}

export function spotifyAddToSavedAlbumsTool() {
    return {
        id: "spotify.addToSavedAlbums",
        description: "Add a list of Spotify albums to the library",
        parameters: {
            albumIds: z.array(z.string()).describe("List of Spotify album IDs")
        },
        execute: wrapTool("spotify.addToSavedAlbums", addToSavedAlbumsToolCall),
    };
}