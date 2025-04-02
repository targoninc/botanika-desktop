import { Application } from "express";
import { getConfig, getConfigKey, setConfigKey } from "./configuration";
import {chatEndpoint, deleteChatEndpoint, getChatEndpoint, getChatIdsEndpoint} from "./ai/endpoints";

export function createEndpoints(app: Application) {
    app.get('/config', async (req, res) => {
        res.status(200).send(getConfig());
    });

    app.get('/config/:key', async (req, res) => {
        const key = req.params.key;
        res.status(200).send(getConfigKey(key));
    });

    app.put('/config/:key', async (req, res) => {
        const key = req.params.key;
        const value = req.body.value;
        setConfigKey(key, value);
        res.status(200).send(getConfigKey(key));
    });

    app.post('/chat', chatEndpoint);
    app.get('/chat/:chatId', getChatEndpoint);
    app.get('/chats', getChatIdsEndpoint);
    app.delete('/chat/:chatId', deleteChatEndpoint);
}