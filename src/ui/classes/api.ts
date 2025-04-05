import { ApiBase } from "./api.base";
import {Configuration} from "../../models/Configuration";
import {ChatContext} from "../../models/chat/ChatContext";
import {ModelDefinition} from "../../models/modelDefinition";
import {McpConfiguration} from "../../api/ai/mcp/models/McpConfiguration";
import {McpServerConfig} from "../../api/ai/mcp/models/McpServerConfig";
import {ConfiguredApis} from "../../api/features/configuredApis";
import {ShortcutConfiguration} from "../../models/shortcuts/ShortcutConfiguration";

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

    static getConfiguredApis() {
        return this.get<ConfiguredApis>(`/configuredApis`);
    }

    static getMcpConfig() {
        return this.get<McpConfiguration>("/mcpConfig");
    }

    static addMcpServer(url: string, name: string) {
        return this.post("/mcpServer", {
            url,
            name
        });
    }

    static deleteMcpServer(url: string) {
        return this.delete(`/mcpServer/${encodeURIComponent(url)}`);
    }

    static updateMcpServer(mcpServerConfig: McpServerConfig) {
        return this.put(`/mcpServer/${mcpServerConfig.url}`, mcpServerConfig);
    }

    static setEnvironmentVariable(key: string, value: string) {
        return this.post("/setEnvironmentVariable", {
            key,
            value
        });
    }

    static getShortcutConfig() {
        return this.get<ShortcutConfiguration>("/shortCutConfig");
    }

    static setShortcutConfig(sc: ShortcutConfiguration) {
        return this.post("/shortCutConfig", sc);
    }

    static openAppDataPath() {
        return this.post("/openAppDataPath");
    }
}