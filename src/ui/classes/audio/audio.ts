import {ApiBase} from "../api.base";
import {currentlyPlayingAudio} from "../store";

let audio;

export async function playAudio(file: string) {
    if (currentlyPlayingAudio.value) {
        return;
    }
    if (!audio) {
        audio = new Audio();
    }
    currentlyPlayingAudio.value = file;
    const src = `${ApiBase.baseUrl}/audio?file=${file}`;
    console.log(`Playing audio: ${src}`);
    audio.src = src;
    audio.onended = () => {
        currentlyPlayingAudio.value = null;
    };
    audio.currentTime = 0;
    await audio.play();
}

export function stopAudio() {
    if (audio.paused) {
        return;
    }
    audio.pause();
    currentlyPlayingAudio.value = null;
}