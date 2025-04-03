import {ResourceReference} from "./ResourceReference";
import {ToolResultUnion, ToolSet} from "ai";

export interface ChatMessage {
    type: "system" | "user" | "assistant" | "tool";
    references: ResourceReference[];
    toolResult?: ToolResultUnion<ToolSet>;
    text: string;
    time: number;
    id: string;
    finished: boolean;
    hasAudio?: boolean;
}