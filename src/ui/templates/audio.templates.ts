import {compute, signal} from "../lib/fjsc/src/signals";
import {GenericTemplates} from "./generic.templates";
import {VoiceRecorder} from "../classes/VoiceRecorder";
import { create } from "../lib/fjsc/src/f2";
import {configuredApis} from "../classes/store";
import {FJSC} from "../lib/fjsc";
import {BotanikaFeature} from "../../models/configuredApis";

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
            .classes("flex", "align-children")
            .children(
                GenericTemplates.redDot(onState, currentLoudness),
                FJSC.button({
                    text: textState,
                    icon: { icon: iconState },
                    classes: ["flex", "align-children"],
                    title: "Currently only OpenAI is supported",
                    disabled: compute(a => !a[BotanikaFeature.OpenAI]?.enabled, configuredApis),
                    onclick: () => {
                        recorder.toggleRecording();
                        onState.value = !onState.value;
                    }
                }),
            ).build();
    }
}