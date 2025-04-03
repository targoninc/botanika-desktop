import {ChatUpdate} from "./chat/ChatUpdate";
import {context} from "../ui/classes/store";
import {ChatContext} from "./chat/ChatContext";

export function updateContext(c: ChatContext, update: ChatUpdate) {
    if (c.id && c.id !== update.chatId) {
        return;
    }

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
    context.value = {
        ...c
    };
}