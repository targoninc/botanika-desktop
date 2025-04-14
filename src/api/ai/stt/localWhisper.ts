import {Response} from "express";
import {terminator} from "../../../models/chat/terminator";
import {CLI} from "../../CLI";

const {whisper} = require("whisper-tnode");
const modelName = "tiny.en";

export async function transcribeLocal(file: string, res: Response, isRetry = false) {
    try {
        const transcript = await whisper({
            filePath: file,
            options: {
                modelName,
                whisperOptions: {
                    gen_file_txt: true,
                    word_timestamps: true
                }
            }
        });

        res.write(transcript.join(' ') + terminator);
        res.end();
    } catch (e) {
        CLI.error("Error during transcription: " + e.toString());
        res.status(500).send(e.toString());
    }
}
