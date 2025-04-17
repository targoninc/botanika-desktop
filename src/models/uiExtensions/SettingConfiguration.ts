export interface SettingConfiguration {
    key: string,
    icon?: string;
    label: string,
    description: string,
    type: "string" | "number" | "boolean" | "language" | "date" | "long-string";
    validator?: (value: any) => string[];
}