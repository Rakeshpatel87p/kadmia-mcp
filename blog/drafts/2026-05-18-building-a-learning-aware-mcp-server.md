---
title: "Building a Learning-Aware MCP Server: How Kadmia Brings Personalized Education to Your IDE"
date: 2026-05-18
author: "Kadmia"
tags: [mcp, model-context-protocol, typescript, ai, learning, claude, cursor]
repo_link: "https://github.com/rakeshpatel87p/kadmia-mcp"
---

# Building a Learning-Aware MCP Server: How Kadmia Brings Personalized Education to Your IDE

## Introduction

You're debugging a closure issue at 11 PM. You kind of remember how closures work, but not well enough to fix the bug confidently. Do you:

A) Open a new tab, search "JavaScript closures," and scroll past five articles written for absolute beginners
B) Ask your AI assistant, get a generic explanation that doesn't account for what you already know
C) Get an explanation calibrated to your actual skill level, right in your editor

Option C didn't exist until recently. The Model Context Protocol (MCP) changes that by letting AI assistants connect to external services—including learning platforms that know exactly where you are in your programming journey.

This article walks through how we built the Kadmia MCP server: a bridge between your IDE and a learning platform that tracks your JavaScript mastery. You'll see the patterns we used, the architectural decisions we made, and how you can apply these techniques to build your own MCP integrations.

## The Challenge

Learning while coding has always involved friction. The traditional workflow looks like this:

1. Encounter a concept you don't fully understand
2. Context-switch to documentation or tutorials
3. Read content calibrated for someone else's skill level
4. Try to map generic explanations back to your specific code
5. Lose your flow state somewhere around step 2

AI assistants improved step 3 and 4, but they still lack crucial context: *what do you already know?* A senior developer asking about closures needs a different explanation than someone who just learned what functions are.

The Kadmia app already tracks this. It knows which concepts you've mastered, where you struggle, and how you learn best. The challenge was getting that intelligence into the IDE where learning actually happens.

MCP provided the answer—a standardized protocol for AI assistants to call external tools. We needed to build a server that:

- Authenticates learners securely
- Fetches personalized data from the Kadmia API
- Exposes tools that AI assistants can invoke naturally
- Tracks usage to improve the learning experience over time

## The Solution

The Kadmia MCP server is a TypeScript application that runs locally and communicates with AI assistants via stdio. Let's examine the key architectural patterns.

### Project Structure

```
src/
├── api/               # API client and endpoint functions
│   ├── client.ts      # Authentication and fetch helpers
│   └── endpoints.ts   # Domain-specific API calls
├── tools/             # MCP tool definitions
│   ├── index.ts       # Tool registration hub
│   ├── progress.ts    # Learner progress tool
│   ├── bookmark.ts    # Bookmark concept tool
│   ├── challenge.ts   # Generate challenge tool
│   └── explain.ts     # Explain concept tool
├── types/             # TypeScript interfaces
├── config.ts          # Environment configuration
└── index.ts           # Server entry point
```

This separation keeps concerns isolated: API logic doesn't leak into tool definitions, and tools don't need to know about authentication mechanics.

### Pattern 1: Tool Registration with Usage Tracking

Every tool invocation is an opportunity to learn about how developers actually use the system. We wrapped all tool handlers with a higher-order function that tracks success, failure, and duration:

```typescript
// src/tools/index.ts

function withUsageTracking<T, R>(
  toolName: string,
  handler: (params: T) => Promise<R>
): (params: T) => Promise<R> {
  return async (params: T): Promise<R> => {
    const startTime = Date.now();
    let success = true;
    let errorMessage: string | undefined;

    try {
      const result = await handler(params);
      return result;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      const durationMs = Date.now() - startTime;
      if (LEARNER_ID) {
        trackUsage(LEARNER_ID, {
          tool_name: toolName,
          success,
          error_message: errorMessage,
          duration_ms: durationMs,
        });
      }
    }
  };
}

// Registration becomes clean and consistent
export function registerAllTools(server: McpServer): void {
  server.registerTool(
    explainTool.name,
    explainTool.config,
    withUsageTracking(explainTool.name, explainTool.handler)
  );

  server.registerTool(
    bookmarkTool.name,
    bookmarkTool.config,
    withUsageTracking(bookmarkTool.name, bookmarkTool.handler)
  );

  // ... more tools
}
```

This pattern provides several benefits:

- **Separation of concerns**: Tool handlers don't know they're being tracked
- **Consistent telemetry**: Every tool gets the same metrics automatically
- **Failure resilience**: The `finally` block ensures tracking happens even when tools throw
- **Fire-and-forget**: Tracking errors are silently ignored so they never break the user experience

### Pattern 2: Authenticated API Client

The Kadmia API uses short-lived tokens for authentication. Rather than passing tokens through every function, we built a thin client layer that handles token acquisition transparently:

```typescript
// src/api/client.ts

export async function getKadmiaToken(uid: string): Promise<string> {
  const response = await fetch(`${KADMIA_API_BASE}/token/service`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uid, apiKey: API_KEY }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get token: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as TokenResponse;
  return data.token;
}

export async function kadmiaFetch<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${KADMIA_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Kadmia API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}
```

