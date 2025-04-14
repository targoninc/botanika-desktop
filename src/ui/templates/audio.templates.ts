import {compute, signal} from "../lib/fjsc/src/signals";
import {GenericTemplates} from "./generic.templates";
import {VoiceRecorder} from "../classes/VoiceRecorder";
import { create } from "../lib/fjsc/src/f2";

const currentLoudness = signal(0);
let recorder: VoiceRecorder;

export class AudioTemplates {
    static voiceButton() {
        if (!recorder) {
            recorder = new VoiceRecorder(currentLoudness);
        }
        const onState = signal(false);
        const iconState = compute(o => o ? "mic" : "mic_off", onState);
        const textState = compute(o => o ? "Mute yourself" : "Unmute yourself", onState);

        return create("div")
            .classes("flex", "align-content")
            .children(
                GenericTemplates.buttonWithIcon(iconState, textState, () => {
                    recorder.toggleRecording();
                    onState.value = !onState.value;
                }),
                GenericTemplates.redDot(onState, currentLoudness),
            ).build();
    }
}