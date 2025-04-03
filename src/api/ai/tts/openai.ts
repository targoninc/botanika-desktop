import {OpenAI} from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function getTtsAudioOpenAi(text: string): Promise<Blob> {
    const response = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: "nova",
        input: text,
        response_format: "mp3",
        speed: 1
    });

    return await response.blob();
}