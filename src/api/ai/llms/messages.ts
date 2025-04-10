import {v4 as uuidv4} from "uuid";
import {ChatContext} from "../../../models/chat/ChatContext";
import {ChatStorage} from "../../storage/ChatStorage";
import {CoreMessage, LanguageModelV1} from "ai";
import {ChatMessage} from "../../../models/chat/ChatMessage";
import {Configuration} from "../../../models/Configuration";
import {getSimpleResponse} from "./calls";

export async function getChatName(model: LanguageModelV1, message: string): Promise<string> {
    return await getSimpleResponse(model, {}, getChatNameMessages(message), 1000);
}

export function newUserMessage(provider: string, model: string, message: string): ChatMessage {
    return {
        id: uuidv4(),
        type: "user",
        text: message,
        time: Date.now(),
        finished: true,
        references: [],
        files: [],
        provider,
        model
    };
}

export function newAssistantMessage(responseText: string, provider: string, modelName: string) {
    return <ChatMessage>{
        id: uuidv4(),
        type: "assistant",
        text: responseText,
        time: Date.now(),
        references: [],
        files: [],
        finished: true,
        provider,
        model: modelName
    };
}

export async function createChat(model: LanguageModelV1, newMessage: ChatMessage): Promise<ChatContext> {
    const chatId = uuidv4();
    // create chat
    const chatContext = <ChatContext>{
        id: chatId,
        createdAt: Date.now(),
        name: await getChatName(model, newMessage.text),
        history: [newMessage]
    };
    ChatStorage.writeChatContext(chatId, chatContext).then();

    return chatContext;
}

export function getPromptMessages(messages: ChatMessage[], worldContext: Record<string, any>, configuration: Configuration): CoreMessage[] {
    return [
        {
            role: "system",
            content: `You are ${configuration.botname}, an assistant. Only call tools if absolutely necessary or explicitly requested. Here is a description of you: ${configuration.botDescription}`
        },
        {
            role: "system",
            content: `Here is some general current info: ${JSON.stringify(worldContext)}`
        },
        {
            role: "system",
            content: `The user wants to be called ${configuration.displayname}, their birthdate is ${configuration.birthdate}.
            Don't refer to info about the user explicitly, only if it is necessary or requested by the user.
            Here is a self-written description about them: ${configuration.userDescription}`
        },
        ...messages.map(m => {
            if (m.type === "tool") {
                return {
                    role: m.type,
                    content: [m.toolResult]
                };
            }

            return {
                role: m.type,
                content: m.text
            }
        }) as CoreMessage[]
    ];
}

export function getChatNameMessages(message: string): CoreMessage[] {
    return [
        {
            role: "system",
            content: "Describe the following message in 3-4 words. Don't actually answer the message."
        },
        {
            role: "user",
            content: message
        },
    ];
}

export function getWorldContext(): Record<string, any> {
    return {
        date: new Date().toISOString(),
        time: new Date().getTime(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
    }
}
