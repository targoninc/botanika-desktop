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

export function getConfiguredApis(): ConfiguredApis {
    return {
        [ConfiguredApi.GoogleSearch]: envConfigurationInfo("GOOGLE_API_KEY", "GOOGLE_SEARCH_ENGINE_ID"),
        [ConfiguredApi.OpenAI]: envConfigurationInfo("OPENAI_API_KEY"),
        [ConfiguredApi.Groq]: envConfigurationInfo("GROQ_API_KEY"),
    }
}