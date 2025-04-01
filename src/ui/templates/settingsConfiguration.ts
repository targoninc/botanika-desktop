export interface SettingsConfiguration {
    key: string,
    icon: string;
    label: string,
    description: string,
    type: "string" | "number" | "boolean" | "language",
}