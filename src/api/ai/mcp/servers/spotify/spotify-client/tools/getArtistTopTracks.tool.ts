import {checkIfEnabled, createClient} from "../createClient";
import {ChatToolResult} from "../../../../../../../models/chat/ChatToolResult";
import {wrapTool} from "../../../../tooling";
import {z} from "zod";
import {CLI} from "../../../../../../CLI";

async function getArtistTopTracks(artistId: string, countryCode: string): Promise<SpotifyApi.ArtistsTopTracksResponse> {
    const api = await createClient();
    try {
        CLI.debug(`Getting top tracks for artist ${artistId}`);
        const response = await api.getArtistTopTracks(artistId, countryCode ?? "US");

        return response.body;
    } catch (error: any) {
        console.error("Error occurred while getting artist top tracks:", error.message);
        throw new Error(`Getting artist top tracks failed: ${error.message}`);
    }
}

async function getArtistTopTracksToolCall(input: any) {
    await checkIfEnabled();

    const response = await getArtistTopTracks(input.artistId, input.countryCode);

    return <ChatToolResult>{
        text: `Found ${response.tracks.length} top tracks for artist`,
        references: response.tracks.map(track => ({
            type: "resource-reference",
            imageUrl: track.album?.images[0].url ?? undefined,
            name: track.name,
            link: track.external_urls.spotify,
            snippet: track.album ? `Part of album '${track.album.name}'` : undefined
        }))
    };
}

export function spotifyGetArtistTopTracksTool() {
    return {
        id: "spotify-getArtistTopTracks",
        description: "Get a list of Spotify top tracks for an artist",
        parameters: {
            artistId: z.string().describe("Spotify artist ID, format is base62"),
            countryCode: z.string().nullable().optional().describe("The country/territory where the tracks are most popular. (format: ISO 3166-1 alpha-2")
        },
        execute: wrapTool("spotify-getArtistTopTracks", getArtistTopTracksToolCall),
    };
}