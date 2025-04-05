import {ConfiguredApi} from "../api/features/configuredApis";
import {ModelDefinition} from "./ModelDefinition";

export interface ProviderDefinition {
    requiredFeatures: ConfiguredApi[];
    models: ModelDefinition[];
}