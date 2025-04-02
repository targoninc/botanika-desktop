import {ResourceReference} from "./ResourceReference";

export interface ChatToolResult {
    references: ResourceReference[];
    text: string;
}