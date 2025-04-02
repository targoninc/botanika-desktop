import {Request, Response} from "express";
import {ChatMessage} from "../../models/chat/ChatMessage";
import {streamResponseAsMessage} from "./llms/models";
import {groq} from "@ai-sdk/groq";
import {ChatUpdate} from "../../models/chat/ChatUpdate";
import {terminator} from "../../models/chat/terminator";
import {updateContext} from "../../models/updateContext";
import {createChat, getPromptMessages} from "../storage/helpers";
import {ChatContext} from "../../models/chat/ChatContext";
import {ChatStorage} from "../storage/ChatStorage";

export function chunk(content: string) {
    return `${content}${terminator}`;
}

export const chatEndpoint = async (req: Request, res: Response) => {
    const message = req.body.message;
    if (!message) {
        res.status(400).send('Missing message parameter');
        return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let chatId = req.body.chatId;
    let chatContext: ChatContext;
    if (!chatId) {
        chatContext = await createChat(message);
        chatId = chatContext.id;
        res.write(chunk(JSON.stringify(<ChatUpdate>{
            chatId,
            timestamp: Date.now(),
            messages: chatContext.history
        })));
    } else {
        chatContext = await ChatStorage.readChatContext(chatId);
        if (!chatContext) {
            res.status(404).send('Chat not found');
            return;
        }
    }

    const responseMsg = await streamResponseAsMessage(groq("llama-3.1-8b-instant"), getPromptMessages(message), {});

    responseMsg.subscribe(async (m: ChatMessage) => {
        const update = <ChatUpdate>{
            chatId,
            timestamp: m.time,
            messages: [m]
        };
        res.write(chunk(JSON.stringify(update)));
        if (m.finished) {
            updateContext(chatContext, update);
            await ChatStorage.writeChatContext(chatId, chatContext);
            res.end();
        }
    });

    req.on('close', () => {
        console.log(`Client disconnected from updates for chatId: ${chatId}`);
        res.end();
    });
};

export async function getChatIdsEndpoint(req: Request, res: Response) {
    const chatIds = await ChatStorage.getChatIds();
    res.send(chatIds);
}

export function getChatEndpoint(req: Request, res: Response) {
    const chatId = req.params.chatId;
    if (!chatId) {
        res.status(400).send('Missing chatId parameter');
        return;
    }

    ChatStorage.readChatContext(chatId).then(chatContext => {
        if (!chatContext) {
            res.status(404).send('Chat not found');
            return;
        }
        res.send(chatContext);
    });
}

export function deleteChatEndpoint(req: Request, res: Response) {
    const chatId = req.params.chatId;
    if (!chatId) {
        res.status(400).send('Missing chatId parameter');
        return;
    }

    ChatStorage.deleteChatContext(chatId).then(() => {
        res.status(200).send('Chat deleted');
    });
}