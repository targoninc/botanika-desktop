# Botanika

A local LLM + tooling (with MCP support) client.

# Run

⚠️ **Don't forget to set your environment variables in the `.env` file.**

```bash
npm install
```

```bash
npm run dev
```

## LLM provider

An LLM provider is used to generate most responses.

| Provider name | ENV variable   | API key link                                           |
|---------------|----------------|--------------------------------------------------------|
| OpenAI        | OPENAI_API_KEY | [OpenAI](https://platform.openai.com/account/api-keys) |
| Groq          | GROQ_API_KEY   | [Groq](https://console.groq.com/keys)                  |
