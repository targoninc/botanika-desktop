import {FeatureConfigurationInfo} from "../../models/FeatureConfigurationInfo";

export enum ConfiguredApi {
    GoogleSearch = "Google Search",
    OpenAI = "OpenAI",
    Groq = "Groq",
    Ollama = "Ollama",
    Azure = "Azure",
}

export type ConfiguredApis = Record<ConfiguredApi, FeatureConfigurationInfo>;
