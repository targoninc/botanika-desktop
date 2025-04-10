import {Application, Request, Response} from "express";
import {ChatMessage} from "../../models/chat/ChatMessage";
import {getAvailableModels, getModel, initializeLlms} from "./llms/models";
import {ChatUpdate} from "../../models/chat/ChatUpdate";
import {terminator} from "../../models/chat/terminator";
import {updateContext} from "../../models/updateContext";
import {
    createChat,
    getPromptMessages,
    getWorldContext,
    newAssistantMessage,
    newUserMessage
} from "./llms/messages";
import {ChatContext} from "../../models/chat/ChatContext";
import {ChatStorage} from "../storage/ChatStorage";
import {getMcpTools} from "./initializer";
import {CLI} from "../CLI";
import {LlmProvider} from "../../models/llmProvider";
import {getTtsAudio} from "./tts/tts";
import {AudioStorage} from "../storage/AudioStorage";
import {getConfig, getConfigKey} from "../configuration";
import {signal} from "../../ui/lib/fjsc/src/signals";
import {getSimpleResponse, streamResponseAsMessage} from "./llms/calls";
import {addToolCallsToContext} from "./llms/functions";
import {tool} from "ai";

export const currentChatContext = signal<ChatContext>(null);

export function chunk(content: string) {
    return `${content}${terminator}`;
}

export async function sendMessages(messages: ChatMessage[], chatContext: ChatContext, res: Response) {
    const update = <ChatUpdate>{
        chatId: chatContext.id,
        timestamp: Date.now(),
        messages: messages
    };
    res.write(chunk(JSON.stringify(update)));
    chatContext = updateContext(chatContext, update);
    return chatContext;
}

async function afterMessageFinished(m: ChatMessage, chatContext: ChatContext, res: Response) {
    m.time = Date.now();
    chatContext = await sendMessages([m], chatContext, res);
    if (getConfigKey("enableTts") && m.text.length > 0) {
        chatContext = await sendAudioAndStop(chatContext, m, res);
    } else {
        res.end();
    }
    return chatContext;
}

function sendError(chatId: string, e: string, res: Response) {
    const update = <ChatUpdate>{
        chatId,
        timestamp: Date.now(),
        error: e
    };
    res.write(chunk(JSON.stringify(update)));
    res.end();
}

export const chatEndpoint = async (req: Request, res: Response) => {
    const message = req.body.message as string;
    if (!message) {
        res.status(400).send('Missing message parameter');
        return;
    }

    const provider = req.body.provider ?? "groq";
    const modelName = req.body.model ?? "llama-3.1-8b-instant";

    const availableModels = await getAvailableModels(provider);
    const modelDefinition = availableModels.find(m => m.id === modelName);
    if (!modelDefinition) {
        res.status(404).send('Model not found');
        return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const model = getModel(provider, modelName);

    let chatId = req.body.chatId;
    let chatContext: ChatContext;
    if (!chatId) {
        CLI.debug(`Creating chat`);
        const chatMsg = newUserMessage(provider, modelName, message);
        try {
            chatContext = await createChat(model, chatMsg);
        } catch (e) {
            sendError(chatId, "An error occurred while creating the chat: " + e.toString(), res);
            return;
        }

        res.write(chunk(JSON.stringify(<ChatUpdate>{
            chatId,
            timestamp: Date.now(),
            messages: [chatMsg]
        })));
        chatId = chatContext.id;
        CLI.debug(`Chat created`);
    } else {
        CLI.debug(`Getting existing chat`);
        chatContext = await ChatStorage.readChatContext(chatId);
        if (!chatContext) {
            res.status(404).send('Chat not found');
            return;
        }

        chatContext.history.push(newUserMessage(provider, modelName, message));
        res.write(chunk(JSON.stringify(<ChatUpdate>{
            chatId,
            timestamp: Date.now(),
            messages: chatContext.history
        })));
    }

    try {
        currentChatContext.value = chatContext;
        const mcpInfo = await getMcpTools();
        if (!modelDefinition.supportsTools) {
            mcpInfo.tools = {};
        }

        function onContextChange(c: ChatContext, changed: boolean) {
            if (changed) {
                const update = <ChatUpdate>{
                    chatId,
                    timestamp: Date.now(),
                    messages: [...c.history]
                };
                res.write(chunk(JSON.stringify(update)));
                chatContext = updateContext(chatContext, update);
            }
        }

        currentChatContext.subscribe(onContextChange);

        const worldContext = getWorldContext();
        if (provider === LlmProvider.openrouter) {
            const response = await getSimpleResponse(model, mcpInfo.tools, getPromptMessages(chatContext.history, worldContext, getConfig()));
            const m = newAssistantMessage(response.text, provider, modelName);
            chatContext = await afterMessageFinished(m, chatContext, res);
        } else {
            const streamResponse = await streamResponseAsMessage(provider, modelName, model, mcpInfo.tools, getPromptMessages(chatContext.history, worldContext, getConfig()));

            let streamPromise = new Promise<void>((resolve, reject) => {
                streamResponse.message.subscribe(async (m: ChatMessage) => {
                    chatContext = await sendMessages([m], chatContext, res);
                    if (m.finished) {
                        chatContext = await afterMessageFinished(m, chatContext, res);
                        resolve();
                    }
                });
            });

            const steps = await streamResponse.steps;
            const toolResults = steps.flatMap(s => s.toolResults);
            CLI.debug(`Got ${toolResults.length} tool results, waiting for stream to finish`);
            await streamPromise;
        }
        currentChatContext.unsubscribe(onContextChange);
        mcpInfo.onClose();
        await ChatStorage.writeChatContext(chatContext.id, chatContext);
    } catch (e) {
        sendError(chatId, "An error occurred while responding: " + e.toString(), res);
    }

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
        chatContext = await sendMessages([
            {
                ...lastMessage,
                hasAudio: true
            }
        ], chatContext, res);
    }

    res.end();
    return chatContext;
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