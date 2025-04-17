import path from "node:path";
import * as os from "node:os";
import fs from "fs";
import {access, readdir } from "node:fs/promises";
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
                await collectFilesFromDirectory(fullPath, files, textFileExtensions);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (textFileExtensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.error(`Error processing ${fullPath}: ${error}`);
        }
    }
}

async function collectFiles(): Promise<string[]> {
    const files = [];
    for (const dir of userDirectories) {
        try {
            await access(dir);
            await collectFilesFromDirectory(dir, files, textFileExtensions);
        } catch (_: any) {
            console.log(`Directory ${dir} is not accessible, skipping`);
        }
    }
    return files;
}

export async function addDocuments(index: MiniSearch, sizeLimitMb = 10) {
    const files = await collectFiles();
    CLI.debug(`Found ${files.length} files to index`);
    let previousPercentDone = 0;
    for (let i = 0; i < files.length; i++){
        const file = files[i];
        const stats = await fs.promises.stat(file);
        if (stats.size > sizeLimitMb * 1024 * 1024) {
            const inMb = stats.size / (1024 * 1024);
            CLI.debug(`Skipping ${file} because it's too large (${inMb} MB)`);
            continue;
        }

        const percentDone = Math.round((i / files.length) * 100);
        if (percentDone !== previousPercentDone) {
            CLI.debug(`Indexed ${percentDone}% of files`);
        }
        const content = await fs.promises.readFile(file, 'utf-8');

        index.add({
            id: file,
            title: path.basename(file),
            text: content,
            category: 'file'
        });
        previousPercentDone = percentDone;
    }
    CLI.success(`Indexed ${files.length} files`);
}