import {v4 as uuidv4} from "uuid";
import {ChatContext} from "../../../models/chat/ChatContext";
import {ChatStorage} from "../../storage/ChatStorage";
import {CoreMessage} from "ai";
import {groq} from "@ai-sdk/groq";
import {ChatMessage} from "../../../models/chat/ChatMessage";
import {getSimpleResponse} from "./functions";
import {Configuration} from "../../../models/Configuration";

export async function getChatName(message: string): Promise<string> {
    return await getSimpleResponse(groq("llama-3.1-8b-instant"), getChatNameMessages(message), 10);
}

export function newUserMessage(message: string): ChatMessage {
    return {
        id: uuidv4(),
        type: "user",
        text: message,
        time: Date.now(),
        finished: true,
        references: [],
    };
}

export async function createChat(newMessage: ChatMessage): Promise<ChatContext> {
    const chatId = uuidv4();
    // create chat
    const chatContext = <ChatContext>{
        id: chatId,
        createdAt: Date.now(),
        name: await getChatName(newMessage.text),
        history: [newMessage]
    };
    ChatStorage.writeChatContext(chatId, chatContext).then();

    return chatContext;
}

export function getPromptMessages(messages: ChatMessage[], worldContext: Record<string, any>, configuration: Configuration): CoreMessage[] {
    return [
        {
            role: "system",
            content: `You are ${configuration.botname}, an assistant. If the last messages were tool calls, give the user a summary of what you did. Otherwise, here is a description of you: ${configuration.botDescription}`
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
                }
            }

            return {
                role: m.type,
                content: m.text
            }
        }) as CoreMessage[]
    ];
}

export function getToolPromptMessages(messages: ChatMessage[]): CoreMessage[] {
    return [
        {
            role: "system",
            content: "You are a helpful assistant. If the user requests something that you could answer without calling a tool, just answer."
        },
        ...messages.map(m => {
            if (m.type === "tool") {
                return {
                    role: m.type,
                    content: [m.toolResult]
                }
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
            content: "You are a chat name generator. Generate a short name for the following chat message that describes the content in 3-4 words. Only output the name (no special characters) and nothing else or my employer will fire me. Do not include 'Chat' in the name. Don't actually answer the user's message."
        },
        {
            role: "user",
            content: message
        }
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
