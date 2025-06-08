import express from "express";
import cors from "cors";
import {addTranscribeEndpoints} from "./api/ai/tts/endpoints";
import {createMcpServers} from "./api/ai/mcp/servers/createServers";
import {createEndpoints} from "./api/endpoints";
import dotenv from "dotenv";

dotenv.config();

const APP_PORT = Number(process.env.PORT || "48678");
export let app = null;

export async function startServer() {
    const port = APP_PORT;
    try {
        const test = await fetch(`http://localhost:${port}`);
        if (test.status === 200) {
            console.log('Server already running on a different instance');
            return;
        }
    } catch (e) {
        console.log('Server not running, starting...');
    }

    app = express();
    app.use(cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
    }));
    addTranscribeEndpoints(app);
    app.use(express.json());

    app.get('/', (req, res) => {
        res.send('API up and running');
    });

    createMcpServers(app);
    createEndpoints(app);
    app.listen(port, () => {
        console.log("Server started");
    });
}