import {BotanikaFeature} from "../../models/BotanikaFeature";
import {SettingConfiguration} from "../../models/uiExtensions/SettingConfiguration";

export const featureOptions: Record<BotanikaFeature, SettingConfiguration[]> = {
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