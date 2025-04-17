import { ApiBase } from "./api.base";
import {Configuration} from "../../models/Configuration";
import {ChatContext} from "../../models/chat/ChatContext";
import {McpConfiguration} from "../../models/mcp/McpConfiguration";
import {McpServerConfig} from "../../models/mcp/McpServerConfig";
import {ConfiguredFeatures} from "../../models/ConfiguredFeatures";
import {ShortcutConfiguration} from "../../models/shortcuts/ShortcutConfiguration";
import {ProviderDefinition} from "../../models/ProviderDefinition";
import {ApiEndpoint} from "../../models/ApiEndpoints";

export class Api extends ApiBase {
    static getConfig() {
        return this.get<Configuration>(ApiEndpoint.CONFIG);
    }

    static getConfigKey<T>(key: string) {
        return this.get<T>(`${ApiEndpoint.CONFIG_KEY}${key}`);
    }

    static setConfigKey(key: string, value: any) {
        return this.put(`${ApiEndpoint.CONFIG_KEY}${key}`, { value });
    }

    static sendMessage(message: string, provider: string, model: string, chatId: string = null) {
        return this.stream(ApiEndpoint.CHAT, {
            message,
            provider,
            model,
            chatId
        });
    }

    static getChatIds() {
        return this.get<string[]>(ApiEndpoint.CHATS);
    }

    static getChat(chatId: string) {
        return this.get<ChatContext>(`${ApiEndpoint.CHAT_BY_ID}${chatId}`);
    }

    static deleteChat(chatId: string) {
        return this.delete(`${ApiEndpoint.CHAT_BY_ID}${chatId}`);
    }

    static getModels() {
        return this.get<Record<string, ProviderDefinition>>(ApiEndpoint.MODELS);
    }

    static getconfiguredFeatures() {
        return this.get<ConfiguredFeatures>(ApiEndpoint.CONFIGURED_APIS);
    }

    static getMcpConfig() {
        return this.get<McpConfiguration>(ApiEndpoint.MCP_CONFIG);
    }

    static addMcpServer(url: string, name: string) {
        return this.post(ApiEndpoint.MCP_SERVER, {
            url,
            name
        });
    }

    static deleteMcpServer(url: string) {
        return this.delete(`${ApiEndpoint.MCP_SERVER}?url=${encodeURIComponent(url)}`);
    }

    static updateMcpServer(mcpServerConfig: McpServerConfig) {
        return this.put(`${ApiEndpoint.MCP_SERVER}?url=${encodeURIComponent(mcpServerConfig.url)}`, mcpServerConfig);
    }

    static setEnvironmentVariable(key: string, value: string) {
        return this.post(ApiEndpoint.SET_ENVIRONMENT_VARIABLE, {
            key,
            value
        });
    }

    static getShortcutConfig() {
        return this.get<ShortcutConfiguration>(ApiEndpoint.SHORTCUT_CONFIG);
    }

    static setShortcutConfig(sc: ShortcutConfiguration) {
        return this.post(ApiEndpoint.SHORTCUT_CONFIG, sc);
    }

    static openAppDataPath() {
        return this.post(ApiEndpoint.OPEN_APP_DATA_PATH);
    }

    static getOpenAiKey() {
        return this.get<string>(ApiEndpoint.OPENAI_KEY);
    }

    static transcribe(formData: FormData) {
        return this.streamWithFormData(ApiEndpoint.TRANSCRIBE, formData, false);
    }
}
