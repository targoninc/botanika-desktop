import {Request, Response} from "express";
import {ChatMessage} from "../../models/chat/ChatMessage";
import {getResponse} from "./llms/models";
import {groq} from "@ai-sdk/groq";
import {ChatUpdate} from "../../models/chat/ChatUpdate";
import {v4 as uuidv4} from "uuid";
import {terminator} from "../../models/chat/terminator";

export function chunk(content: string) {
    return `${content}${terminator}`;
}

export const chatEndpoint = async (req: Request, res: Response) => {
    const message = req.body.message;
    if (!message) {
        res.status(400).send('Missing message parameter');
        return;
    }

    let chatId = req.body.chatId;
    if (!chatId) {
        chatId = uuidv4();
        // create chat
    }

    const generator = getResponse(groq("llama-3.1-8b-instant"), [
        {
            role: "system",
            content: "You are a helpful assistant."
        },
        {
            role: "user",
            content: message
        }
    ], {});

    const responseMsg = await generator.next();
    responseMsg.value.subscribe((m: ChatMessage) => {
        const update = <ChatUpdate>{
            chatId,
            timestamp: m.time,
            messages: [m]
        };
        res.write(chunk(JSON.stringify(update)));
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    req.on('close', () => {
        console.log(`Client disconnected from updates for chatId: ${chatId}`);
        res.end();
    });
};