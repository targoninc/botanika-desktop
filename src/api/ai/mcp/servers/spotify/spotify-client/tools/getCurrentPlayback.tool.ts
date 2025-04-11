import {checkIfEnabled, createClient} from "../createClient";
import {ChatToolResult} from "../../../../../../../models/chat/ChatToolResult";
import {wrapTool} from "../../../../tooling";

async function getCurrentPlayback(): Promise<SpotifyApi.CurrentPlaybackResponse> {
    const api = await createClient();
    try {
        const response = await api.getMyCurrentPlaybackState();

        return response.body;
    } catch (error: any) {
        console.error("Error occurred while getting current playback:", error.message);
        throw new Error(`Getting current playback failed: ${error.message}`);
    }
}

async function getCurrentPlaybackToolCall() {
    await checkIfEnabled();

    const result = await getCurrentPlayback();

    return <ChatToolResult>{
        text: `Currently playing ${result.currently_playing_type} on ${result.device?.name ?? "nothing"} ${result.device?.id ? `(${result.device.id})` : ""} at ${result.device?.volume_percent ?? 0}%`,
        references: result.item ? [{
            type: "resource-reference",
            name: result.item.name,
            link: result.item.external_urls.spotify,
            imageUrl: result.item.images ? "https://i.scdn.co/image/" + result.item.images[0].url : undefined,
        }] : []
    };
}

export function spotifyGetCurrentPlaybackTool() {
    return {
        id: "spotify.getCurrentPlayback",
        description: "Get what is currently playing on Spotify.",
        parameters: {},
        execute: wrapTool("spotify.getCurrentPlayback", getCurrentPlaybackToolCall),
    };
}