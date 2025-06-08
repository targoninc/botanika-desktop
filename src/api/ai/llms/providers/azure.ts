import { ModelDefinition } from "../../../../models/llms/ModelDefinition";
import {ModelCapability} from "../../../../models/llms/ModelCapability";

export function getAzureModels(): ModelDefinition[] {
    return [
        {
            id: "gpt-4o",
            displayName: "GPT-4o (Azure)",
            capabilities: [ModelCapability.fileInput, ModelCapability.tools, ModelCapability.streaming]
        },
        {
            id: "gpt-4-turbo",
            displayName: "GPT-4 Turbo (Azure)",
            capabilities: [ModelCapability.fileInput, ModelCapability.tools, ModelCapability.streaming]
        },
        {
            id: "gpt-4",
            displayName: "GPT-4 (Azure)",
            capabilities: [ModelCapability.fileInput, ModelCapability.tools, ModelCapability.streaming]
        },
        {
            id: "gpt-35-turbo",
            displayName: "GPT-3.5 Turbo (Azure)",
            capabilities: [ModelCapability.fileInput, ModelCapability.tools, ModelCapability.streaming]
        }
    ];
}
