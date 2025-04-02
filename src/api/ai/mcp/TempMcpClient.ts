import {ToolSet} from "ai";

export abstract class TempMcpClient {
    async tools() {
        return {} as ToolSet;
    }
}