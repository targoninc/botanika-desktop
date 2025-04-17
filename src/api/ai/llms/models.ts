import {LanguageModelV1} from "ai"
import {groq} from "@ai-sdk/groq";
import {openai} from "@ai-sdk/openai";
import {azure} from "@ai-sdk/azure";
import {openrouter} from "@openrouter/ai-sdk-provider";
import {createOllama, ollama} from 'ollama-ai-provider';
import {LlmProvider} from "../../../models/llmProvider";
import {ProviderV1} from "@ai-sdk/provider";
import {ModelDefinition} from "../../../models/ModelDefinition";
import {getGroqModels} from "./providers/groq";
import {getOpenaiModels} from "./providers/openai";
import {getOllamaModels} from "./providers/ollama";
import {getAzureModels} from "./providers/azure";
import {getOpenrouterModels} from "./providers/openrouter";
import dotenv from "dotenv";
import {BotanikaFeature} from "../../../models/configuredApis";
import {ProviderDefinition} from "../../../models/ProviderDefinition";

dotenv.config();

export const providerMap: Record<LlmProvider, ProviderV1|any> = {
    [LlmProvider.groq]: groq,
    [LlmProvider.openai]: openai,
    [LlmProvider.ollama]: (modelName: string) => ollama(modelName, {
        simulateStreaming: true
    }),
    [LlmProvider.azure]: azure,
    [LlmProvider.openrouter]: openrouter
}

export function getModel(providerName: LlmProvider, model: string): LanguageModelV1 {
    const provider = providerMap[providerName];
    if (!provider) {
        throw new Error("Invalid LLM provider");
    }

    return provider(model);
}

export async function getAvailableModels(provider: string): Promise<ModelDefinition[]> {
    switch (provider) {
        case LlmProvider.groq:
            return getGroqModels();
        case LlmProvider.openai:
            return getOpenaiModels();
        case LlmProvider.ollama:
            return getOllamaModels();
        case LlmProvider.azure:
            return getAzureModels();
        case LlmProvider.openrouter:
            return getOpenrouterModels();
        default:
            throw new Error("Unsupported LLM provider");
    }
}

function getRequiredFeature(provider: LlmProvider): BotanikaFeature[] {
    switch (provider) {
        case LlmProvider.groq:
            return [BotanikaFeature.Groq];
        case LlmProvider.openai:
            return [BotanikaFeature.OpenAI];
        case LlmProvider.ollama:
            return [BotanikaFeature.Ollama];
        case LlmProvider.azure:
            return [BotanikaFeature.Azure];
        case LlmProvider.openrouter:
            return [BotanikaFeature.OpenRouter];
    }
}

export async function initializeLlms() {
    const availableProviders = Object.values(LlmProvider);
    const models: Record<string, ProviderDefinition> = {};
    for (const provider of availableProviders) {
        models[provider] = <ProviderDefinition>{
            requiredFeatures: getRequiredFeature(provider),
            models: await getAvailableModels(provider)
        };
    }
    return models;
}
