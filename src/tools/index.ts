// Tool exports and registration helper

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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

// Tool configuration
const tools = [
  progressTool,
  bookmarkTool,
  challengeTool,
  explainTool,
] as const;

// Register all tools with the MCP server
export function registerAllTools(server: McpServer): void {
  tools.forEach((tool) => {
    server.registerTool(
      tool.name,
      tool.config,
      withUsageTracking(tool.name, tool.handler as any)
    );
  });
}
