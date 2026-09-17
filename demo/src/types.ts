/**
 * Shared types used across multiple modules.
 *
 * Centralising these avoids circular import issues when multiple files
 * need to reference the same type (e.g. ChatMessage in App.tsx, ChatBox.tsx, TutorResponse.tsx).
 */

/**
 * A single message in the chat panel.
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'tutor';
  content: string;
}

/**
 * Tutor response returned by callGemini().
 * Matches the JSON schema output by the Gemini prompt.
 */
export interface TutorResponse {
  level: 'beginner' | 'intermediate' | 'advanced' | 'unknown';
  /** 0..1 confidence score. */
  confidence: number;
  segment: 'normal' | 'broken';
  segment_reason: 'grade_missing' | 'no_evidence' | null;
  /** Markdown-formatted answer. */
  answer: string;
  /** Vietnamese warning message when segment is broken. */
  warning: string | null;
  /** Action options for broken segments. */
  options: string[];
}

/** Understanding level of a user. */
export type Level = 'beginner' | 'intermediate' | 'advanced';

/** A persona (user profile + chat history). */
export interface PersonaData {
  id: string;
  name: string;
  level: string;
  history: Array<{ role: string; text: string }>;
  grade_missing: boolean;
}
