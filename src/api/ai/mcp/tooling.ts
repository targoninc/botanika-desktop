import {CLI} from "../../CLI";
import {ChatMessage} from "../../../models/chat/ChatMessage";
import {v4 as uuidv4} from "uuid";
import {currentChatContext} from "../endpoints";
import {ToolResultUnion, ToolSet} from "ai";
import {ChatToolResult} from "../../../models/chat/ChatToolResult";

export function wrapTool(id: string, execute: (input: any) => Promise<any>) {
    return async (input: any) => {
        const newMessage = <ChatMessage>{
            type: "tool",
            text: `Calling tool ${id}`,
            toolResult: <ToolResultUnion<ToolSet>>{
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
        let result;
        try {
            result = await execute(input);
        } catch (e) {
            result = <ChatToolResult>{
                text: `Tool ${id} failed: ${e.toString()}`,
            };
        }
        const diff = performance.now() - start;
        CLI.debug(`Tool ${id} took ${diff.toFixed()} ms to execute`);
        result.messageId = newMessage.id;
        const chatContext = currentChatContext.value;
        currentChatContext.value = {
            ...chatContext,
            // @ts-ignore
            history: chatContext.history.map(m => {
                if (m.id === newMessage.id) {
                    return {
                        ...m,
                        time: Date.now(),
                        finished: true,
                        text: result.text,
                        references: result.references,
                        toolResult: {
                            toolName: id,
                            toolCallId: uuidv4(),
                            result,
                            type: "tool-result",
                            args: input
                        }
                    };
                }
                return m;
            })
        };
        return result;
    }
}
