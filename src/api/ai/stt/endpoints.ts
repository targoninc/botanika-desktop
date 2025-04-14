import { Request, Response } from "express";
import fs from "fs";
import {appDataPath} from "../../appData";
import {getConfigKey} from "../../configuration";
import {transcribeLocal} from "./localWhisper";
import {transcribeOpenAI} from "./openaiWhisper";

export async function transcribeEndpoint(req: Request, res: Response) {
    if (!req.file) {
        res.status(400).send("No file uploaded.");
        return;
    }

    const file = req.file;
    const tmpFileName = `${appDataPath}/tmp/${file.originalname}`;
    if (!fs.existsSync(`${appDataPath}/tmp`)) {
        fs.mkdirSync(`${appDataPath}/tmp`, { recursive: true });
    }
    fs.writeFileSync(tmpFileName, file.buffer);

    const startTime = performance.now();
    try {
        switch (getConfigKey("transcriptionProvider")) {
            case "openai":
                await transcribeOpenAI(tmpFileName, res);
                break;
            case "local":
                await transcribeLocal(tmpFileName, res);
                break;
            default:
                throw new Error("Invalid transcription provider");
        }
    } catch (e) {
        console.error("Error during transcription:", e);
        res.status(500).send(e.toString());
    }
    const diff = performance.now() - startTime;
    console.log(`Transcribed audio in ${diff}ms`);
}