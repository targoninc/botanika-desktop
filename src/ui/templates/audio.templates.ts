import {GenericTemplates} from "./generic.templates";
import {VoiceRecorder} from "../classes/audio/VoiceRecorder";
import {configuredFeatures} from "../classes/store";
import {BotanikaFeature} from "../../models/features/BotanikaFeature";
import {compute, create, signal} from "@targoninc/jess";
import {button} from "@targoninc/jess-components";

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
                button({
                    text: textState,
                    icon: {icon: iconState},
                    classes: ["flex", "align-children"],
                    title: "Currently only OpenAI is supported",
                    disabled: compute(a => !a[BotanikaFeature.OpenAI]?.enabled, configuredFeatures),
                    onclick: () => {
                        recorder.toggleRecording();
                        onState.value = !onState.value;
                    }
                }),
            ).build();
    }
}