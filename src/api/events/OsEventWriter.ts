import {EventWriter} from "./EventWriter";
import {WindowsEventWriter} from "./WindowsEventWriter";

const currentOs = process.platform;

export class OsEventWriter extends EventWriter {
    static info(message: string, data: any): void {
        switch (currentOs) {
            case "win32":
                WindowsEventWriter.info(message, data);
                break;
        }
    }

    static error(message: string, data: any): void {
        switch (currentOs) {
            case "win32":
                WindowsEventWriter.error(message, data);
                break;
        }
    }

    static warn(message: string, data: any): void {
        switch (currentOs) {
            case "win32":
                WindowsEventWriter.warn(message, data);
                break;
        }
    }
}