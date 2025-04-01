import {exec } from "node:child_process";
import {EventWriter} from "./EventWriter";
import {EventType} from "./EventType";

const APP_NAME = 'Botanika';

if (process.platform === 'win32') {
    const createSourceCommand = `powershell.exe if (-not (Get-EventLog -LogName Application -Source '${APP_NAME}' -ErrorAction SilentlyContinue))
{
    New-EventLog -LogName Application -Source '${APP_NAME}';
}`;
    exec(createSourceCommand);
}

export class WindowsEventWriter extends EventWriter {
    static logEntry(eventType: 'Information' | 'Error' | 'Warning', message: string): void {
        const cleanMessage = message.replaceAll("'", "''");
        const cmd = `powershell.exe Write-EventLog -LogName Application -Source '${APP_NAME}' -EntryType ${eventType} -EventId ${EventType.Unknown} -Message '${cleanMessage}'`;
        exec(cmd);
    }

    static info(message: string, data: any): void {
        this.logEntry("Information", message);
    }

    static error(message: string, data: any): void {
        this.logEntry("Error", message);
    }

    static warn(message: string, data: any): void {
        this.logEntry("Warning", message);
    }
}