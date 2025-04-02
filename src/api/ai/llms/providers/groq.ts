import { ModelDefinition } from "../../../../models/modelDefinition";

export function getGroqModels(): ModelDefinition[] {
    return [
        {
            id: "llama-3.2-3b-preview",
            displayName: "llama-3.2-3b-preview",
            supportsTools: false,
        },
        {
            id: "llama-3.2-90b-vision-preview",
            displayName: "llama-3.2-90b-vision-preview",
            supportsTools: false,
        },
        {
            id: "llama-3.3-70b-versatile",
            displayName: "llama-3.3-70b-versatile",
            supportsTools: true,
        },
        {
            id: "llama3-8b-8192",
            displayName: "llama3-8b-8192",
            supportsTools: false,
        },
        {
            id: "llama-3.1-8b-instant",
            displayName: "llama-3.1-8b-instant",
            supportsTools: true,
        },
        {
            id: "qwen-2.5-coder-32b",
            displayName: "qwen-2.5-coder-32b",
            supportsTools: true,
        },
        {
            id: "llama-guard-3-8b",
            displayName: "llama-guard-3-8b",
            supportsTools: false,
        },
        {
            id: "llama-3.2-1b-preview",
            displayName: "llama-3.2-1b-preview",
            supportsTools: false,
        },
        {
            id: "llama-3.3-70b-specdec",
            displayName: "llama-3.3-70b-specdec",
            supportsTools: false,
        },
        {
            id: "qwen-qwq-32b",
            displayName: "qwen-qwq-32b",
            supportsTools: true,
        },
        {
            id: "allam-2-7b",
            displayName: "allam-2-7b",
            supportsTools: false,
        },
        {
            id: "gemma2-9b-it",
            displayName: "gemma2-9b-it",
            supportsTools: true,
        },
        {
            id: "qwen-2.5-32b",
            displayName: "qwen-2.5-32b",
            supportsTools: true,
        },
        {
            id: "llama-3.2-11b-vision-preview",
            displayName: "llama-3.2-11b-vision-preview",
            supportsTools: false,
        },
        {
            id: "mistral-saba-24b",
            displayName: "mistral-saba-24b",
            supportsTools: false,
        },
        {
            id: "deepseek-r1-distill-qwen-32b",
            displayName: "deepseek-r1-distill-qwen-32b",
            supportsTools: true,
        },
        {
            id: "deepseek-r1-distill-llama-70b",
            displayName: "deepseek-r1-distill-llama-70b",
            supportsTools: true,
        },
        {
            id: "llama3-70b-8192",
            displayName: "llama3-70b-8192",
            supportsTools: false,
        },
    ];
}