import { ApiBase } from "./api.base";
import {Configuration} from "../../models/Configuration";

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

    static sendMessage(message: string, chatId: string = null) {
        return this.stream(`/chat`, {
            message,
            chatId
        });
    }
}