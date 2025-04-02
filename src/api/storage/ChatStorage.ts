import {ChatContext} from "../../models/chat/ChatContext";
import fs from "fs";
import {appDataPath} from "../appData";
import {CLI} from "../CLI";

export class ChatStorage {
    static async ensureDirectoryExists() {
        if (!fs.existsSync(appDataPath + "/chats")) {
            fs.mkdirSync(appDataPath + "/chats", {
                recursive: true
            });
        }
    }

    static async writeChatContext(chatId: string, chat: ChatContext) {
        await ChatStorage.ensureDirectoryExists();
        CLI.debug(`Writing chat context for ID ${chatId}`);
        fs.writeFile(appDataPath + "/chats/" + chatId + ".json", JSON.stringify(chat), (err) => {
            if (err) {
                CLI.error(`Error writing chat ${chatId}: ` + err.toString());
            }
        });
    }

    static async readChatContext(chatId: string): Promise<ChatContext> {
        await ChatStorage.ensureDirectoryExists();
        return new Promise((resolve, reject) => {
            fs.readFile(appDataPath + "/chats/" + chatId + ".json", (err, data) => {
                if (err) {
                    CLI.error(`Error reading chat ${chatId}: ` + err.toString());
                    reject(err);
                } else {
                    resolve(JSON.parse(data.toString()));
                }
            });
        });
    }

    static async deleteChatContext(chatId: string) {
        await ChatStorage.ensureDirectoryExists();
        fs.unlink(appDataPath + "/chats/" + chatId + ".json", (err) => {
            if (err) {
                CLI.error(`Error deleting chat ${chatId}: ` + err.toString());
            }
        });
    }

    static async getChatIds(): Promise<string[]> {
        await ChatStorage.ensureDirectoryExists();
        return new Promise((resolve, reject) => {
            fs.readdir(appDataPath + "/chats", (err, files) => {
                if (err) {
                    CLI.error("Error reading chat directory: " + err.toString());
                    reject(err);
                } else {
                    const ids = files.filter(f => f.endsWith(".json"));
                    CLI.debug(`Found ${ids.length} chats`);
                    resolve(ids.map(id => id.split(".")[0]));
                }
            });
        });
    }
}