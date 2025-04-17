import {FeatureConfigurationInfo} from "./FeatureConfigurationInfo";

export enum BotanikaFeature {
    GoogleSearch = "Google Search",
    OpenAI = "OpenAI",
    Groq = "Groq",
    Ollama = "Ollama",
    Azure = "Azure",
    OpenRouter = "OpenRouter",
    Spotify = "Spotify",
}

export type ConfiguredApis = Record<BotanikaFeature, FeatureConfigurationInfo>;
