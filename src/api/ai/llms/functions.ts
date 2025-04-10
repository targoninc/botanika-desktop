import {ToolResultUnion, ToolSet} from "ai";
import {Signal} from "../../../ui/lib/fjsc/src/signals";
import {ChatMessage} from "../../../models/chat/ChatMessage";
import {v4 as uuidv4} from "uuid";
import {Response} from "express";
import {ChatContext} from "../../../models/chat/ChatContext";
import {ChatToolResult} from "../../../models/chat/ChatToolResult";
import {sendMessages} from "../endpoints";

export async function updateMessageFromStream(message: Signal<ChatMessage>, stream: AsyncIterable<string> & ReadableStream<string>) {
    const reader = stream.getReader();

    while (true) {
        const { value, done } = await reader.read();
        const m = message.value;
        if (done) {
            message.value = {
                ...m,
                text: value ? m.text + value : m.text,
                finished: true
            }
            break;
        }
        message.value = {
            ...m,
            text: m.text + value
        }
    }
}

export async function addToolCallsToContext(provider: string, model: string, calls: Array<ToolResultUnion<ToolSet>>, res: Response, chatContext: ChatContext) {
    const updatedMessages = calls.map((toolCall: ToolResultUnion<ToolSet>) => {
        const result = toolCall.result as ChatToolResult;
        const text = result.text ?? toolCall.toolName;
        let references = [];
        if (result.references) {
            references = result.references;
        }

        const existingMessage = chatContext.history
            .filter(m => !m.finished)
            .find(m => m.id === result.messageId);

        if (existingMessage) {
            return {
                ...existingMessage,
                toolResult: toolCall,
                text,
                references,
                finished: true,
                provider,
                model
            };
        }

        return <ChatMessage>{
            type: "tool",
            text,
            toolResult: toolCall,
            finished: true,
            time: Date.now(),
            references,
            id: uuidv4(),
            provider,
            model
        }
    });

    return await sendMessages(updatedMessages, chatContext, res);
}