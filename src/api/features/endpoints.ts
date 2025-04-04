import {Application, Request, Response} from "express";
import {getValidEnvironmentVariables, setEnvironmentVariable} from "./environment";

export async function setEnvironmentVariableEndpoint(req: Request, res: Response) {
    const key = req.body.key;
    const value = req.body.value;
    if (!key || !value) {
        res.status(400).send('Missing key or value parameter');
        return;
    }

    const validEnvVars = await getValidEnvironmentVariables();
    if (!validEnvVars.includes(key)) {
        res.status(400).send('Invalid key');
        return;
    }

    await setEnvironmentVariable(key, value);
    res.send('Environment variable set');
}

export function addFeatureEndpoints(app: Application) {
    app.post('/setEnvironmentVariable', setEnvironmentVariableEndpoint);
}