import {ModelDefinition} from "../../../../models/llms/ModelDefinition";
import {ModelCapability} from "../../../../models/llms/ModelCapability";

export function getGroqModels(): ModelDefinition[] {
    return [
        {
            id: "llama-3.2-3b-preview",
            displayName: "llama-3.2-3b-preview",
            capabilities: [ModelCapability.streaming]
        },
        {
            id: "meta-llama/llama-4-scout-17b-16e-instruct",
            displayName: "meta-llama/llama-4-scout-17b-16e-instruct",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput, ModelCapability.tools]
        },
        {
            id: "llama-3.2-90b-vision-preview",
            displayName: "llama-3.2-90b-vision-preview",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput]
        },
        {
            id: "llama-3.3-70b-versatile",
            displayName: "llama-3.3-70b-versatile",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput, ModelCapability.tools]
        },
        {
            id: "llama3-8b-8192",
            displayName: "llama3-8b-8192",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput]
        },
        {
            id: "llama-3.1-8b-instant",
            displayName: "llama-3.1-8b-instant",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput, ModelCapability.tools]
        },
        {
            id: "qwen-2.5-coder-32b",
            displayName: "qwen-2.5-coder-32b",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput, ModelCapability.tools]
        },
        {
            id: "llama-guard-3-8b",
            displayName: "llama-guard-3-8b",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput]
        },
        {
            id: "llama-3.2-1b-preview",
            displayName: "llama-3.2-1b-preview",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput]
        },
        {
            id: "llama-3.3-70b-specdec",
            displayName: "llama-3.3-70b-specdec",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput]
        },
        {
            id: "qwen-qwq-32b",
            displayName: "qwen-qwq-32b",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput, ModelCapability.tools]
        },
        {
            id: "allam-2-7b",
            displayName: "allam-2-7b",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput]
        },
        {
            id: "gemma2-9b-it",
            displayName: "gemma2-9b-it",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput, ModelCapability.tools]
        },
        {
            id: "qwen-2.5-32b",
            displayName: "qwen-2.5-32b",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput, ModelCapability.tools]
        },
        {
            id: "llama-3.2-11b-vision-preview",
            displayName: "llama-3.2-11b-vision-preview",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput]
        },
        {
            id: "mistral-saba-24b",
            displayName: "mistral-saba-24b",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput]
        },
        {
            id: "deepseek-r1-distill-qwen-32b",
            displayName: "deepseek-r1-distill-qwen-32b",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput, ModelCapability.tools]
        },
        {
            id: "deepseek-r1-distill-llama-70b",
            displayName: "deepseek-r1-distill-llama-70b",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput, ModelCapability.tools]
        },
        {
            id: "llama3-70b-8192",
            displayName: "llama3-70b-8192",
            capabilities: [ModelCapability.streaming, ModelCapability.fileInput]
        },
    ];
}