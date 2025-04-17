import {BotanikaFeature} from "../features/BotanikaFeature";
import {ModelDefinition} from "./ModelDefinition";

export interface ProviderDefinition {
    requiredFeatures: BotanikaFeature[];
    models: ModelDefinition[];
}