// Explain concept tool - explains concepts calibrated to learner's level

import { z } from "zod";
import { getAuthenticatedLearner } from "../config.js";
import { explainConcept } from "../api/endpoints.js";

// Helper: Create error response
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

// Input type
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
      concept: z.string().describe("The concept to explain (e.g., 'closures', 'the Civil War', 'photosynthesis', 'supply and demand')"),
      context: z.string().optional().describe("Optional context to make the explanation more relevant (e.g., code snippet, topic area, or what you're studying)"),
      depth: z.enum(["brief", "standard", "deep"]).optional().describe("How detailed the explanation should be (default: standard)"),
    },
  },
  handler: async (params: ExplainInput) => {
    const input = params;

    // Get authenticated learner
    let learnerId: string;
    try {
      learnerId = getAuthenticatedLearner();
    } catch (error) {
      return createErrorResponse((error as Error).message);
    }

    try {
      const result = await explainConcept(learnerId, {
        concept: input.concept,
        context: input.context,
        depth: input.depth || "standard",
      });

      const response = {
        concept: result.concept,
        explanation: result.explanation,
        mastery: result.mastery,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      return createErrorResponse(`Failed to explain concept: ${(error as Error).message}`);
    }
  },
};
