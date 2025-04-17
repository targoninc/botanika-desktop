import {FeatureOption} from "./FeatureOption";

export interface FeatureConfigurationInfo {
    enabled: boolean;
    envVars: {
        key: string;
        isSet: boolean;
    }[];
    options: FeatureOption<any>[];
}