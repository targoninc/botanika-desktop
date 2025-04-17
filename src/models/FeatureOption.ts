export interface FeatureOption<T> {
    key: string;
    required: boolean;
    defaultValue?: T;
    validator?: (value: T) => string[];
}