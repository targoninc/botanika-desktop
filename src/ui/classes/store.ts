import {Api} from "./api";
import {Configuration} from "../../models/Configuration";
import {language} from "./i8n/translation";
import {Language} from "./i8n/language";
import {signal} from "../lib/fjsc/src/signals";

export const activePage = signal<string>("chat");
export const configuration = signal<Configuration>({} as Configuration);
configuration.subscribe(c => {
    language.value = c.language as Language;
});

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