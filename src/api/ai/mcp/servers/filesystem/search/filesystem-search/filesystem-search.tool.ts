import {ResourceReference} from "../../../../../../../models/chat/ResourceReference";
import {ChatToolResult} from "../../../../../../../models/chat/ChatToolResult";
import {z} from "zod";
import {wrapTool} from "../../../../tooling";
import flexsearch from "flexsearch";
import {addDocuments} from "./add.documents";
import fs from "fs";

let index: flexsearch.Index;

export async function initializeSearchIndex() {
    index = new flexsearch.Index({
        tokenize: "forward",
        cache: 100,
    });

    await addDocuments(index);
}

async function searchFilesystem(query: string): Promise<{ id: string; content: string }[]> {
    const ids = await index.search({query}) as string[];

    return ids.map(id => ({
        id,
        content: fs.readFileSync(id).toString()
    }));
}

async function toolCall(input: any) {
    const result = await searchFilesystem(input.query);

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
