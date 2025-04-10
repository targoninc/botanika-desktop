import {ResourceReference} from "./ResourceReference";

export interface ChatToolResult {
    references: ResourceReference[];
    text: string;
    messageId?: string;
    metadata?: any;
}