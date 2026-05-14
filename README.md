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

### bookmark_concept

Save a JavaScript concept to study later in the Kadmia app. Use this when you encounter something you want to review or don't fully understand yet. Bookmarked concepts appear in your Kadmia study queue and influence quiz question selection.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `concept` | string | Yes | The JavaScript concept to bookmark (e.g., "closures", "async/await", "this binding") |
| `code_snippet` | string | No | Code snippet for context |
| `note` | string | No | Note about why you're bookmarking this (e.g., "I don't get why this works") |
| `source` | `"manual"` \| `"suggested"` | No | Whether user bookmarked manually or from a suggestion (default: "manual") |

**Output:**
```json
{
  "success": true,
  "message": "Bookmarked \"closures\" for later study",
  "study_queue_count": 5,
  "related_concepts": ["scope", "lexical environment", "higher-order functions"]
}
```

---

### generate_challenge

Generate a JavaScript coding challenge based on a topic. Challenges are calibrated to your skill level from Kadmia, creating personalized practice that's neither too easy nor too hard.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | The JavaScript topic for the challenge (e.g., "array methods", "promises", "closures") |
| `code_context` | string | No | Code you're working on to make the challenge relevant |
| `difficulty` | `"easier"` \| `"match_level"` \| `"stretch"` | No | Difficulty relative to your current level (default: "match_level") |

**Output:**
```json
{
  "challenge": {
    "title": "Filter and Transform Array",
    "description": "Given an array of numbers, filter out negatives and double the remaining values.",
    "difficulty": "intermediate",
    "estimated_time": "10 minutes",
    "starter_code": "function filterAndDouble(nums) {\n  // Your code here\n}",
    "hints": ["Try using filter() first", "Chain map() after filter()"],
    "test_cases": [
      {
        "input": "[1, -2, 3]",
        "expectedOutput": "[2, 6]",
        "description": "Mixed positive and negative"
      }
    ]
  },
  "topic": "array methods",
  "skill_level_used": "intermediate"
}
```

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
│  • Bookmarks    │                    │  • Study queue  │
│  • Challenges   │                    │  • Quiz focus   │
│  • Progress     │   ◄──── MCP ────   │  • Skill levels │
└─────────────────┘                    └─────────────────┘
```

- **Bookmarks** you create while coding appear in your Kadmia study queue
- **Challenges** are generated based on your actual skill level from the app
- **Progress** data flows both ways to personalize your experience

## Development

```bash
# Run with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run the server
npm start
```

## API Endpoints Required

The MCP server communicates with these Kadmia API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/token` | POST | Exchange Firebase UID for JWT token |
| `/user/{uid}/insights/dashboard` | GET | Fetch learner progress |
| `/user/{uid}/bookmarks` | POST | Create a bookmark |
| `/user/{uid}/challenges/generate` | POST | Generate a challenge |
| `/user/{uid}/explain` | POST | Explain a concept at learner's level |

## Future Tools

- `report_struggle` — Signal weak areas to improve quiz targeting
- `get_weak_areas` — Fetch concepts needing review
- `log_code_moment` — Track concepts encountered in real code
- `get_hint` — Scaffolded hints without giving away answers
- `mark_understood` — Confirm comprehension of a concept
