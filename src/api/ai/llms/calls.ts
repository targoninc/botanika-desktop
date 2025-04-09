import {CoreMessage, GeneratedFile, generateText, LanguageModelV1, streamText, ToolResultUnion, ToolSet} from "ai";
import {signal, Signal} from "../../../ui/lib/fjsc/src/signals";
import {ChatMessage} from "../../../models/chat/ChatMessage";
import {CLI} from "../../CLI";
import {v4 as uuidv4} from "uuid";
import {updateMessageFromStream} from "./functions";
import {LanguageModelSourceV1} from "./models/LanguageModelSourceV1";

export async function getSimpleResponse(model: LanguageModelV1, messages: CoreMessage[], maxTokens: number = 1000): Promise<string> {
    const res = await generateText({
        model,
        messages,
        maxTokens,
        presencePenalty: 0.6,
        frequencyPenalty: 0.6,
    });
    if (res.finishReason !== "stop") {
        CLI.warning(`Got finish reason ${res.finishReason}`);
    }

    if (res.text.length === 0) {
        CLI.warning("Got empty response");
        return "";
    }

    return res.text;
}

export async function tryCallTool(model: LanguageModelV1, messages: CoreMessage[], tools: ToolSet): Promise<Array<ToolResultUnion<ToolSet>>> {
    const res = await generateText({
        model,
        messages,
        tools,
        maxSteps: 1,
        toolChoice: "auto"
    });

    return res.toolResults;
}

export async function streamResponseAsMessage(provider: string, modelName: string, model: LanguageModelV1, messages: CoreMessage[]): Promise<Signal<ChatMessage>> {
    CLI.debug("Streaming response...");
    const {
        textStream,
        files,
        sources
    } = streamText({
        model,
        messages,
        presencePenalty: 0.6,
        frequencyPenalty: 0.6,
    });

    const messageId = uuidv4();
    const message = signal<ChatMessage>({
        id: messageId,
        type: "assistant",
        text: "",
        time: Date.now(),
        references: [],
        files: [],
        finished: false,
        provider,
        model: modelName
    });

    updateMessageFromStream(message, textStream).then();

    files.then((f: GeneratedFile[]) => {
        CLI.debug(`Generated ${f.length} files`);
        message.value.files = f;
    });

    sources.then((s: LanguageModelSourceV1[]) => {
        CLI.debug(`Got ${s.length} sources`);
        message.value.references = s.map(source => ({
            name: source.title,
            link: source.url,
            type: "resource-reference",
            snippet: source.id
        }));
    });

    return message;
}