The generic `kadmiaFetch<T>` function provides type safety while keeping the actual fetch logic DRY. Endpoint functions then become simple one-liners:

```typescript
// src/api/endpoints.ts

export async function explainConcept(
  uid: string,
  request: ExplainRequest
): Promise<ExplainResponse> {
  const token = await getKadmiaToken(uid);
  return kadmiaFetch<ExplainResponse>(`/mcp/socratic-explain`, token, {
    method: "POST",
    body: JSON.stringify(request),
  });
}
```

### Pattern 3: Complete Tool Implementation

Here's the full implementation of the `explain_concept` tool, showing how all the pieces fit together:

```typescript
// src/tools/explain.ts

import { z } from "zod";
import { getAuthenticatedLearner } from "../config.js";
import { explainConcept } from "../api/endpoints.js";

function createErrorResponse(message: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ error: message }, null, 2),
      },
    ],
    isError: true,
  };
}

interface ExplainInput {
  concept: string;
  context?: string;
  depth?: "brief" | "standard" | "deep";
}

export const explainTool = {
  name: "explain_concept",
  config: {
    description: "Explain a concept at your skill level. Returns an explanation tailored to your Kadmia progress with examples and links to relevant lessons.",
    inputSchema: {
      concept: z.string().describe("The concept to explain (e.g., 'closures', 'the Civil War', 'photosynthesis')"),
      context: z.string().optional().describe("Optional context to make the explanation more relevant"),
      depth: z.enum(["brief", "standard", "deep"]).optional().describe("How detailed the explanation should be"),
    },
  },
  handler: async (params: ExplainInput) => {
    // Step 1: Verify authentication
    let learnerId: string;
    try {
      learnerId = getAuthenticatedLearner();
    } catch (error) {
      return createErrorResponse((error as Error).message);
    }

    // Step 2: Call the API
    try {
      const result = await explainConcept(learnerId, {
        concept: params.concept,
        context: params.context,
        depth: params.depth || "standard",
      });

      // Step 3: Format the response
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              concept: result.concept,
              explanation: result.explanation,
              mastery: result.mastery,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return createErrorResponse(`Failed to explain concept: ${(error as Error).message}`);
    }
  },
};
```

Notice the structure:

1. **Zod schemas** define and validate input parameters with descriptions that help AI assistants understand what to pass
2. **Authentication check** happens first, returning a helpful error if credentials are missing
3. **API call** is wrapped in try/catch with specific error messages
4. **Response formatting** follows MCP conventions with typed content blocks

The `isError: true` flag on error responses tells the AI assistant that something went wrong, allowing it to communicate the failure appropriately to the user.

### The Server Entry Point

The main entry point ties everything together with minimal ceremony:

```typescript
// src/index.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index.js";

const server = new McpServer({
  name: "kadmia-mcp",
  version: "1.0.0",
});

registerAllTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Kadmia MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

Logging goes to stderr so it doesn't interfere with the JSON-RPC communication on stdout.

## What You Can Apply

Here are practical takeaways you can use when building your own MCP servers:

1. **Use higher-order functions for cross-cutting concerns**: The `withUsageTracking` wrapper demonstrates how to add behavior to all tools without modifying each one. This pattern works for logging, rate limiting, caching, or any other concern that spans multiple tools.

2. **Separate API client from tool logic**: Tools should describe *what* to do, not *how* to talk to external services. This separation makes tools easier to test and lets you swap API implementations without touching tool code.

3. **Design for helpful errors**: When authentication fails or an API returns an error, the message should tell users exactly what to do. "Set KADMIA_LEARNER_ID environment variable with your Firebase UID" is actionable; "Authentication failed" is not.

4. **Use Zod for input validation**: The MCP SDK integrates with Zod schemas, giving you runtime validation and self-documenting parameter descriptions. AI assistants use these descriptions to understand how to invoke your tools.

5. **Keep the entry point minimal**: Configuration, tool registration, and transport setup should each be one line. If your `index.ts` is getting complex, you're probably mixing concerns.

## Conclusion

The Kadmia MCP server demonstrates that personalized learning doesn't have to mean leaving your coding environment. By connecting an AI assistant to a learning platform that knows your skill level, explanations become relevant and challenges become appropriately difficult.

The patterns here—usage tracking wrappers, typed API clients, structured tool definitions—apply to any MCP server you might build. Whether you're connecting to a learning platform, a project management tool, or a custom internal service, the architecture remains the same: clean separation between protocol handling, business logic, and external communication.

The code is open source at [github.com/rakeshpatel87p/kadmia-mcp](https://github.com/rakeshpatel87p/kadmia-mcp). Future tools on the roadmap include `report_struggle` for signaling weak areas, `get_hint` for scaffolded assistance, and `log_code_moment` for tracking concepts as they appear in real code.

Learning happens best in context. MCP makes that context accessible.

---
*This article was generated from the [kadmia-mcp](https://github.com/rakeshpatel87p/kadmia-mcp) repository.*
