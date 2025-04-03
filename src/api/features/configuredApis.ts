import {FeatureConfigurationInfo} from "../../models/FeatureConfigurationInfo";

export enum ConfiguredApi {
    GoogleSearch = "Google Search",
    OpenAI = "OpenAI",
    Groq = "Groq",
}

export type ConfiguredApis = Record<ConfiguredApi, FeatureConfigurationInfo>;