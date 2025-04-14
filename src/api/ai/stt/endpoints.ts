import { Request, Response } from "express";
import {OpenAI} from "openai";
import fs from "fs";
import {appDataPath} from "../../appData";
import {terminator} from "../../../models/chat/terminator";

let openAi: OpenAI;

export async function transcribeEndpoint(req: Request, res: Response) {
    if (!req.file) {
        res.status(400).send("No file uploaded.");
        return;
    }

    if (!openAi) {
        openAi = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    const file = req.file;
    const tmpFileName = `${appDataPath}/tmp/${file.originalname}`;
    if (!fs.existsSync(`${appDataPath}/tmp`)) {
        fs.mkdirSync(`${appDataPath}/tmp`, { recursive: true });
    }
    fs.writeFileSync(tmpFileName, file.buffer);

    const startTime = performance.now();
    try {
        const text = await openAi.audio.transcriptions.create({
            model: "gpt-4o-mini-transcribe",
            file: fs.createReadStream(tmpFileName),
            response_format: "text",
            stream: true,
            language: "en",
        });
        const reader = text.toReadableStream().getReader();
        let done = false;
        while (!done) {
            const { value, done: doneReading } = await reader.read();
            if (doneReading) {
                break;
            }
            const text = new TextDecoder().decode(value);
            res.write(text + terminator);
        }
        res.end();
    } catch (e) {
        console.error("Error during transcription:", e);
        res.status(500).send(e.toString());
    }
    const diff = performance.now() - startTime;
    console.log(`Transcribed audio in ${diff}ms`);
}