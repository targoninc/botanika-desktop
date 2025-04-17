import {ResourceReference} from "../../../../../../../models/chat/ResourceReference";
import {ChatToolResult} from "../../../../../../../models/chat/ChatToolResult";
import {z} from "zod";
import {wrapTool} from "../../../../tooling";
import MiniSearch, {SearchResult} from "minisearch";
import {addDocuments} from "./add.documents";
import {appDataPath} from "../../../../../../appData";
import path from "node:path";
import fs from "fs";

let index: MiniSearch;
const indexPath = path.join(appDataPath, 'filesystem-search-index.json');
const indexOptions = {
    fields: ['title', 'text'],
    storeFields: ['title', 'category']
};

export async function initializeSearchIndex() {
    if (fs.existsSync(indexPath)) {
        const json = fs.readFileSync(indexPath, 'utf-8');
        index = MiniSearch.loadJSON(json, indexOptions);
        return;
    }

    index = new MiniSearch(indexOptions);

    await addDocuments(index, 2);
    const json = JSON.stringify(index);
    fs.writeFileSync(indexPath, json);
}

function searchFilesystem(query: string): SearchResult[] {
    return index.search(query);
}

async function toolCall(input: any) {
    const result = searchFilesystem(input.query);

    return <ChatToolResult>{
        text: `${result.length} filesystem search results`,
        references: result.map(item => {
            console.log(item);

            return <ResourceReference>{
                type: "resource-reference",
                name: item.id,
                link: `file://${item.id}`,
                snippet: item.text?.substring(0, 100)
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
