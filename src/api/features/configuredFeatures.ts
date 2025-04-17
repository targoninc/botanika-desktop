import {ConfiguredFeatures} from "../../models/ConfiguredFeatures";
import {FeatureConfigurationInfo} from "../../models/FeatureConfigurationInfo";
import {featureOptions} from "./featureOptions";
import {BotanikaFeature} from "../../models/BotanikaFeature";

function envSet(key: string) {
    return process.env[key] && process.env[key].trim().length > 0;
}

function envConfigurationInfo(feature: BotanikaFeature, ...envVarNames: string[]): FeatureConfigurationInfo {
    return {
        enabled: envVarNames.every(envSet),
        envVars: envVarNames.map(n => ({
            key: n,
            isSet: envSet(n)
        })),
        options: featureOptions[feature]
    };
}

async function urlReachable(url: string): Promise<boolean> {
    try {
        const response = await fetch(url);
        return response.ok;
    } catch (e) {
        return false;
    }
}

async function urlConfigurationInfo(feature: BotanikaFeature, url: string, envVarNames: string[] = []): Promise<FeatureConfigurationInfo> {
    return {
        enabled: await urlReachable(url),
        envVars: envVarNames.map(n => ({
            key: n,
            isSet: envSet(n)
        })),
        options: featureOptions[feature]
    };
}

export async function getConfiguredFeatures(): Promise<ConfiguredFeatures> {
    return {
        [BotanikaFeature.GoogleSearch]: envConfigurationInfo(BotanikaFeature.GoogleSearch, "GOOGLE_API_KEY", "GOOGLE_SEARCH_ENGINE_ID"),
        [BotanikaFeature.OpenAI]: envConfigurationInfo(BotanikaFeature.OpenAI, "OPENAI_API_KEY"),
        [BotanikaFeature.Groq]: envConfigurationInfo(BotanikaFeature.Groq, "GROQ_API_KEY"),
        [BotanikaFeature.Ollama]: await urlConfigurationInfo(BotanikaFeature.Ollama, process.env.OLLAMA_URL ?? "http://localhost:11434"),
        [BotanikaFeature.Azure]: envConfigurationInfo(BotanikaFeature.Azure, "AZURE_RESOURCE_NAME", "AZURE_API_KEY"),
        [BotanikaFeature.OpenRouter]: envConfigurationInfo(BotanikaFeature.OpenRouter, "OPENROUTER_API_KEY"),
        [BotanikaFeature.Spotify]: envConfigurationInfo(BotanikaFeature.Spotify, "SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET"),
    }
}

export async function featureEnabled(feature: BotanikaFeature): Promise<boolean> {
    return (await getConfiguredFeatures())[feature].enabled;
}