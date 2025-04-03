import {FeatureConfigurationInfo} from "../../models/FeatureConfigurationInfo";
import {ConfiguredApi, ConfiguredApis} from "./configuredApis";

function envSet(key: string) {
    return process.env[key] !== undefined && process.env[key].trim() !== "";
}

function envConfigurationInfo(...envVarNames: string[]): FeatureConfigurationInfo {
    return {
        enabled: envVarNames.every(envSet),
        envVarNames
    };
}

export function getConfiguredApis(): ConfiguredApis {
    return {
        [ConfiguredApi.GoogleSearch]: envConfigurationInfo("GOOGLE_API_KEY", "GOOGLE_SEARCH_ENGINE_ID"),
        [ConfiguredApi.OpenAI]: envConfigurationInfo("OPENAI_API_KEY"),
        [ConfiguredApi.Groq]: envConfigurationInfo("GROQ_API_KEY"),
    }
}