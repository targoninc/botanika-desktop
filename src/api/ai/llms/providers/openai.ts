import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function getOpenaiModels() {
    return (await axios.get("https://api.openai.com/v1/models", {
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        }
    })).data.data;
}