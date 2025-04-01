import {Api} from "./api";
import {Configuration} from "../../models/Configuration";
import {language} from "./i8n/translation";
import {Language} from "./i8n/language";
import {signal} from "../lib/fjsc/src/signals";
import {ChatContext} from "../../models/chat/ChatContext";
import {ChatUpdate} from "../../models/chat/ChatUpdate";
import {terminator} from "../../models/chat/terminator";

export const activePage = signal<string>("chat");
export const configuration = signal<Configuration>({} as Configuration);
configuration.subscribe(c => {
    language.value = c.language as Language;
});
export const context = signal<ChatContext>({} as ChatContext);

export function initializeStore() {
    Api.getConfig().then(conf => {
        if (conf.data) {
            configuration.value = conf.data as Configuration;
        }
    });
}

export type Callback<Args extends unknown[]> = (...args: Args) => void;

export function target(e: Event) {
    return e.target as HTMLInputElement;
}

export function updateContext(update: ChatUpdate) {
    const c = context.value;
    if (c.id && c.id !== update.chatId) {
        return;
    }

    if (!c.id) {
        c.id = update.chatId;
    }

    if (!c.history) {
        c.history = [];
    }
    for (const message of update.messages) {
        const existingMsg = c.history.find(m => m.id === message.id);
        if (existingMsg) {
            c.history = c.history.map(m => {
                if (m.id === message.id) {
                    return message;
                }
                return m;
            });
        } else {
            c.history.push(message);
        }
    }
    c.history = c.history.sort((a, b) => a.time - b.time);
    context.value = {
        ...c
    };
}

export async function updateContextFromStream(body: ReadableStream<Uint8Array>) {
    const reader = body.getReader();

    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            break;
        }
        const decodedUpdates = new TextDecoder().decode(value).split(terminator).filter(s => s.length > 0);
        const lastUpdate = decodedUpdates.pop();
        if (!lastUpdate) {
            continue;
        }
        try {
            const update = JSON.parse(lastUpdate.trim());
            updateContext(update);
        } catch (e) {
            console.log("Error parsing update: ", lastUpdate, e.toString());
        }
    }
}