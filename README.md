# Kadmia MCP Server

A Model Context Protocol (MCP) server for integrating the Kadmia JavaScript learning platform with AI assistants like Claude Code, Cursor, and others.

## Quick Start

### 1. Get your Kadmia Firebase UID
Log into [Kadmia](https://kadmia.com) and go to **Settings → Developer** to find your Firebase UID.

### 2. Configure Claude Code
Edit `~/.claude.json` and add:

```json
{
  "mcpServers": {
    "kadmia": {
      "command": "npx",
      "args": ["-y", "kadmia-mcp"],
      "env": {
        "KADMIA_LEARNER_ID": "your-firebase-uid-here",
        "KADMIA_ADMIN_SECRET": "your-admin-secret-here"
      }
    }
  }
}
```

Or use the `/mcp` command in Claude Code to add the server interactively.

### 3. Configure Cursor
Go to **Settings → MCP** and add a new server with:
- **Command**: `npx -y kadmia-mcp`
- **Environment variables**:
  - `KADMIA_LEARNER_ID=your-firebase-uid-here`
  - `KADMIA_ADMIN_SECRET=your-admin-secret-here`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KADMIA_LEARNER_ID` | Yes | Your Firebase UID from Kadmia Settings → Developer |
| `KADMIA_ADMIN_SECRET` | Yes | Admin secret for API authentication |
| `KADMIA_API_BASE` | No | API base URL (default: Kadmia production API) |

## Available Tools

### hello

A simple test tool to verify the server connection.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | The name to greet |

**Output:** A greeting message confirming the server is running and authentication status.

---

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

**Output:**
```json
{
  "concept": "closures",
  "skill_level_used": "intermediate",
  "explanation": {
    "summary": "A closure is a function that remembers variables from its outer scope.",
    "detailed": "When a function is created inside another function...",
    "analogy": "Think of a closure like a backpack that a function carries..."
  },
  "examples": [
    {
      "title": "Counter with closure",
      "code": "function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}",
      "explanation": "The inner function 'closes over' the count variable..."
    }
  ],
  "common_mistakes": [
    {
      "description": "Loop variable capture",
      "wrongCode": "for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }",
      "rightCode": "for (let i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }"
    }
  ],
  "related_concepts": ["scope", "lexical environment", "higher-order functions"],
  "kadmia_lessons": [
    {
      "title": "Understanding Closures",
      "url": "https://kadmia.com/lessons/closures",
      "relevance": "Core lesson on this topic"
    }
  ]
}
```

---

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

## Development

```bash
# Run with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run the server
npm start
```

