import { ModelDefinition } from "../../../../models/modelDefinition";

export function getAzureModels(): ModelDefinition[] {
    return [
        {
            id: "gpt-4o",
            displayName: "GPT-4o (Azure)",
            supportsTools: true
        },
        {
            id: "gpt-4-turbo",
            displayName: "GPT-4 Turbo (Azure)",
            supportsTools: true
        },
        {
            id: "gpt-4",
            displayName: "GPT-4 (Azure)",
            supportsTools: true
        },
        {
            id: "gpt-35-turbo",
            displayName: "GPT-3.5 Turbo (Azure)",
            supportsTools: true
        }
    ];
}
