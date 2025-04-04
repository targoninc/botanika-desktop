import {CoreMessage, generateText, LanguageModelV1, streamText, ToolResultUnion, ToolSet} from "ai";
import {signal, Signal} from "../../../ui/lib/fjsc/src/signals";
import {ChatMessage} from "../../../models/chat/ChatMessage";
import {CLI} from "../../CLI";
import {v4 as uuidv4} from "uuid";

export async function tryCallTool(model: LanguageModelV1, messages: CoreMessage[], tools: ToolSet): Promise<Array<ToolResultUnion<ToolSet>>> {
    const res = await generateText({
        model,
        messages,
        tools,
        maxSteps: Math.min(Object.keys(tools).length, 5),
        toolChoice: "auto"
    });

    return res.toolResults;
}

export async function streamResponseAsMessage(model: LanguageModelV1, messages: CoreMessage[]): Promise<Signal<ChatMessage>> {
    CLI.debug("Streaming response...");
    const { textStream } = streamText({
        model,
        messages,
        presencePenalty: 0.6,
        frequencyPenalty: 0.6,
        maxTokens: 1000,
    });

    const messageId = uuidv4();
    const message = signal<ChatMessage>({
        id: messageId,
        type: "assistant",
        text: "",
        time: Date.now(),
        references: [],
        finished: false
    });

    updateMessageFromStream(message, textStream).then();

    return message;
}

export async function updateMessageFromStream(message: Signal<ChatMessage>, stream: AsyncIterable<string> & ReadableStream<string>) {
    const reader = stream.getReader();

    while (true) {
        const { value, done } = await reader.read();
        const m = message.value;
        if (done) {
            message.value = {
                ...m,
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

export async function getSimpleResponse(model: LanguageModelV1, messages: CoreMessage[], maxTokens: number = 1000): Promise<string> {
    const res = await generateText({
        model,
        messages,
        maxTokens
    });

    return res.text;
}