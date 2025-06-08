import {TranslationKey} from "./translationKey";
import {Language} from "./language";
import {de} from "./lang/de";
import {en} from "./lang/en";
import {compute, signal} from "@targoninc/jess";

export const language = signal(Language.en);

const dicts: Record<Language, Record<TranslationKey, string>> = {
    [Language.de]: de,
    [Language.en]: en
};

export function t$(key: TranslationKey) {
    return compute(l => dicts[l][key] ?? key, language);
}

export function t(key: TranslationKey, lang = null) {
    return dicts[lang ?? language.value][key] ?? key;
}
