import {SettingConfiguration} from "../uiExtensions/SettingConfiguration";

export interface FeatureConfigurationInfo {
    enabled: boolean;
    envVars: {
        key: string;
        isSet: boolean;
    }[];
    options: SettingConfiguration[];
}