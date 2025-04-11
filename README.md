# Botanika

A local LLM + tooling (with MCP support) client. All data is stored locally. Bring your own API keys.

## Client Features

| Support  | TTS | STT | Open source | MCP Support | Desktop App | Web App |
|----------|-----|-----|-------------|-------------|-------------|---------|
| Botanika | ✅   | ❌   | ✅           | ✅           | ✅           | ❌       |
| ChatGPT  | ✅   | ✅   | ❌           | ❌           | ❌           | ✅       |
| Copilot  | ✅   | ✅   | ❌           | ❌           | ❌           | ✅       |
| Claude   | ❌   | ❌   | ❌           | ✅           | ✅           | ✅       |
| T3.Chat  | ❌   | ❌   | ❌           | ❌           | ❌           | ✅       |

### Native integrations

If you want to use any of these integrations, add them on the "Settings" page.

| Integration name | MCP Server URL                               |
|------------------|----------------------------------------------|
| Google Search    | http://localhost:48678/mcp/sse/google/search |
| Spotify          | http://localhost:48678/mcp/sse/spotify       |

## Screenshots

![A screenshot of the chat interface](https://github.com/user-attachments/assets/8ea3df6a-00f6-4c6e-aea7-4562551af144)

![A screenshot of the settings interface](https://github.com/user-attachments/assets/07c61f0c-1d23-4e98-9b15-305f131c8908)


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
