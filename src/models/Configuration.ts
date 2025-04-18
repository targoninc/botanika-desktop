import {BotanikaFeature} from "./features/BotanikaFeature";

export interface Configuration extends Record<string, any> {
    display_hotkeys: boolean;
    language: string;
    botname: string;
    botDescription: string;
    displayname: string;
    userDescription: string;
    birthdate: string;
    provider: string;
    model: string;
    enableTts: boolean;
    maxSteps: number;
    featureOptions: Record<BotanikaFeature, Record<string, any>>;
}