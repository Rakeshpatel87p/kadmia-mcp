# Kadmia MCP Server

A Model Context Protocol (MCP) server for integrating the Kadmia JavaScript learning platform with AI assistants like Claude Code, Cursor, and others.

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Kadmia account** - [Sign up free](https://thekadmia.com)

## Quick Start

### 1. Get your Kadmia credentials
Log into [Kadmia](https://thekadmia.com/kadmia-mcp) to get your **Firebase UID** and **API Key**.

### 2. Configure Claude Code

Open your terminal and edit the Claude config file:

```bash
# macOS/Linux
nano ~/.claude.json

# Windows
notepad %USERPROFILE%\.claude.json
```

Add the following (replace the placeholder values with your credentials from Kadmia):

```json
{
  "mcpServers": {
    "kadmia": {
      "command": "npx",
      "args": ["-y", "kadmia-mcp"],
      "env": {
        "KADMIA_LEARNER_ID": "your-firebase-uid-here",
        "KADMIA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Alternative:** Use the `/mcp` command inside Claude Code to add the server interactively.

### 3. Configure Cursor (Alternative)

1. Open Cursor and go to **Settings** (gear icon) → **MCP**
2. Click **Add Server** and enter:
   - **Command**: `npx -y kadmia-mcp`
   - **Environment variables**:
     - `KADMIA_LEARNER_ID=your-firebase-uid-here`
     - `KADMIA_API_KEY=your-api-key-here`

### 4. Verify It Works

Restart Claude Code or Cursor, then ask:

> "Use the Kadmia explain_concept tool to explain closures"

If configured correctly, you'll get a personalized explanation based on your Kadmia skill level.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KADMIA_LEARNER_ID` | Yes | Your Firebase UID from [thekadmia.com/kadmia-mcp](https://thekadmia.com/kadmia-mcp) |
| `KADMIA_API_KEY` | Yes | Your API key from [thekadmia.com/kadmia-mcp](https://thekadmia.com/kadmia-mcp) |
| `KADMIA_API_BASE` | No | API base URL (default: Kadmia staging API) |

## Available Tools

### get_learner_progress

Get your learning progress from Kadmia (requires authentication).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| — | — | — | No input required |

**Output:** Progress data including subjects, recent activity, and learning insights.

---

### explain_concept

Explain a JavaScript concept at your skill level. Returns an explanation tailored to your Kadmia progress with examples, common mistakes, and links to relevant lessons.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `concept` | string | Yes | The JavaScript concept to explain (e.g., "closures", "event loop", "prototype chain") |
| `code_context` | string | No | Code snippet to make the explanation more relevant |
| `depth` | `"brief"` \| `"standard"` \| `"deep"` | No | How detailed the explanation should be (default: "standard") |

## How It Works

The Kadmia MCP server creates a bridge between your coding environment and the Kadmia learning app:

```
┌─────────────────┐                    ┌─────────────────┐
│   IDE/Coding    │                    │   Kadmia App    │
│                 │   ──── MCP ────►   │                 │
│  • Explanations │                    │  • Skill levels │
│  • Progress     │   ◄──── MCP ────   │  • Mastery data │
└─────────────────┘                    └─────────────────┘
```

- **Explanations** are tailored to your skill level from Kadmia
- **Progress** data personalizes your learning experience

## Future Tools

- `bookmark_concept` — Save concepts to study later in the Kadmia app
- `generate_challenge` — Get coding challenges calibrated to your skill level
- `js_comedy_hour` — Hear the JS joke of the day

## Development

```bash
# Run with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run the server
npm start
```

