// Shared TypeScript types

// Kadmia API token response
export interface TokenResponse {
  token: string;
}

// Bookmark request payload
export interface BookmarkRequest {
  concept: string;
  codeSnippet?: string;
  note?: string;
  source: "manual" | "suggested";
}

// Bookmark API response
export interface BookmarkResponse {
  success: boolean;
  bookmarkId: string;
  studyQueueCount: number;
  relatedConcepts: string[];
}

// Challenge request payload
export interface ChallengeRequest {
  topic: string;
  codeContext?: string;
  difficulty: "easier" | "match_level" | "stretch";
}

// Challenge API response
export interface ChallengeResponse {
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  starterCode: string;
  hints: string[];
  testCases: TestCase[];
  skillLevelUsed: string;
}

// Test case for challenges
export interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

// Explain concept request payload
export interface ExplainRequest {
  concept: string;
  context?: string;
  depth: "brief" | "standard" | "deep";
}

// Explain concept API response
export interface ExplainResponse {
  success: boolean;
  concept: string;
  explanation: string;
  mastery: { accuracy: number; questions_answered: number } | null;
}
