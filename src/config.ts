// Environment variables & constants

export const KADMIA_API_BASE =
  process.env.KADMIA_API_BASE ||
  "https://kadmia-postgresql-staging.up.railway.app/api";

// Parse --learner-id from command line args
function parseLearnerIdFromArgs(): string | undefined {
  const args = process.argv;
  const flagIndex = args.indexOf("--learner-id");
  if (flagIndex !== -1 && args[flagIndex + 1]) {
    return args[flagIndex + 1];
  }
  return undefined;
}

// CLI arg takes precedence over environment variable
export const LEARNER_ID =
  parseLearnerIdFromArgs() || process.env.KADMIA_LEARNER_ID;

export const API_KEY = process.env.KADMIA_API_KEY;

// Helper: Get authenticated learner or throw error
export function getAuthenticatedLearner(): string {
  if (!LEARNER_ID) {
    throw new Error(
      "Not authenticated. Set KADMIA_LEARNER_ID environment variable with your Firebase UID. " +
        "Find your UID in your Kadmia profile at Settings → Developer.",
    );
  }
  if (!API_KEY) {
    throw new Error(
      "Missing API key. Set KADMIA_API_KEY environment variable.",
    );
  }
  return LEARNER_ID;
}
