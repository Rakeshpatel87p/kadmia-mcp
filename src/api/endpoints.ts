// Kadmia API endpoint functions

import { getKadmiaToken, kadmiaFetch } from "./client.js";
import { KADMIA_API_BASE } from "../config.js";
import type {
  BookmarkRequest,
  BookmarkResponse,
  ChallengeRequest,
  ChallengeResponse,
  ExplainRequest,
  ExplainResponse,
} from "../types/index.js";

// Track MCP tool usage (fire-and-forget)
export async function trackUsage(
  uid: string,
  data: {
    tool_name: string;
    success: boolean;
    error_message?: string;
    duration_ms: number;
  }
): Promise<void> {
  try {
    const token = await getKadmiaToken(uid);
    await fetch(`${KADMIA_API_BASE}/mcp/usage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  } catch {
    // Silently ignore tracking errors
  }
}

// Fetch learner dashboard data
export async function fetchLearnerDashboard(uid: string): Promise<object> {
  const token = await getKadmiaToken(uid);
  return kadmiaFetch<object>(`/user/${uid}/insights/dashboard`, token);
}

// Create a bookmark for a concept to study later
export async function createBookmark(uid: string, bookmark: BookmarkRequest): Promise<BookmarkResponse> {
  const token = await getKadmiaToken(uid);
  return kadmiaFetch<BookmarkResponse>(`/user/${uid}/bookmarks`, token, {
    method: "POST",
    body: JSON.stringify(bookmark),
  });
}

// Generate a coding challenge calibrated to the learner's level
export async function generateChallenge(uid: string, request: ChallengeRequest): Promise<ChallengeResponse> {
  const token = await getKadmiaToken(uid);
  return kadmiaFetch<ChallengeResponse>(`/user/${uid}/challenges/generate`, token, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// Explain a concept at the learner's skill level
export async function explainConcept(uid: string, request: ExplainRequest): Promise<ExplainResponse> {
  const token = await getKadmiaToken(uid);
  return kadmiaFetch<ExplainResponse>(`/mcp/socratic-explain`, token, {
    method: "POST",
    body: JSON.stringify(request),
  });
}
