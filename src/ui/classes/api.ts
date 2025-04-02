import { ApiBase } from "./api.base";
import {Configuration} from "../../models/Configuration";
import {ChatContext} from "../../models/chat/ChatContext";
import {ModelDefinition} from "./modelDefinition";

export class Api extends ApiBase {
    static getConfig() {
        return this.get<Configuration>("/config");
    }

    static getConfigKey<T>(key: string) {
        return this.get<T>(`/config/${key}`);
    }

    static setConfigKey(key: string, value: any) {
        return this.put(`/config/${key}`, { value });
    }

    static sendMessage(message: string, provider: string, model: string, chatId: string = null) {
        return this.stream(`/chat`, {
            message,
            provider,
            model,
            chatId
        });
    }

    static getChatIds() {
        return this.get<string[]>("/chats");
    }

    static getChat(chatId: string) {
        return this.get<ChatContext>(`/chat/${chatId}`);
    }

    static deleteChat(chatId: string) {
        return this.delete(`/chat/${chatId}`);
    }

    static getModels() {
        return this.get<Record<string, ModelDefinition[]>>(`/models`);
    }
}