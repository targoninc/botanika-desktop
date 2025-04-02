function envSet(key: string) {
    return process.env[key] !== undefined && process.env[key].trim() !== "";
}

export function getConfiguredApis() {
    return {
        "Google Search": envSet("GOOGLE_API_KEY"),
        "OpenAI": envSet("OPENAI_API_KEY"),
        "Groq": envSet("GROQ_API_KEY"),
    }
}