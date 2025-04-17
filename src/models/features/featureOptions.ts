import {BotanikaFeature} from "./BotanikaFeature";
import {SettingConfiguration} from "../uiExtensions/SettingConfiguration";

export const featureOptions: Record<BotanikaFeature, SettingConfiguration[]> = {
    [BotanikaFeature.OpenAI]: [
        {
            key: "ttsModel",
            icon: "transcribe",
            description: "Which OpenAI transcription model to use.",
            label: "Transcription Model",
            type: "string",
            validator: value => {
                const modelOptions = ["gpt-4o-mini-transcribe", "gpt-4o-transcribe", "whisper"];
                return modelOptions.includes(value) || value === '' ? [] : [`Not a valid model, must be one of ${modelOptions.join(",")}`];
            }
        }
    ],
    [BotanikaFeature.GoogleSearch]: [],
    [BotanikaFeature.Groq]: [],
    [BotanikaFeature.Ollama]: [],
    [BotanikaFeature.Azure]: [],
    [BotanikaFeature.OpenRouter]: [],
    [BotanikaFeature.Spotify]: []
};