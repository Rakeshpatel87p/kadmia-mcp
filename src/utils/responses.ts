// Response formatting helpers
// Note: Currently tools define their response helpers inline to maintain
// compatibility with MCP SDK's strict type requirements.
// This file is available for future shared utilities.

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
