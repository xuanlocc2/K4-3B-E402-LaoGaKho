/**
 * Shared types used across multiple modules.
 *
 * Centralising these avoids circular import issues when multiple files
 * need to reference the same type (e.g. ChatMessage in App.tsx, ChatBox.tsx, TutorResponse.tsx).
 */

/**
 * A single message in the chat panel.
 * badgeLevel and badgeConfidence are embedded on tutor-role messages
 * so TutorResponse renders a single authoritative badge — no prop-drilling needed.
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  /**
   * Understanding level shown in the badge (tutor messages only).
   * 'unknown' is excluded — broken-segment responses never appear in the chat history.
   */
  badgeLevel?: 'beginner' | 'intermediate' | 'advanced';
  /** Confidence shown next to the badge (tutor messages only, 0–1). */
  badgeConfidence?: number;
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
