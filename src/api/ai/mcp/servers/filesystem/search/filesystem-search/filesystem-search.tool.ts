import { z } from "zod";
import { promises as fs, Stats } from "node:fs";
import path from "node:path";
import { FilesystemSearchResult, FilesystemSearchItem } from "./filesystem-search.models";
import { ResourceReference } from "../../../../../../../models/chat/ResourceReference";
import { ChatToolResult } from "../../../../../../../models/chat/ChatToolResult";
import { wrapTool } from "../../../../tooling";
import os from "node:os";
import lunr from "lunr";
import crypto from "crypto";
import { CLI } from "../../../../../../../api/CLI";

// Common user directories to search
const userDirectories = [
    path.join(os.homedir(), 'Documents'),
    path.join(os.homedir(), 'Downloads'),
    path.join(os.homedir(), 'Desktop'),
    path.join(os.homedir(), 'Pictures'),
    path.join(os.homedir(), 'Music'),
    path.join(os.homedir(), 'Videos')
];

// File extensions to search
const textFileExtensions = [
    '.txt', '.md', '.doc', '.docx', '.pdf', '.rtf',
    '.html', '.htm', '.xml', '.json', '.csv', '.xls', '.xlsx',
    '.ppt', '.pptx', '.odt', '.ods', '.odp'
];

// Path to store the index and document store
const appDataPath = process.env.APPDATA || (process.platform === 'darwin' 
    ? path.join(os.homedir(), 'Library', 'Application Support') 
    : path.join(os.homedir(), '.local', 'share'));
const indexDir = path.join(appDataPath, 'Botanika', 'search-index');
const indexPath = path.join(indexDir, 'lunr-index.json');
const documentsPath = path.join(indexDir, 'documents.json');

// In-memory cache of the index and documents
let searchIndex: lunr.Index | null = null;
let documentStore: Map<string, any> = new Map();
let indexLastUpdated: Date | null = null;
let isIndexing = false;

// Initialize the index directory
async function ensureIndexDirectory() {
    try {
        await fs.mkdir(indexDir, { recursive: true });
    } catch (error) {
        CLI.error('Error creating index directory: ' + error);
    }
}

// Load the index from disk if it exists
async function loadIndex(): Promise<boolean> {
    try {
        await ensureIndexDirectory();

        // Check if index files exist
        try {
            await fs.access(indexPath);
            await fs.access(documentsPath);
        } catch {
            CLI.log('Index files do not exist yet, will create new index');
            return false;
        }

        // Load index and documents
        const indexJson = await fs.readFile(indexPath, 'utf-8');
        const documentsJson = await fs.readFile(documentsPath, 'utf-8');

        searchIndex = lunr.Index.load(JSON.parse(indexJson));
        documentStore = new Map(Object.entries(JSON.parse(documentsJson)));

        // Get the last modified time of the index file
        const stats = await fs.stat(indexPath);
        indexLastUpdated = stats.mtime;

        CLI.log(`Loaded search index with ${documentStore.size} documents, last updated: ${indexLastUpdated}`);
        return true;
    } catch (error) {
        CLI.error('Error loading index:' + error);
        return false;
    }
}

// Save the index to disk
async function saveIndex() {
    try {
        if (!searchIndex) return;

        await ensureIndexDirectory();

        // Convert the document store map to an object for serialization
        const documentsObject = Object.fromEntries(documentStore);

        // Save the index and documents
        await fs.writeFile(indexPath, JSON.stringify(searchIndex));
        await fs.writeFile(documentsPath, JSON.stringify(documentsObject));

        // Update the last modified time
        const stats = await fs.stat(indexPath);
        indexLastUpdated = stats.mtime;

        CLI.log(`Saved search index with ${documentStore.size} documents`);
    } catch (error) {
        CLI.error('Error saving index:' + error);
    }
}

async function buildIndex(forceRebuild = false): Promise<void> {
    // Prevent concurrent indexing
    if (isIndexing) {
        CLI.log('Indexing already in progress, skipping');
        return;
    }

    isIndexing = true;

    try {
        if (!forceRebuild && searchIndex && indexLastUpdated) {
            const now = new Date();
            const hoursSinceLastUpdate = (now.getTime() - indexLastUpdated.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLastUpdate < 24) {
                CLI.log(`Index is recent (${hoursSinceLastUpdate.toFixed(2)} hours old), skipping rebuild`);
                isIndexing = false;
                return;
            }
        }

        CLI.log('Building search index...');
        if (forceRebuild || !searchIndex) {
            documentStore = new Map();
        }

        const filesToIndex = await collectFiles();
        CLI.log(`Found ${filesToIndex.length} files to index`);

        const builder = new lunr.Builder();
        builder.ref('id');
        builder.field('name', { boost: 10 });
        builder.field('path', { boost: 5 });
        builder.field('content');

        let processedCount = 0;
        for (const file of filesToIndex) {
            try {
                const id = crypto.createHash('md5').update(file.path).digest('hex');
                if (!forceRebuild && documentStore.has(id)) {
                    continue;
                }

                const content = await fs.readFile(file.path, 'utf-8');

                // Create document
                const document = {
                    id,
                    path: file.path,
                    name: path.basename(file.path),
                    content,
                    type: 'file',
                    modifiedTime: file.stats.mtime
                };

                // Add to index
                builder.add(document);

                // Store document metadata (without full content to save space)
                documentStore.set(id, {
                    path: document.path,
                    name: document.name,
                    type: document.type,
                    modifiedTime: document.modifiedTime,
                    // Store a preview of the content instead of the full content
                    contentPreview: content.length > 1000 ? content.substring(0, 1000) + '...' : content
                });

                processedCount++;
                if (processedCount % 100 === 0) {
                    CLI.log(`Indexing progress: ${processedCount}/${filesToIndex.length} files processed`);
                }
            } catch (error) {
                CLI.error(`Error indexing file ${file.path}: ${error}`);
            }
        }

        CLI.debug(`Building index...`);
        searchIndex = builder.build();
        CLI.info(`Index built`);

        await saveIndex();
        CLI.success(`Indexing complete, indexed ${documentStore.size} documents`);
    } catch (error) {
        CLI.error('Error building index: ' + error);
    } finally {
        isIndexing = false;
    }
}

