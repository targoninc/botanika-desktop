import {checkIfEnabled, createClient} from "../createClient";
import {ChatToolResult} from "../../../../../../../models/chat/ChatToolResult";
import {wrapTool} from "../../../../tooling";

async function getProfile(): Promise<SpotifyApi.CurrentUsersProfileResponse> {
    const api = await createClient();
    try {
        const response = await api.getMe();

        return response.body;
    } catch (error: any) {
        console.error("Error occurred while getting profile:", error.message);
        throw new Error(`Getting profile failed: ${error.message}`);
    }
}

async function getProfileToolCall() {
    await checkIfEnabled();

    const result = await getProfile();
    const country = result.country ? `, ${result.country}` : "";

    return <ChatToolResult>{
        text: "Found profile info",
        references: [{
            type: "resource-reference",
            name: result.display_name,
            snippet: `${result.followers.total} followers${country}`,
            imageUrl: (result.images && result.images.length > 0) ? result.images[0].url : undefined,
            link: result.external_urls.spotify,
            metadata: result
        }]
    };
}

export function spotifyGetProfileTool() {
    return {
        id: "spotify.getProfile",
        description: "Get Spotify profile of the current user.",
        parameters: {},
        execute: wrapTool("spotify.getProfile", getProfileToolCall),
    };
}