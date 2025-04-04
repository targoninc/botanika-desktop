import {ResourceReference} from "./ResourceReference";
import {GeneratedFile, ToolResultUnion, ToolSet} from "ai";

export interface ChatMessage {
    type: "system" | "user" | "assistant" | "tool";
    references: ResourceReference[];
    files: GeneratedFile[];
    toolResult?: ToolResultUnion<ToolSet>;
    text: string;
    time: number;
    id: string;
    finished: boolean;
    hasAudio?: boolean;
    provider?: string;
    model?: string;
}