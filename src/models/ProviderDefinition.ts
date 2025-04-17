import {BotanikaFeature} from "./configuredApis";
import {ModelDefinition} from "./ModelDefinition";

export interface ProviderDefinition {
    requiredFeatures: BotanikaFeature[];
    models: ModelDefinition[];
}