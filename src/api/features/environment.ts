import {getConfiguredApis} from "./configuredFeatures";
import fs from "fs";
import {readFile, writeFile} from "fs/promises";

export function getValidEnvironmentVariables() {
    const configuredApis = getConfiguredApis();
    const values = Object.values(configuredApis);
    return values.reduce((acc, val) => acc.concat(val.envVars.map(e => e.key)), [] as string[]);
}

export async function setEnvironmentVariable(key: string, value: string) {
    process.env[key] = value;
    const envFile = ".env";
    if (!fs.existsSync(envFile)) {
        await writeFile(envFile, "");
    }
    const envFileContent = (await readFile(envFile)).toString();
    const lines = envFileContent.split("\n");
    let found = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(key)) {
            lines[i] = `${key}=${value}`;
            found = true;
            break;
        }
    }
    if (!found) {
        lines.push(`${key}=${value}`);
    }
    await writeFile(envFile, lines.join("\n"));
}
