import {FeatureConfigurationInfo} from "../../models/FeatureConfigurationInfo";
import {ConfiguredApi, ConfiguredApis} from "./configuredApis";

function envSet(key: string) {
    return process.env[key] && process.env[key].trim().length > 0;
}

function envConfigurationInfo(...envVarNames: string[]): FeatureConfigurationInfo {
    return {
        enabled: envVarNames.every(envSet),
        envVars: envVarNames.map(n => ({
            key: n,
            isSet: envSet(n)
        }))
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

async function urlConfigurationInfo(url: string, envVarNames: string[] = []): Promise<FeatureConfigurationInfo> {
    return {
        enabled: await urlReachable(url),
        envVars: envVarNames.map(n => ({
            key: n,
            isSet: envSet(n)
        }))
    };
}

export async function getConfiguredApis(): Promise<ConfiguredApis> {
    return {
        [ConfiguredApi.GoogleSearch]: envConfigurationInfo("GOOGLE_API_KEY", "GOOGLE_SEARCH_ENGINE_ID"),
        [ConfiguredApi.OpenAI]: envConfigurationInfo("OPENAI_API_KEY"),
        [ConfiguredApi.Groq]: envConfigurationInfo("GROQ_API_KEY"),
        [ConfiguredApi.Ollama]: await urlConfigurationInfo(process.env.OLLAMA_URL ?? "http://localhost:11434"),
        [ConfiguredApi.Azure]: envConfigurationInfo("AZURE_RESOURCE_NAME", "AZURE_API_KEY"),
        [ConfiguredApi.OpenRouter]: envConfigurationInfo("OPENROUTER_API_KEY"),
        [ConfiguredApi.Spotify]: envConfigurationInfo("SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET"),
    }
}
