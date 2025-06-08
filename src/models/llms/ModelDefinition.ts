import {ModelCapability} from "./ModelCapability";

export interface ModelDefinition {
    id: string,
    displayName: string,
    capabilities: ModelCapability[],
}