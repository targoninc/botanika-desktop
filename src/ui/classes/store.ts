import {Api} from "./api";
import {Configuration} from "../../models/Configuration";
import {language} from "./i8n/translation";
import {Language} from "./i8n/language";
import {signal} from "../lib/fjsc/src/signals";
import {ChatContext} from "../../models/chat/ChatContext";
import {terminator} from "../../models/chat/terminator";
import {updateContext} from "../../models/updateContext";
import {INITIAL_CONTEXT} from "../../models/chat/initialContext";
import {McpConfiguration} from "../../models/mcp/McpConfiguration";
import {playAudio} from "./audio";
import {ChatUpdate} from "../../models/chat/ChatUpdate";
import {ShortcutConfiguration} from "../../models/shortcuts/ShortcutConfiguration";
import {defaultShortcuts} from "../../models/shortcuts/defaultShortcuts";
import {ProviderDefinition} from "../../models/ProviderDefinition";
import {ConfiguredFeatures} from "../../models/ConfiguredFeatures";
import {toast} from "./ui";
import {ToastType} from "../enums/ToastType";

export const activePage = signal<string>("chat");
export const configuration = signal<Configuration>({} as Configuration);
export const chatContext = signal<ChatContext>(INITIAL_CONTEXT);
export const chats = signal<ChatContext[]>([]);
export const availableModels = signal<Record<string, ProviderDefinition>>({});
export const mcpConfig = signal<McpConfiguration>({} as McpConfiguration);
export const configuredFeatures = signal<ConfiguredFeatures>({} as ConfiguredFeatures);
export const currentlyPlayingAudio = signal<string>(null);
export const shortCutConfig = signal<ShortcutConfiguration>(defaultShortcuts);
export const currentText = signal<string>("");

export function initializeStore() {
    configuration.subscribe(c => {
        language.value = c.language as Language;
    });

    shortCutConfig.subscribe(async (sc, changed) => {
        if (!changed) {
            return;
        }
        await Api.setShortcutConfig(sc);
    });

    Api.getConfig().then(conf => {
        if (conf.data) {
            configuration.value = conf.data as Configuration;
        }
    });

    Api.getModels().then(m => {
        if (m.data) {
            availableModels.value = m.data as Record<string, ProviderDefinition>;
        }
    });

    Api.getMcpConfig().then(mcpConf => {
        if (mcpConf.data) {
            mcpConfig.value = mcpConf.data as McpConfiguration;
        }
    });

    loadconfiguredFeatures();

    Api.getShortcutConfig().then(sc => {
        if (sc.data) {
            shortCutConfig.value = sc.data as ShortcutConfiguration;
        }
    });

    loadChats();
}

export function loadconfiguredFeatures() {
    Api.getconfiguredFeatures().then(res => {
        if (res.data) {
            configuredFeatures.value = res.data as ConfiguredFeatures;
        }
    });
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
        let update: ChatUpdate;
        try {
            update = JSON.parse(lastUpdate.trim());
        } catch (e) {
            console.log("Error parsing update: ", lastUpdate, e.toString());
            continue;
        }

        if (update.error) {
            toast(update.error, null, ToastType.negative);
            continue;
        }

        updateContext(chatContext.value, update, chatContext);
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
        const isLast = playableMessage && update.messages.pop().id === playableMessage.id;
        if (playableMessage && isLast) {
            playAudio(playableMessage.id).then();
        }
    }
}

export function activateChat(chat: ChatContext) {
    chatContext.value = chat;
}

export function deleteChat(chatId: string) {
    Api.deleteChat(chatId).then(() => {
        loadChats();
        if (chatContext.value.id === chatId || !chatContext.value.id) {
            chatContext.value = INITIAL_CONTEXT;
        }
    });
}