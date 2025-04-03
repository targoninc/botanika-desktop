export interface Configuration extends Record<string, any> {
    display_hotkeys: boolean;
    language: string;
    displayname: string;
    userDescription: string;
    birthdate: string;
    provider: string;
    model: string;
    enableTts: boolean;
}