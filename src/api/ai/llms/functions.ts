import {ChatMessage} from "../../../models/chat/ChatMessage";
import {Signal} from "@targoninc/jess";

export async function updateMessageFromStream(message: Signal<ChatMessage>, stream: AsyncIterable<string> & ReadableStream<string>, text: Promise<string>) {
    const reader = stream.getReader();

    while (true) {
        const { value, done } = await reader.read();
        const m = message.value;
        if (done) {
            break;
        }
        message.value = {
            ...m,
            text: m.text + value
        }
    }

    const finalText = await text;
    message.value = {
        ...message.value,
        text: finalText,
        finished: true
    }
}
