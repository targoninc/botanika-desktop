import Groq from "groq-sdk";
import dotenv from "dotenv";
import {ModelDefinition} from "../../../../ui/classes/modelDefinition";

dotenv.config();

export async function getGroqModels() {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    return (await groq.models.list()).data as ModelDefinition[];
}