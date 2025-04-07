import WhisperLive from "whisper-live"

let whisper: WhisperLive;
export function initializeWhisper(apiKey: string) {
    whisper = new WhisperLive({ openAiKey: apiKey });

    whisper.onTranscript((text) => console.log(text));
}

export function startTranscription() {
    whisper.start();
}

export function stopTranscription() {
    whisper.stop();
}