async function collectFiles(): Promise<Array<{ path: string, stats: Stats }>> {
    const files: Array<{ path: string, stats: Stats }> = [];
    const dirPromises = [];

    for (const dir of userDirectories) {
        try {
            await fs.access(dir);
            dirPromises.push(collectFilesFromDirectory(dir, files));
        } catch (_: any) {
            CLI.log(`Directory ${dir} is not accessible, skipping`);
        }
    }

    await Promise.all(dirPromises);
    return files;
}

// Recursively collect files from a directory
async function collectFilesFromDirectory(directory: string, files: Array<{ path: string, stats: fs.Stats }>, depth = 0): Promise<void> {
    // Limit recursion depth
    if (depth > 5) return;

    try {
        const entries = await fs.readdir(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            try {
                if (entry.isDirectory()) {
                    // Skip hidden directories
                    if (entry.name.startsWith('.')) continue;

                    // Skip node_modules, .git, etc.
                    if (['node_modules', '.git', 'dist', 'build'].includes(entry.name)) continue;

                    // Recursively collect files from subdirectories
                    await collectFilesFromDirectory(fullPath, files, depth + 1);
                } else if (entry.isFile()) {
                    // Check if it's a text file we should index
                    const ext = path.extname(entry.name).toLowerCase();
                    if (textFileExtensions.includes(ext)) {
                        // Skip large files
                        const stats = await fs.stat(fullPath);
                        if (stats.size > 10 * 1024 * 1024) continue; // Skip files larger than 10MB

                        files.push({ path: fullPath, stats });
                    }
                }
            } catch (error) {
                CLI.error(`Error processing ${fullPath}: ${error}`);
            }
        }
    } catch (error) {
        CLI.error(`Error reading directory ${directory}: ${error}`);
    }
}

// Search the index
async function searchFilesystem(query: string): Promise<FilesystemSearchResult> {
    // Make sure the index is loaded
    if (!searchIndex) {
        const loaded = await loadIndex();
        if (!loaded) {
            // Build the index if it doesn't exist
            await buildIndex();
        }
    }

    // If still no index, return empty results
    if (!searchIndex) {
        CLI.error('Failed to load or build search index');
        return { items: [] };
    }

    try {
        // Perform the search
        const searchResults = searchIndex.search(query);

        // Map results to FilesystemSearchItem
        const items: FilesystemSearchItem[] = [];

        for (const result of searchResults) {
            const document = documentStore.get(result.ref);
            if (document) {
                // Create a snippet from the content preview
                let snippet = '';

                if (document.contentPreview) {
                    const contentLower = document.contentPreview.toLowerCase();
                    const queryLower = query.toLowerCase();
                    const index = contentLower.indexOf(queryLower);

                    if (index !== -1) {
                        // Extract a snippet around the match
                        const start = Math.max(0, index - 50);
                        const end = Math.min(document.contentPreview.length, index + query.length + 50);
                        snippet = document.contentPreview.substring(start, end);

                        // Add ellipsis if we're not at the beginning/end
                        if (start > 0) snippet = '...' + snippet;
                        if (end < document.contentPreview.length) snippet = snippet + '...';
                    } else {
                        // If the exact query isn't found, use the beginning of the content
                        snippet = document.contentPreview.substring(0, 100) + '...';
                    }
                } else {
                    snippet = 'File matched by name or path';
                }

                items.push({
                    path: document.path,
                    name: document.name,
                    snippet,
                    type: document.type,
                    modifiedTime: new Date(document.modifiedTime)
                });
            }
        }

        // Limit results
        return { items: items.slice(0, 20) };
    } catch (error) {
        CLI.error('Error searching index: ' + error);
        return { items: [] };
    }
}

// Trigger a background index update if needed
async function checkAndUpdateIndex() {
    if (!indexLastUpdated) {
        // If index has never been loaded, load it now
        await loadIndex();
    }

    if (!indexLastUpdated || isIndexStale()) {
        // Schedule index update in the background
        setTimeout(() => buildIndex(), 100);
    }
}

// Check if the index is stale (older than 24 hours)
function isIndexStale(): boolean {
    if (!indexLastUpdated) return true;

    const now = new Date();
    const hoursSinceLastUpdate = (now.getTime() - indexLastUpdated.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastUpdate > 24;
}

// Initialize the search index
export async function initializeSearchIndex(): Promise<void> {
    CLI.log('Initializing filesystem search index...');

    // Try to load the existing index
    const loaded = await loadIndex();

    if (!loaded) {
        // If loading failed, schedule a background index build
        CLI.log('No existing index found, scheduling background indexing...');
        setTimeout(() => buildIndex(), 1000);
    } else if (isIndexStale()) {
        // If the index is stale, schedule a background update
        CLI.log('Index is stale, scheduling background update...');
        setTimeout(() => buildIndex(), 5000);
    }
}

async function toolCall(input: any) {
    const result = await searchFilesystem(input.query);

    return <ChatToolResult>{
        text: `${result.items.length} filesystem search results`,
        references: result.items.map(item => {
            return <ResourceReference>{
                type: "resource-reference",
                name: item.name,
                link: `file://${item.path}`,
                snippet: item.snippet
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
