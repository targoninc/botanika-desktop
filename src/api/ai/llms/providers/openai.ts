import {ModelDefinition} from "../../../../models/llms/ModelDefinition";
import {ModelCapability} from "../../../../models/llms/ModelCapability";

export function getOpenaiModels(): ModelDefinition[] {
    return [
        {
            id: "o4-mini",
            displayName: "o4-mini",
            capabilities: [ModelCapability.fileInput, ModelCapability.streaming, ModelCapability.tools]
        },
        {
            id: "o3-mini",
            displayName: "o3-mini",
            capabilities: [ModelCapability.streaming]
        },
        {
            id: "o3",
            displayName: "o3",
            capabilities: [ModelCapability.fileInput, ModelCapability.streaming, ModelCapability.tools]
        },
        {
            id: "o1-preview",
            displayName: "o1-preview",
            capabilities: [ModelCapability.fileInput, ModelCapability.streaming, ModelCapability.tools]
        },
        {
            id: "o1",
            displayName: "o1",
            capabilities: [ModelCapability.fileInput, ModelCapability.streaming, ModelCapability.tools]
        },
        {
            id: "o1-pro",
            displayName: "o1-pro",
            capabilities: [ModelCapability.fileInput, ModelCapability.tools]
        },
        {
            id: "gpt-4.1",
            displayName: "GPT-4.1",
            capabilities: [ModelCapability.fileInput, ModelCapability.tools, ModelCapability.streaming]
        },
        {
            id: "gpt-4.1-mini",
            displayName: "GPT-4.1 mini",
            capabilities: [ModelCapability.fileInput, ModelCapability.tools, ModelCapability.streaming]
        },
        {
            id: "gpt-4o",
            displayName: "GPT 4o",
            capabilities: [ModelCapability.fileInput, ModelCapability.tools, ModelCapability.streaming]
        },
        {
            id: "chatgpt-4o-latest",
            displayName: "ChatGPT 4o",
            capabilities: [ModelCapability.fileInput, ModelCapability.streaming]
        },
        {
            id: "gpt-4o-mini",
            displayName: "GPT 4o-mini",
            capabilities: [ModelCapability.fileInput, ModelCapability.tools, ModelCapability.streaming]
        },
    ];
}