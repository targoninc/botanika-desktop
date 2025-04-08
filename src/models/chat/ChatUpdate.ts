import {ChatMessage} from "./ChatMessage";

export interface ChatUpdate {
    chatId: string;
    timestamp: number;
    messages?: ChatMessage[];
    audioUrl?: string;
    error?: string;
}