// Tool exports and registration helper

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { helloTool } from "./hello.js";
import { progressTool } from "./progress.js";
import { bookmarkTool } from "./bookmark.js";
import { challengeTool } from "./challenge.js";
import { explainTool } from "./explain.js";
import { trackUsage } from "../api/endpoints.js";
import { LEARNER_ID } from "../config.js";

// Wrap a tool handler with usage tracking
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

// Register all tools with the MCP server
export function registerAllTools(server: McpServer): void {
  // Register hello tool
  server.registerTool(
    helloTool.name,
    helloTool.config,
    withUsageTracking(helloTool.name, helloTool.handler)
  );

  // Register progress tool
  server.registerTool(
    progressTool.name,
    progressTool.config,
    withUsageTracking(progressTool.name, progressTool.handler)
  );

  // Register bookmark tool
  server.registerTool(
    bookmarkTool.name,
    bookmarkTool.config,
    withUsageTracking(bookmarkTool.name, bookmarkTool.handler)
  );

  // Register challenge tool
  server.registerTool(
    challengeTool.name,
    challengeTool.config,
    withUsageTracking(challengeTool.name, challengeTool.handler)
  );

  // Register explain tool
  server.registerTool(
    explainTool.name,
    explainTool.config,
    withUsageTracking(explainTool.name, explainTool.handler)
  );
}
