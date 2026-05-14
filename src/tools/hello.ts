// Hello tool - simple test to verify the server is working

import { z } from "zod";
import { LEARNER_ID } from "../config.js";

export const helloTool = {
  name: "hello",
  config: {
    description: "A simple greeting tool to test the Kadmia MCP server connection",
    inputSchema: {
      name: z.string().describe("The name to greet"),
    },
  },
  handler: async (args: { name: string }) => {
    const { name } = args;
    const authStatus = LEARNER_ID
      ? `Authenticated as: ${LEARNER_ID}`
      : "Not authenticated (set KADMIA_LEARNER_ID)";
    return {
      content: [
        {
          type: "text" as const,
          text: `Hello, ${name}! Kadmia MCP server is running.\n${authStatus}`,
        },
      ],
    };
  },
};
