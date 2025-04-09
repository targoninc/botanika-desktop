import {z} from "zod";
import {ResourceReference} from "../../../../../../../models/chat/ResourceReference";
import dotenv from "dotenv";
import {ChatToolResult} from "../../../../../../../models/chat/ChatToolResult";
import {getConfiguredApis} from "../../../../../../features/configuredFeatures";
import {ConfiguredApi} from "../../../../../../features/configuredApis";
import {wrapTool} from "../../../../tooling";
import {SearchType} from "./searchType";
import {CLI} from "../../../../../../CLI";

const SpotifyWebApi = require("spotify-web-api-node");

dotenv.config();

let api: SpotifyWebApi;

async function createClient() {
    if (api) {
        return;
    }
    CLI.info("Creating Spotify client");
    api = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    const data = await api.clientCredentialsGrant();

    api.setAccessToken(data.body['access_token']);
}

async function search(query: string, searchTypes: SearchType[]): Promise<SpotifyApi.SearchResponse> {
    try {
        await createClient();

        const response = await api.search(query, searchTypes, {
            limit: 10,
        });

        return response.body;
    } catch (error: any) {
        console.error("Error occurred while searching:", error.message);
        throw new Error(`Search failed: ${error.message}`);
    }
}

async function checkIfEnabled() {
    const configuredApis = await getConfiguredApis();
    if (!configuredApis[ConfiguredApi.Spotify].enabled) {
        throw new Error("Spotify API is not enabled.");
    }
}

async function toolCall(input: any) {
    await checkIfEnabled();

    const result = await search(input.query, input.searchTypes);
    const refs = Object.keys(result).flatMap(key => {
        return result[key].items.map((i: any) => {
            return <ResourceReference>{
                type: "resource-reference",
                name: i.name,
                link: i.href,
                imageUrl: i.images ? i.images[0]?.url : null
            }
        })
    });

    return <ChatToolResult>{
        text: `${refs.length} Spotify search results`,
        references: refs,
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
        execute: wrapTool("spotify.search", toolCall),
    };
}