import {LanguageModelV1} from "ai"
import {groq} from "@ai-sdk/groq";
import {openai} from "@ai-sdk/openai";
import {LlmProvider} from "../../../models/llmProvider";
import {ProviderV1} from "@ai-sdk/provider";
import {getGroqModels} from "./providers/groq";
import {ModelDefinition} from "../../../models/modelDefinition";
import {getOpenaiModels} from "./providers/openai";

export const providerMap: Record<LlmProvider, ProviderV1> = {
    [LlmProvider.groq]: groq,
    [LlmProvider.openai]: openai
}

export function getModel(providerName: LlmProvider, model: string): LanguageModelV1 {
    const provider = providerMap[providerName];
    if (!provider) {
        throw new Error("Invalid LLM provider");
    }

    return provider.languageModel(model);
}

export async function getAvailableModels(provider: string): Promise<ModelDefinition[]> {
    switch (provider) {
        case LlmProvider.groq:
            return getGroqModels();
        case LlmProvider.openai:
            return getOpenaiModels();
        default:
            throw new Error("Unsupported LLM provider");
    }
}

export async function initializeLlms() {
    const availableProviders = Object.values(LlmProvider);
    const models: Record<string, ModelDefinition[]> = {};
    for (const provider of availableProviders) {
        models[provider] = await getAvailableModels(provider);
    }
    return models;
}
