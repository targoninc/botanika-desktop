import {Api} from "./api";
import {Configuration} from "../../models/Configuration";
import {language} from "./i8n/translation";
import {Language} from "./i8n/language";
import {signal} from "../lib/fjsc/src/signals";
import {ChatContext} from "../../models/chat/ChatContext";
import {terminator} from "../../models/chat/terminator";
import {updateContext} from "../../models/updateContext";
import {INITIAL_CONTEXT} from "../../models/chat/initialContext";
import {ModelDefinition} from "../../models/modelDefinition";
import {McpConfiguration} from "../../api/ai/mcp/models/McpConfiguration";
import {playAudio} from "./audio";
import {ChatUpdate} from "../../models/chat/ChatUpdate";

export const activePage = signal<string>("chat");
export const configuration = signal<Configuration>({} as Configuration);
configuration.subscribe(c => {
    language.value = c.language as Language;
});
export const context = signal<ChatContext>(INITIAL_CONTEXT);
export const chats = signal<ChatContext[]>([]);
export const availableModels = signal<Record<string, ModelDefinition[]>>({});
export const mcpConfig = signal<McpConfiguration>({} as McpConfiguration);
export const currentlyPlayingAudio = signal<string>(null);

export function initializeStore() {
    Api.getConfig().then(conf => {
        if (conf.data) {
            configuration.value = conf.data as Configuration;
        }
    });

    Api.getModels().then(m => {
        if (m.data) {
            availableModels.value = m.data as Record<string, ModelDefinition[]>;
        }
    });

    Api.getMcpConfig().then(mcpConf => {
        if (mcpConf.data) {
            mcpConfig.value = mcpConf.data as McpConfiguration;
        }
    });

    loadChats();
}

export function loadChats() {
    chats.value = [];
    Api.getChatIds().then(async chatIds => {
        if (!chatIds.success) {
            return;
        }
        for (const chatId of chatIds.data) {
            const chatContext = await Api.getChat(chatId);
            if (chatContext.success) {
                chats.value = [...chats.value, chatContext.data as ChatContext].sort((a, b) => b.createdAt - a.createdAt);
            }
        }
    });
}

export type Callback<Args extends unknown[]> = (...args: Args) => void;

export function target(e: Event) {
    return e.target as HTMLInputElement;
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
            const update = JSON.parse(lastUpdate.trim()) as ChatUpdate;
            updateContext(context.value, update);
            const cs = chats.value;
            if (!cs.find(c => c.id === update.chatId)) {
                loadChats();
            } else {
                chats.value = chats.value.map(c => {
                    if (c.id === update.chatId) {
                        updateContext(c, update);
                    }
                    return c;
                });
            }

            const playableMessage = update.messages?.find(m => m.hasAudio);
            if (playableMessage) {
                playAudio(playableMessage.id).then();
            }
        } catch (e) {
            console.log("Error parsing update: ", lastUpdate, e.toString());
        }
    }
}

export function activateChat(chat: ChatContext) {
    context.value = chat;
}

export function deleteChat(chatId: string) {
    Api.deleteChat(chatId).then(() => {
        if (context.value.id === chatId) {
            context.value = INITIAL_CONTEXT;
        }
        chats.value = [...chats.value].filter(c => c.id !== chatId);
    });
}