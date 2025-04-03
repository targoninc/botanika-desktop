export interface FeatureConfigurationInfo {
    enabled: boolean;
    envVars: {
        key: string;
        isSet: boolean;
    }[];
}