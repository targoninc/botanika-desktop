import { Application, Request, Response } from "express";
import { createReadStream, existsSync, statSync } from "fs";
import { extname, resolve } from "path";
import {CLI} from "../../CLI";

export async function getAudioEndpoint(req: Request, res: Response) {
    const file = req.query.file as string;
    if (!file) {
        res.status(400).send("Missing file parameter");
        return;
    }

    CLI.debug(`Audio playback requested for file ${file}`);

    const filePath = resolve(file);
    if (!existsSync(filePath)) {
        res.status(404).send("File not found");
        return;
    }

    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.flac'];
    const fileExtension = extname(filePath).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        res.status(400).send("Invalid file type. Only audio files are allowed");
        return;
    }

    // Get file stats for size information
    const stat = statSync(filePath);
    const fileSize = stat.size;

    const range = req.headers.range;
    let fileStream;
    if (range) {
        // Handle range requests (for seeking functionality)
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
            res.status(416).send("Requested range not satisfiable");
            return;
        }

        res.status(206); // Partial content response
        res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Length", end - start + 1);
        res.setHeader("Content-Type", `audio/${fileExtension.slice(1)}`);

        fileStream = createReadStream(filePath, { start, end });
        fileStream.pipe(res);
    } else {
        // Full file request
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Length", fileSize);
        res.setHeader("Content-Type", `audio/${fileExtension.slice(1)}`);

        fileStream = createReadStream(filePath);
        fileStream.pipe(res);
    }

    // Handle file stream errors
    fileStream.on("error", (err: any) => {
        console.error("Error streaming file:", err);
        res.status(500).send("Error streaming file");
    });
}

export function addAudioEndpoints(app: Application) {
    app.get("/audio", getAudioEndpoint);
}