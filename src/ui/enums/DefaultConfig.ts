import {Configuration} from "../../models/Configuration";
import {BotanikaFeature} from "../../models/features/BotanikaFeature";

export const defaultConfig: Configuration = {
    display_hotkeys: true,
    botname: "Botanika",
    userDescription: "",
    birthdate: "",
    displayname: "",
    language: "en",
    provider: "groq",
    model: "llama-3.1-8b-instant",
    enableTts: false,
    botDescription: "",
    maxSteps: 5,
    featureOptions: {
        [BotanikaFeature.GoogleSearch]: {},
        [BotanikaFeature.OpenAI]: {},
        [BotanikaFeature.Groq]: {},
        [BotanikaFeature.Ollama]: {},
        [BotanikaFeature.Azure]: {},
        [BotanikaFeature.OpenRouter]: {},
        [BotanikaFeature.Spotify]: {}
    },
}