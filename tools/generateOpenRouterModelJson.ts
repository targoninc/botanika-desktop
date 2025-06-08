import {ModelDefinition} from "../src/models/llms/ModelDefinition";
import {ModelCapability} from "../src/models/llms/ModelCapability";
import fs from "fs";

function getCapabilities(params: string[]) {
    let caps = [ModelCapability.streaming, ModelCapability.fileInput];

    if (params.includes("tool") && params.includes("tool_choice")) {
        caps.push(ModelCapability.tools);
    }

    return caps;
}

fetch("https://openrouter.ai/api/v1/models").then(async r => {
    const json = await r.json();

    const mapped = json.data.map(m => {
        return <ModelDefinition>{
            id: m.id,
            displayName: m.name,
            capabilities: getCapabilities(m.supported_parameters)
        }
    });
    fs.writeFileSync("./models.json", JSON.stringify(mapped, null, 2));
});

