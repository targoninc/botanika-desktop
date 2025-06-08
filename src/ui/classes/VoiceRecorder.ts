import {Api} from "./api";
import {terminator} from "../../models/chat/terminator";
import {toast} from "./ui";
import {chatContext, configuration, currentText, updateContextFromStream} from "./store";
import {Signal} from "@targoninc/jess";

export class VoiceRecorder {
    private readonly threshold = 0.015;
    private readonly timeout = 2000;
    private readonly mimeType = 'audio/webm; codecs=opus';

    private mediaRecorder: MediaRecorder;
    private audioContext: AudioContext;
    private chunkCounter = 0;
    private audioHeader: BlobPart;
    private lastDataTime: number;
    private dataInterval: number;
    private audioChunks = [];
    private currentVolume = 0;
    private sum = 0.0;
    private recording = false;
    private processing = false;

    private loudness: Signal<number>;

    constructor(loudness: Signal<number>) {
        this.loudness = loudness;
        this.loudness.value = this.currentVolume;
    }

    public toggleRecording() {
        if (this.recording) {
            this.stop();
        } else {
            this.start();
        }
    }

    private start() {
        this.recording = true;
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.processMediaStream(stream);
            });
    }

    private processMediaStream(stream: MediaStream) {
        this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: this.mimeType
        });
        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaStreamSource(stream);
        const processor = this.audioContext.createScriptProcessor(1024, 1, 1);
        source.connect(processor);
        processor.connect(this.audioContext.destination);
        processor.onaudioprocess = this.processAudio.bind(this);

        this.chunkCounter = 0;
        this.mediaRecorder.ondataavailable = e => {
            this.chunkCounter++;
            if (this.chunkCounter === 1) {
                this.audioHeader = e.data;
            } else {
                this.audioChunks.push(e.data);
            }
        };

        // @ts-ignore
        this.dataInterval = setInterval(() => {
            if (!this.recording) {
                return;
            }
            this.mediaRecorder.requestData();
        }, 1000);
        this.mediaRecorder.start();
    }

    async processAudio(event: AudioProcessingEvent) {
        if (!this.recording) {
            this.lastDataTime = Date.now();
            this.sum = 0.0;
            return;
        }
        const input = event.inputBuffer.getChannelData(0);
        let sum = 0.0;
        for (let i = 0; i < input.length; ++i) {
            sum += input[i] * input[i];
        }
        const level = Math.sqrt(sum / input.length);
        this.currentVolume = level;
        this.loudness.value = this.currentVolume;
        if (level > this.threshold) {
            this.lastDataTime = Date.now();
            this.sum += level;
        } else {
            if (this.lastDataTime && Date.now() - this.lastDataTime > this.timeout && !this.processing) {
                await this.sendAudio();
                this.sum = 0.0;
            }
        }
    }

    private stop() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
        this.dataInterval && clearInterval(this.dataInterval);
        this.recording = false;
    }

    private getAverageVolume(chunks: BlobPart[]) {
        return this.sum / chunks.length;
    }

    private async sendAudio() {
        if (this.audioChunks.length === 0) {
            return;
        }

        const averageVolume = this.getAverageVolume(this.audioChunks);
        if (averageVolume < this.threshold * 2) {
            return;
        }

        this.processing = true;
        const allAudioData = [this.audioHeader, ...this.audioChunks];
        const audioBlob = new Blob(allAudioData, {type: this.mimeType});

        const formData = new FormData();
        formData.append('file', audioBlob, "file.webm");
        console.log("Transcribing audio...");
        Api.transcribe(formData).then(async stream => {
            const reader = stream.getReader();

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }
                const decodedUpdates = new TextDecoder().decode(value).split(terminator).filter(s => s.length > 0);
                const lastUpdate = decodedUpdates.pop();
                if (!lastUpdate) {
                    continue;
                }
                const obj = JSON.parse(lastUpdate);
                if (obj.type === "transcript.text.delta") {
                    currentText.value += obj.delta;
                } else if (obj.type === "transcript.text.done") {
                    const config = configuration.value;
                    currentText.value = obj.text;
                    try {
                        Api.sendMessage(currentText.value, config.provider, config.model, chatContext.value.id).then(updateContextFromStream);
                    } catch (e) {
                        toast(e.toString());
                    }
                    currentText.value = "";
                }
            }
        });

        this.audioChunks = [];
        this.processing = false;
        this.lastDataTime = null;
    }
}
