import {OsEventWriter} from "./events/OsEventWriter";


export class CLI {
    static withColor(text: string, color: number, newLine = true) {
        const timestamp = new Date().toISOString();
        text = `[${timestamp}] ${text}`;
        process.stdout.write(`\x1b[${color}m${text}\x1b[0m${newLine ? "\n" : ""}`);
    }

    static error(text: string, newLine = true) {
        CLI.withColor(text, 31, newLine);
        OsEventWriter.error(text, null);
    }

    static warning(text: string, newLine = true) {
        CLI.withColor(text, 33, newLine);
        OsEventWriter.warn(text, null);
    }

    static info(text: string, newLine = true) {
        CLI.withColor(text, 36, newLine);
        OsEventWriter.info(text, null);
    }

    static success(text: string, newLine = true) {
        CLI.withColor(text, 32, newLine);
        OsEventWriter.info(text, null);
    }

    static debug(text: string, newLine = true) {
        CLI.withColor(text, 35, newLine);
        OsEventWriter.info(text, null);
    }

    static log(text: string, newLine = true) {
        CLI.info(text, newLine);
        OsEventWriter.info(text, null);
    }

    static write(text: string, newLine = true) {
        process.stdout.write(text + (newLine ? "\n" : ""));
    }

    static sameLineDiff(tokens: any[], compareTokens: any[]) {
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === compareTokens[i]) {
                CLI.error(compareTokens[i] + " ", false);
            } else {
                CLI.success(tokens[i] + " ", false);
            }
        }
    }

    static rewrite(text: string) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(text);
    }

    static trace(toLog: any) {
        CLI.object(toLog);
        const stack = new Error().stack?.split("\n")
            .slice(2)
            .join("\n");
        CLI.debug(stack ?? "");
    }

    static object(obj: any) {
        CLI.debug(JSON.stringify(obj, null, 4));
    }
}