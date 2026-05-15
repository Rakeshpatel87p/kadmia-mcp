// Kadmia MCP Server - Entry Point

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { LEARNER_ID, API_KEY } from "./config.js";
import { registerAllTools } from "./tools/index.js";

// Create the MCP server
const server = new McpServer({
  name: "kadmia-mcp",
  version: "1.0.0",
});

// Register all tools
registerAllTools(server);

// Start the server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Kadmia MCP server running on stdio");
  console.error(`API_KEY: ${API_KEY ? "SET" : "NOT SET"}`);
  console.error(`LEARNER_ID: ${LEARNER_ID ? "SET" : "NOT SET"}`);
  if (LEARNER_ID) {
    console.error(`Authenticated as learner`);
  } else {
    console.error("Warning: KADMIA_LEARNER_ID not set. Tools requiring authentication will fail.");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
