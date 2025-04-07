import {ChatUpdate} from "./chat/ChatUpdate";
import {chatContext} from "../ui/classes/store";
import {ChatContext} from "./chat/ChatContext";
import {Signal} from "../ui/lib/fjsc/src/signals";
import {stack} from "../ui/lib/fjsc/src/f2";

export function updateContext(c: ChatContext, update: ChatUpdate, signal?: Signal<ChatContext>) {
    if (c.id && c.id !== update.chatId) {
        return;
    }

    c = structuredClone(c);
    if (!c.id) {
        c.id = update.chatId;
    }

    if (!c.history) {
        c.history = [];
    }
    if (update.messages) {
        for (const message of update.messages) {
            const existingMsg = c.history.find(m => m.id === message.id);
            if (existingMsg) {
                c.history = c.history.map(m => {
                    if (m.id === message.id) {
                        return message;
                    }
                    return m;
                });
            } else {
                c.history.push(message);
            }
        }
    }
    c.history = c.history.sort((a, b) => a.time - b.time);
    if (signal) {
        chatContext.value = c;
    }
    return c;
}