// Get learner progress tool - fetches real data from Kadmia API

import { getAuthenticatedLearner } from "../config.js";
import { fetchLearnerDashboard } from "../api/endpoints.js";

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

export const progressTool = {
  name: "get_learner_progress",
  config: {
    description: "Get your learning progress from Kadmia (requires authentication via KADMIA_LEARNER_ID env var)",
    inputSchema: {},
  },
  handler: async () => {
    let learnerId: string;
    try {
      learnerId = getAuthenticatedLearner();
    } catch (error) {
      return createErrorResponse((error as Error).message);
    }

    try {
      const dashboardData = await fetchLearnerDashboard(learnerId);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(dashboardData, null, 2),
          },
        ],
      };
    } catch (error) {
      return createErrorResponse(`Kadmia API error: ${(error as Error).message}`);
    }
  },
};
