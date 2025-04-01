import {ChatMessage} from "./ChatMessage";

export interface ChatContext {
    name: string;
    createdAt: number;
    updatedAt: number;
    id: string;
    history: ChatMessage[];
}
