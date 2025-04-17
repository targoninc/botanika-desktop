import {BotanikaFeature} from "../../models/configuredApis";
import {FeatureOption} from "../../models/FeatureOption";

export const featureOptions: Record<BotanikaFeature, FeatureOption<any>[]> = {
    [BotanikaFeature.OpenAI]: [
        {
            key: "ttsModel",
            defaultValue: "gpt-4o-mini-transcribe",
            required: false,
            validator: value => ["gpt-4o-mini-transcribe", "gpt-4o-transcribe", "whisper"].includes(value) ? [] : ["Not a valid model"]
        }
    ],
    [BotanikaFeature.GoogleSearch]: [],
    [BotanikaFeature.Groq]: [],
    [BotanikaFeature.Ollama]: [],
    [BotanikaFeature.Azure]: [],
    [BotanikaFeature.OpenRouter]: [],
    [BotanikaFeature.Spotify]: []
};