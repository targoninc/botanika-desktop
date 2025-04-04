import {CLI} from "../../CLI";
import {ChatMessage} from "../../../models/chat/ChatMessage";
import {v4 as uuidv4} from "uuid";
import {currentChatContext} from "../endpoints";

export function wrapTool(id: string, execute: (input: any) => Promise<any>) {
    return async (input: any) => {
        const newMessage = <ChatMessage>{
            type: "tool",
            text: `Calling tool ${id}`,
            toolResult: {
                toolName: id,
                text: null,
                references: [],
            },
            finished: false,
            time: Date.now(),
            references: [],
            id: uuidv4()
        };
        currentChatContext.value = {
            ...currentChatContext.value,
            history: [...currentChatContext.value.history, newMessage]
        };
        const start = performance.now();
        const result = await execute(input);
        const diff = performance.now() - start;
        CLI.debug(`Tool ${id} took ${diff.toFixed()} ms to execute`);
        return result;
    }
}
