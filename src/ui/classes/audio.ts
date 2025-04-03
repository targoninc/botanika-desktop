import {ApiBase} from "./api.base";

export async function playAudio(file: string) {
    const src = `${ApiBase.baseUrl}/audio?file=${file}`;
    console.log(`Playing audio: ${src}`);
    const audio = new Audio(src);
    await audio.play();
}