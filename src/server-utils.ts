import {BrowserWindow} from "electron";
import {createEndpoints} from "./api/endpoints";
import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

async function startServer(port = 48678) {
    try {
        const test = await fetch(`http://localhost:${port}`);
        if (test.status === 200) {
            console.log('Server already running on a different instance');
            return;
        }
    } catch (e) {
        console.log('Server not running, starting...');
    }

    const app = express();
    app.use(express.json());
    app.use(cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
    }));
    app.get('/', (req, res) => {
        res.send('API up and running');
    });

    createEndpoints(app);
    app.listen(port, () => {
        console.log("Server started");
    });
}

export function createWindow() {
    console.log('Creating window...');
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        center: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        icon: 'src/assets/icon_512.png',
    });
    win.maximize();

    startServer().then();
    win.show();
    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL)
        setTimeout(() => {
            win.webContents.openDevTools()
        }, 1000);
    } else {
        win.loadFile(path.join(process.env.DIST, 'index.html'))
    }

    return win;
}
