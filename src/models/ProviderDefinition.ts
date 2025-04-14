import {ConfiguredApi} from "./configuredApis";
import {ModelDefinition} from "./ModelDefinition";

export interface ProviderDefinition {
    requiredFeatures: ConfiguredApi[];
    models: ModelDefinition[];
}