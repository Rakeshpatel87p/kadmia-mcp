// Bookmark concept tool - saves concepts to study later in the Kadmia app

import { z } from "zod";
import { getAuthenticatedLearner } from "../config.js";
import { createBookmark } from "../api/endpoints.js";

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
interface BookmarkInput {
  concept: string;
  code_snippet?: string;
  note?: string;
  source?: "manual" | "suggested";
}

export const bookmarkTool = {
  name: "bookmark_concept",
  config: {
    description: "Save a JavaScript concept to study later in the Kadmia app. Use this when you encounter something you want to review or don't fully understand yet.",
    inputSchema: {
      concept: z.string().describe("The JavaScript concept to bookmark (e.g., 'closures', 'async/await', 'this binding')"),
      code_snippet: z.string().optional().describe("Optional code snippet for context"),
      note: z.string().optional().describe("Optional note about why you're bookmarking this"),
      source: z.enum(["manual", "suggested"]).optional().describe("Whether user bookmarked manually or from a suggestion"),
    },
  },
  handler: async (params: BookmarkInput) => {
    const input = params;

    // Get authenticated learner
    let learnerId: string;
    try {
      learnerId = getAuthenticatedLearner();
    } catch (error) {
      return createErrorResponse((error as Error).message);
    }

    try {
      const result = await createBookmark(learnerId, {
        concept: input.concept,
        codeSnippet: input.code_snippet,
        note: input.note,
        source: input.source || "manual",
      });

      const response = {
        success: true,
        message: `Bookmarked "${input.concept}" for later study`,
        study_queue_count: result.studyQueueCount,
        related_concepts: result.relatedConcepts,
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
      return createErrorResponse(`Failed to bookmark concept: ${(error as Error).message}`);
    }
  },
};
