// Generate challenge tool - creates practice problems calibrated to learner's level

import { z } from "zod";
import { getAuthenticatedLearner } from "../config.js";
import { generateChallenge } from "../api/endpoints.js";

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
interface ChallengeInput {
  topic: string;
  code_context?: string;
  difficulty?: "easier" | "match_level" | "stretch";
}

export const challengeTool = {
  name: "generate_challenge",
  config: {
    description: "Generate a JavaScript coding challenge based on a topic or your current code. Challenges are calibrated to your skill level from Kadmia.",
    inputSchema: {
      topic: z.string().describe("The JavaScript topic for the challenge (e.g., 'array methods', 'promises', 'closures')"),
      code_context: z.string().optional().describe("Optional code you're working on to make the challenge relevant"),
      difficulty: z.enum(["easier", "match_level", "stretch"]).optional().describe("Difficulty relative to your current level (default: match_level)"),
    },
  },
  handler: async (params: ChallengeInput) => {
    const input = params;

    // Get authenticated learner
    let learnerId: string;
    try {
      learnerId = getAuthenticatedLearner();
    } catch (error) {
      return createErrorResponse((error as Error).message);
    }

    try {
      const challenge = await generateChallenge(learnerId, {
        topic: input.topic,
        codeContext: input.code_context,
        difficulty: input.difficulty || "match_level",
      });

      const response = {
        challenge: {
          title: challenge.title,
          description: challenge.description,
          difficulty: challenge.difficulty,
          estimated_time: challenge.estimatedTime,
          starter_code: challenge.starterCode,
          hints: challenge.hints,
          test_cases: challenge.testCases,
        },
        topic: input.topic,
        skill_level_used: challenge.skillLevelUsed,
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
      return createErrorResponse(`Failed to generate challenge: ${(error as Error).message}`);
    }
  },
};
