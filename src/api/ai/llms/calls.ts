import {CoreMessage, GeneratedFile, generateText, LanguageModelV1, StepResult, streamText, ToolSet} from "ai";
import {ChatMessage} from "../../../models/chat/ChatMessage";
import {CLI} from "../../CLI";
import {v4 as uuidv4} from "uuid";
import {updateMessageFromStream} from "./functions";
import {LanguageModelSourceV1} from "./models/LanguageModelSourceV1";
import {signal, Signal} from "@targoninc/jess";

export async function getSimpleResponse(model: LanguageModelV1, tools: ToolSet, messages: CoreMessage[], maxTokens: number = 1000): Promise<{
    thoughts: string;
    text: string;
    steps: Array<StepResult<ToolSet>>
}> {
    const res = await generateText({
        model,
        messages,
        maxTokens,
        presencePenalty: 0.6,
        frequencyPenalty: 0.6,
        tools
    });
    if (res.finishReason !== "stop") {
        CLI.warning(`Got finish reason ${res.finishReason}`);
    }

    if (res.text.length === 0) {
        CLI.warning("Got empty response");
        return {
            thoughts: undefined,
            text: "",
            steps: []
        };
    }

    const thoughts = res.text.match(/<think>(.*?)<\/think>/gms);
    return {
        thoughts: thoughts ? thoughts[0].trim() : undefined,
        text: res.text.replace(/<think>(.*?)<\/think>/gms, "").trim(),
        steps: res.steps
    };
}

export async function streamResponseAsMessage(maxSteps: number, provider: string, modelName: string, model: LanguageModelV1, tools: ToolSet, messages: CoreMessage[]): Promise<{
    message: Signal<ChatMessage>;
    steps: Promise<Array<StepResult<ToolSet>>>
}> {
    CLI.debug("Streaming response...");
    const {
        textStream,
        files,
        steps,
        text,
        sources
    } = streamText({
        model,
        messages,
        tools,
        presencePenalty: 0.6,
        frequencyPenalty: 0.6,
        maxSteps,
        maxRetries: 0,
        onError: event => {
            CLI.error(JSON.stringify(event));
        },
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

    updateMessageFromStream(message, textStream, text).then();

    files.then((f: GeneratedFile[]) => {
        CLI.debug(`Generated ${f.length} files`);
        message.value = {
            ...message.value,
            files: f
        };
    }).catch((err) => {
        console.error(err);
    });

    sources.then((s: LanguageModelSourceV1[]) => {
        CLI.debug(`Got ${s.length} sources`);
        message.value.references = s.map(source => ({
            name: source.title,
            link: source.url,
            type: "resource-reference",
            snippet: source.id
        }));
    }).catch((err) => {
        console.error(err);
    });

    return {
        message,
        steps
    };
}
