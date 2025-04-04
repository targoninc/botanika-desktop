import {z} from "zod";
import axios from "axios";
import {GoogleSearchResult} from "./google-search.models";
import {ResourceReference} from "../../../../../../../models/chat/ResourceReference";
import dotenv from "dotenv";
import {ChatToolResult} from "../../../../../../../models/chat/ChatToolResult";
import {getConfiguredApis} from "../../../../../../features/configuredFeatures";
import {ConfiguredApi} from "../../../../../../features/configuredApis";
import {wrapTool} from "../../../../tooling";

dotenv.config();

async function search(query: string): Promise<GoogleSearchResult> {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

        if (!apiKey || !searchEngineId) {
            throw new Error("Google API Key or Search Engine ID is not defined in environment variables.");
        }

        const url = `https://www.googleapis.com/customsearch/v1`;
        const response = await axios.get(url, {
            params: {
                key: apiKey,
                cx: searchEngineId,
                q: query
            }
        });

        return response.data as GoogleSearchResult;
    } catch (error: any) {
        console.error("Error occurred while searching:", error.message);
        throw new Error(`Search failed: ${error.message}`);
    }
}

async function toolCall(input: any) {
    if (!getConfiguredApis()[ConfiguredApi.GoogleSearch].enabled) {
        throw new Error("Google Search API is not enabled.");
    }

    const result = await search(input.query);
    return <ChatToolResult>{
        text: `${result.items.length} Google search results`,
        references: result.items.map(i => {
            return <ResourceReference>{
                type: "resource-reference",
                name: i.title,
                link: i.link,
                snippet: i.snippet,
                imageUrl: i.pagemap.cse_thumbnail?.length > 0 ? i.pagemap.cse_thumbnail[0].src : null
            }
        }),
    };
}

export function googleSearchTool() {
    return {
        id: "google.search-engine",
        description: "Web search. Useful for when you need to answer search questions. Input should be a search query.",
        parameters: {
            query: z.string().describe('The query to search for'),
        },
        execute: wrapTool("google.search-engine", toolCall),
    };
}