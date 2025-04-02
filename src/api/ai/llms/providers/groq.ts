import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

export async function getGroqModels() {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    return (await groq.models.list()).data;
}