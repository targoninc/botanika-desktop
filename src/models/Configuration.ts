export interface Configuration extends Record<string, any> {
    display_hotkeys: boolean;
    language: string;
    botname: string;
    displayname: string;
    userDescription: string;
    birthdate: string;
    provider: string;
    model: string;
    enableTts: boolean;
}