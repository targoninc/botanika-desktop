import {ResourceReference} from "../../../../../../../models/chat/ResourceReference";
import {ChatToolResult} from "../../../../../../../models/chat/ChatToolResult";
import {z} from "zod";
import {wrapTool} from "../../../../tooling";
import MiniSearch, {SearchResult} from "minisearch";
import {addDocuments} from "./add.documents";
import {appDataPath} from "../../../../../../appData";
import path from "node:path";
import fs from "fs";
import {CLI} from "../../../../../../CLI";
import { stat } from "node:fs/promises";

let index: MiniSearch;
const indexPath = path.join(appDataPath, 'filesystem-search-index.json');
const indexOptions = {
    fields: ['title', 'text'],
    storeFields: ['title', 'category']
};
const skipSizeInMb = 20;

export async function initializeSearchIndex() {
    if (fs.existsSync(indexPath)) {
        const indexStat = await stat(indexPath);
        if (indexStat.size < skipSizeInMb * 1024 * 1024) {
            CLI.debug(`Loading filesystem search index from ${indexPath}`);
            const json = fs.readFileSync(indexPath, 'utf-8');
            CLI.debug(`Read filesystem search index with ${json.length / 1024 / 1024} MB`);
            index = await MiniSearch.loadJSONAsync(json, indexOptions);
            CLI.success(`Loaded filesystem search index`);
            return;
        } else {
            CLI.debug(`Skipping cached search index because it is bigger than ${skipSizeInMb} MB`);
        }
    }

    index = new MiniSearch(indexOptions);

    await addDocuments(index, .2);
    const json = JSON.stringify(index);
    fs.writeFileSync(indexPath, json);
}

function searchFilesystem(query: string): SearchResult[] {
    return index.search(query);
}

async function toolCall(input: any) {
    if (!index) {
        await initializeSearchIndex();
    }
    const result = searchFilesystem(input.query);

    return <ChatToolResult>{
        text: `${result.length} filesystem search results`,
        references: result.map(item => {
            return <ResourceReference>{
                type: "resource-reference",
                name: item.id,
                link: `file://${item.id}`
            };
        }),
    };
}

export function filesystemSearchTool() {
    return {
        id: "filesystem.search",
        description: "Search for files and content on the local filesystem. Searches user documents, downloads, desktop, and other common folders.",
        parameters: {
            query: z.string().describe('The text to search for in filenames and file contents'),
        },
        execute: wrapTool("filesystem.search", toolCall),
    };
}
