import {BrowserWindow, shell} from "electron";
import path from "path";
import {startServer} from "../src/start-server"

export let currentWindow: BrowserWindow;

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

    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    currentWindow = win;

    return win;
}
