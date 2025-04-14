import {FeatureConfigurationInfo} from "./FeatureConfigurationInfo";

export enum ConfiguredApi {
    GoogleSearch = "Google Search",
    OpenAI = "OpenAI",
    Groq = "Groq",
    Ollama = "Ollama",
    Azure = "Azure",
    OpenRouter = "OpenRouter",
    Spotify = "Spotify",
}

export type ConfiguredApis = Record<ConfiguredApi, FeatureConfigurationInfo>;
