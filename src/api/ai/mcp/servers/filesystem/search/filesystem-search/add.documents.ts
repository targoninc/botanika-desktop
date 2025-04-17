import path from "node:path";
import * as os from "node:os";
import fs from "fs";
import {access, readdir, readFile } from "node:fs/promises";
import {CLI} from "../../../../../../CLI";
import MiniSearch from "minisearch";

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
    '.json', '.csv', '.xls', '.xlsx',
    '.ppt', '.pptx', '.odt', '.ods', '.odp'
];

const excludedDirectories = ['node_modules', '.git', 'dist', 'build'];

async function collectFilesFromDirectory(
    directory: string,
    files: string[],
    textFileExtensions: string[],
    sizeLimitMb: number,
): Promise<void> {
    const entries = await readdir(directory, {withFileTypes: true});

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        try {
            if (entry.isDirectory()) {
                if (entry.name.startsWith('.')) {
                    continue;
                }
                if (excludedDirectories.includes(entry.name)) {
                    continue;
                }
                await collectFilesFromDirectory(fullPath, files, textFileExtensions, sizeLimitMb);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (textFileExtensions.includes(ext)) {
                    const stats = await fs.promises.stat(fullPath);
                    if (stats.size > sizeLimitMb * 1024 * 1024) {
                        continue;
                    }

                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.error(`Error processing ${fullPath}: ${error}`);
        }
    }
}

async function collectFiles(sizeLimitMb: number): Promise<string[]> {
    const files = [];
    for (const dir of userDirectories) {
        try {
            await access(dir);
            await collectFilesFromDirectory(dir, files, textFileExtensions, sizeLimitMb);
        } catch (_: any) {
            CLI.warning(`Directory ${dir} is not accessible, skipping`);
        }
    }
    return files;
}

async function addBatchToIndex(index: MiniSearch, batch: string[]) {
    const documents = await Promise.all(batch.map(async (file) => {
        const content = await readFile(file, 'utf-8');
        return {
            id: file,
            title: path.basename(file),
            text: content,
            category: 'file',
        };
    }));
    await index.addAllAsync(documents);
}

export async function addDocuments(index: MiniSearch, sizeLimitMb = 10) {
    const files = await collectFiles(sizeLimitMb);
    CLI.debug(`Found ${files.length} files to index`);

    const batchSize = 10;
    let previousPercentDone = 0;

    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        await addBatchToIndex(index, batch);

        const percentDone = Math.round(((i + batch.length) / files.length) * 100);
        if (percentDone !== previousPercentDone) {
            CLI.debug(`Indexed ${percentDone}% of files`);
            previousPercentDone = percentDone;
        }
    }

    CLI.success(`Indexed ${files.length} files`);
}