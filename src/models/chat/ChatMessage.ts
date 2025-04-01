import {ResourceReference} from "./ResourceReference";

export interface ChatMessage {
    type: "system" | "user" | "bot" | "component";
    references: ResourceReference[];
    text: string;
    time: number;
    id: string;
}