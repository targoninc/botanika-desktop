import {Response} from "express";
import {terminator} from "../../../models/chat/terminator";
import {exec} from "node:child_process";
import {CLI} from "../../CLI";

const {whisper} = require("whisper-tnode");
const modelName = "large-v1";

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

        if (transcript.length === 0 && !isRetry) {
            await downloadModel(modelName);
            return transcribeLocal(file, res, true);
        }

        res.write(transcript.join(' ') + terminator);
        res.end();
    } catch (e) {
        CLI.error("Error during transcription: " + e.toString());
        res.status(500).send(e.toString());
    }
}

async function downloadModel(modelName: string) {
    const command = `pnpm whisper-tnode download --model ${modelName}`;
    CLI.info("Downloading model...");
    try {
        const {stdout, stderr} = await new Promise<{stdout: string, stderr: string}>((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({stdout, stderr});
                }
            });
        });
    } catch (e) {
        CLI.error("Error downloading model: " + e.toString());
        return;
    }
    CLI.success("Model downloaded");
}