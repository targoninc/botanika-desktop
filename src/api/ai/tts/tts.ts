import {getTtsAudioOpenAi} from "./openai";

/**
 * Returns a base64 encoded string of the audio blob
 * @param text The text to generate audio for
 */
export async function getTtsAudio(text: string): Promise<Blob> {
    return await getTtsAudioOpenAi(text);
}