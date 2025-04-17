import path from "path";

function getAppDataPath() {
    switch (process.platform) {
        case "win32":
            return process.env.APPDATA;
        case "darwin":
            return process.env.HOME + '/Library/Application Support';
        case "linux":
        default:
            return process.env.XDG_DATA_HOME || `${process.env.HOME}/.local/share`;
    }
}

const userDataPath = getAppDataPath();
export const appDataPath = path.join(userDataPath, 'botanika');