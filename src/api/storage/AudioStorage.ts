import fs from "fs";
import {appDataPath} from "../appData";
import {CLI} from "../CLI";
import path from "node:path";

const folderName = "/audio";

export class AudioStorage {
    static async ensureDirectoryExists() {
        if (!fs.existsSync(appDataPath + folderName)) {
            fs.mkdirSync(appDataPath + folderName, {
                recursive: true
            });
        }
    }

    static async writeAudio(id: string, blob: Blob) {
        await AudioStorage.ensureDirectoryExists();
        CLI.debug(`Writing audio for ID ${id}`);

        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        fs.writeFile(appDataPath + `${folderName}/${id}.mp3`, buffer, (err: any) => {
            if (err) {
                CLI.error(`Error writing audio ${id}: ` + err.toString());
            }
        });
    }

    static async getLocalFileUrl(id: string) {
        return path.resolve(appDataPath + `${folderName}/${id}.mp3`);
    }

    static async deleteAudio(id: string) {
        await AudioStorage.ensureDirectoryExists();
        CLI.debug(`Deleting audio for ID ${id}`);
        fs.unlink(appDataPath + `${folderName}/` + id + ".mp3", (err: any) => {
            if (err) {
                CLI.error(`Error deleting audio ${id}: ` + err.toString());
            }
        });
    }
}