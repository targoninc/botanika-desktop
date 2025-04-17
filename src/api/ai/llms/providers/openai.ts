import {ModelDefinition} from "../../../../models/llms/ModelDefinition";

export function getOpenaiModels(): ModelDefinition[] {
    return [
        {
            id: "o4-mini",
            displayName: "o4-mini",
            supportsTools: true
        },
        {
            id: "o3-mini",
            displayName: "o3-mini",
            supportsTools: false
        },
        {
            id: "o3",
            displayName: "o3",
            supportsTools: true
        },
        {
            id: "o1-preview",
            displayName: "o1-preview",
            supportsTools: false
        },
        {
            id: "o1",
            displayName: "o1",
            supportsTools: false
        },
        {
            id: "o1-mini",
            displayName: "o1-mini",
            supportsTools: false
        },
        {
            id: "o1-pro",
            displayName: "o1-pro",
            supportsTools: false
        },
        {
            id: "gpt-4.1",
            displayName: "GPT-4.1",
            supportsTools: true
        },
        {
            id: "gpt-4.1-mini",
            displayName: "GPT-4.1 mini",
            supportsTools: true
        },
        {
            id: "gpt-4o",
            displayName: "GPT 4o",
            supportsTools: true
        },
        {
            id: "chatgpt-4o-latest",
            displayName: "ChatGPT 4o",
            supportsTools: true
        },
        {
            id: "gpt-4o-mini",
            displayName: "GPT 4o-mini",
            supportsTools: true
        },
        {
            id: "gpt-4o-search-preview",
            displayName: "GPT 4o-search-preview",
            supportsTools: true
        },
        {
            id: "gpt-4o-mini-search-preview",
            displayName: "GPT 4o-mini-search-preview",
            supportsTools: true
        },
    ];
}