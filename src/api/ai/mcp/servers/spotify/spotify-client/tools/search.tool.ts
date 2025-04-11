import {z} from "zod";
import {ResourceReference} from "../../../../../../../models/chat/ResourceReference";
import {ChatToolResult} from "../../../../../../../models/chat/ChatToolResult";
import {wrapTool} from "../../../../tooling";
import {SearchType} from "../models/SearchType";
import {checkIfEnabled, createClient} from "../createClient";
import {SpotifySearchOptions} from "../models/SpotifySearchOptions";

async function search(query: string, searchTypes: SearchType[]): Promise<SpotifyApi.SearchResponse> {
    const api = await createClient();
    try {
        const response = await api.search(query, searchTypes, {
            limit: 10,
        });

        return response.body;
    } catch (error: any) {
        console.error("Error occurred while searching:", error.message);
        throw new Error(`Search failed: ${error.message}`);
    }
}

async function searchToolCall(input: SpotifySearchOptions) {
    await checkIfEnabled();

    const result = await search(input.query, input.searchTypes);
    const refs = Object.keys(result).flatMap(key => {
        return result[key].items
            .filter(i => !!i)
            .map((i: any) => {
                const artists = i.artists ? i.artists.map(a => a.name).join(", ") : "Unknown";

                return <ResourceReference>{
                    type: "resource-reference",
                    name: artists + " - " + i.name,
                    link: i.external_urls?.spotify,
                    imageUrl: i.images ? i.images[0]?.url : null,
                    metadata: {
                        uri: i?.uri
                    }
                }
            })
    });

    return <ChatToolResult>{
        text: `${refs.length} Spotify search results`,
        references: refs
    };
}

export function spotifySearchTool() {
    return {
        id: "spotify.search",
        description: "Spotify search. Useful for when you need to search for music or podcasts.",
        parameters: {
            query: z.string().describe('What to search for'),
            searchTypes: z.array(z.nativeEnum(SearchType)).describe('What types to search for'),
        },
        execute: wrapTool("spotify.search", searchToolCall),
    };
}