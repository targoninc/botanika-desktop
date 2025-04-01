import path from "path";

const userDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : '~/.local/share');
export const appDataPath = path.join(userDataPath, 'botanika');