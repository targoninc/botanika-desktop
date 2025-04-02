import {v4 as uuidv4} from "uuid";
import {ChatContext} from "../../models/chat/ChatContext";
import {ChatStorage} from "./ChatStorage";
import {CoreMessage} from "ai";
import {getSimpleResponse} from "../ai/llms/models";
import {groq} from "@ai-sdk/groq";

export async function getChatName(message: string): Promise<string> {
    return await getSimpleResponse(groq("llama-3.1-8b-instant"), getChatNameMessages(message));
}

export async function createChat(message: string): Promise<ChatContext> {
    const chatId = uuidv4();
    // create chat
    const chatContext = <ChatContext>{
        id: chatId,
        createdAt: Date.now(),
        name: await getChatName(message),
        history: [
            {
                id: uuidv4(),
                type: "user",
                text: message,
                time: Date.now(),
                finished: true
            }
        ]
    };
    await ChatStorage.writeChatContext(chatId, chatContext);

    return chatContext;
}

export function getPromptMessages(message: string): CoreMessage[] {
    return [
        {
            role: "system",
            content: "You are a helpful assistant."
        },
        {
            role: "user",
            content: message
        }
    ];
}

export function getChatNameMessages(message: string): CoreMessage[] {
    return [
        {
            role: "system",
            content: "You are a chat name generator. Generate a short name for the following chat message that describes the content in 3-4 words. Only output the name and nothing else or my employer will fire me. Do not include 'Chat' in the name."
        },
        {
            role: "user",
            content: message
        }
    ];
}
