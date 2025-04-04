import {Application, Request, Response} from "express";
import {ChatMessage} from "../../models/chat/ChatMessage";
import {getAvailableModels, getModel, initializeLlms} from "./llms/models";
import {ChatUpdate} from "../../models/chat/ChatUpdate";
import {terminator} from "../../models/chat/terminator";
import {updateContext} from "../../models/updateContext";
import {createChat, getPromptMessages, getToolPromptMessages, getWorldContext, newUserMessage} from "./llms/messages";
import {ChatContext} from "../../models/chat/ChatContext";
import {ChatStorage} from "../storage/ChatStorage";
import {ToolResultUnion, ToolSet} from "ai";
import {v4 as uuidv4} from "uuid";
import {ChatToolResult} from "../../models/chat/ChatToolResult";
import {initializeAi} from "./initializer";
import {CLI} from "../CLI";
import {LlmProvider} from "../../models/llmProvider";
import {streamResponseAsMessage, tryCallTool} from "./llms/functions";
import {getTtsAudio} from "./tts/tts";
import {AudioStorage} from "../storage/AudioStorage";
import {getConfig, getConfigKey} from "../configuration";

export function chunk(content: string) {
    return `${content}${terminator}`;
}

async function addToolCallsToContext(calls: Array<ToolResultUnion<ToolSet>>, chatId: string, res: Response, chatContext: ChatContext) {
    const messages = calls.map((toolCall: ToolResultUnion<ToolSet>) => {
        const result = toolCall.result as ChatToolResult;
        const text = result.text ?? toolCall.toolName;
        let references = [];
        if (result.references) {
            references = result.references;
        }

        return <ChatMessage>{
            type: "tool",
            text,
            toolResult: toolCall,
            finished: true,
            time: Date.now(),
            references,
            id: uuidv4()
        }
    });
    const update = <ChatUpdate>{
        chatId,
        timestamp: Date.now(),
        messages
    };
    res.write(chunk(JSON.stringify(update)));
    updateContext(chatContext, update);
    await ChatStorage.writeChatContext(chatId, chatContext);
}

export const chatEndpoint = async (req: Request, res: Response) => {
    const message = req.body.message as string;
    if (!message) {
        res.status(400).send('Missing message parameter');
        return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    CLI.debug(`Chat request received.`);
    const { tools } = await initializeAi();
    CLI.debug(`Tools initialized.`);

    let chatId = req.body.chatId;
    let chatContext: ChatContext;
    if (!chatId) {
        const chatMsg = newUserMessage(message);
        chatContext = await createChat(chatMsg);
        res.write(chunk(JSON.stringify(<ChatUpdate>{
            chatId,
            timestamp: Date.now(),
            messages: [chatMsg]
        })));
        chatId = chatContext.id;
    } else {
        chatContext = await ChatStorage.readChatContext(chatId);
        if (!chatContext) {
            res.status(404).send('Chat not found');
            return;
        }

        chatContext.history.push(newUserMessage(message));
        res.write(chunk(JSON.stringify(<ChatUpdate>{
            chatId,
            timestamp: Date.now(),
            messages: chatContext.history
        })));
    }

    const provider = req.body.provider ?? "groq";
    const modelName = req.body.model ?? "llama-3.1-8b-instant";

    const availableModels = await getAvailableModels(provider);
    const modelDefinition = availableModels.find(m => m.id === modelName);
    if (!modelDefinition) {
        res.status(404).send('Model not found');
        return;
    }

    const model = getModel(provider, modelName);
    if (modelDefinition.supportsTools) {
        const calls = await tryCallTool(getModel(LlmProvider.groq, "llama-3.1-8b-instant"), getToolPromptMessages(chatContext.history), tools);
        if (calls.length > 0) {
            await addToolCallsToContext(calls, chatId, res, chatContext);
        }
    }

    const worldContext = await getWorldContext();
    const responseMsg = await streamResponseAsMessage(model, getPromptMessages(chatContext.history, worldContext, getConfig()));

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
            if (getConfigKey("enableTts") && m.text.length > 0) {
                await sendAudioAndStop(chatContext, m, res);
            }
        }
    });

    req.on('close', () => {
        console.log(`Client disconnected from updates for chatId: ${chatId}`);
        res.end();
    });
};

export async function getAudio(lastMessage: ChatMessage): Promise<string> {
    if (lastMessage.type === "assistant") {
        const blob = await getTtsAudio(lastMessage.text);
        await AudioStorage.writeAudio(lastMessage.id, blob);
        return AudioStorage.getLocalFileUrl(lastMessage.id);
    }

    return null;
}

export async function sendAudioAndStop(chatContext: ChatContext, lastMessage: ChatMessage, res: Response) {
    const audioUrl = await getAudio(lastMessage);
    if (audioUrl) {
        const update = <ChatUpdate>{
            chatId: chatContext.id,
            timestamp: lastMessage.time,
            playLastAudio: true,
            messages: [
                {
                    ...lastMessage,
                    hasAudio: true
                }
            ]
        };
        updateContext(chatContext, update);
        res.write(chunk(JSON.stringify(update)));
        await ChatStorage.writeChatContext(chatContext.id, chatContext);
    }

    res.end();
}

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

let models = {};
export async function getModelsEndpoint(req: Request, res: Response) {
    if (Object.keys(models).length === 0) {
        models = await initializeLlms();
    }
    res.status(200).send(models);
}

export function addChatEndpoints(app: Application) {
    app.post('/chat', chatEndpoint);
    app.get('/chat/:chatId', getChatEndpoint);
    app.get('/chats', getChatIdsEndpoint);
    app.delete('/chat/:chatId', deleteChatEndpoint);
    app.get('/models', getModelsEndpoint);
}