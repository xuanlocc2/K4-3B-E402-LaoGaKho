/**
 * Segment detection — determines if the user's query belongs to a "broken"
 * segment where reliable tutoring is not possible.
 *
 * Detection rules (HV2 §2, Group A + B):
 *
 *   BROKEN if ANY of the following is true:
 *     A1. grade_missing = true  AND  history.length === 0
 *     B1. selectedText.length < 5  AND  history.length === 0
 *     B2. Word-overlap score between selectedText and transcript < 0.15
 *         (cosine-like Jaccard on word tokens, case-insensitive)
 *
 *   NORMAL otherwise.
 *
 * The transcript vocabulary is injected at call time via the `transcriptWords`
 * parameter so this module stays pure and testable.
 */

export type SegmentReason =
  | 'grade_missing'   // profile.gradeMissing && history empty
  | 'no_evidence';    // selected text unrelated to transcript

export interface SegmentResult {
  isBroken: boolean;
  reason: SegmentReason | null;
}

// ─── Word-overlap helper ──────────────────────────────────────────────────────

/**
 * Jaccard similarity between two strings at the word-token level.
 * Returns a value in [0, 1]; higher = more overlap.
 *
 *   overlap = |tokens_a ∩ tokens_b| / |tokens_a ∪ tokens_b|
 *
 * If either string is empty → returns 0 (no evidence).
 */
function jaccardSimilarity(textA: string, textB: string): number {
  const tokenize = (s: string) =>
    s.toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1); // drop single-char tokens

  const setA = new Set(tokenize(textA));
  const setB = new Set(tokenize(textB));

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionSize = 0;
  for (const token of setA) {
    if (setB.has(token)) intersectionSize++;
  }

  const unionSize = setA.size + setB.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

/**
 * Minimum Jaccard score to consider the selection as having transcript evidence.
 *
 * Setting to 0.05 (5%) — intentionally lenient to avoid false positives.
 * A short selection from a large corpus will naturally have low overlap ratio
 * even when the text IS part of the transcript. We guard against truly random
 * text (overlap ≈ 0) rather than penalise partial matches.
 *
 * Mathematical note (transcript ~4000 chars, ~700 word-tokens):
 *   selection of 300 chars ≈ 50 tokens → max |∩| ≈ 45
 *   Jaccard = 45 / (50 + 700 − 45) = 45 / 705 ≈ 0.064
 * Setting threshold to 0.15 would reject all realistic selections → false
 * positives on every non-empty highlight. 0.05 lets through any partial match.
 */
const EVIDENCE_THRESHOLD = 0.05;

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SegmentDetectInput {
  /** Current persona's interaction history. */
  history: Array<{ role: string; text: string }>;
  /** Text the user highlighted in the transcript panel. */
  selectedText: string;
  /** Whether the current persona has grade_missing = true. */
  gradeMissing: boolean;
  /**
   * Full vocabulary of the loaded transcript (concatenated string).
   * Used for word-overlap detection when selectedText is short.
   */
  transcriptText: string;
}

/**
 * Detects whether the user belongs to the "broken" segment.
 *
 * @param input  - see SegmentDetectInput
 * @returns SegmentResult with isBroken flag and reason (null if normal)
 */
export function detectSegment(input: SegmentDetectInput): SegmentResult {
  const { history, selectedText, gradeMissing, transcriptText } = input;
  const hasHistory = history.length > 0;
  const trimmed = selectedText.trim();

  // ── Rule A: grade_missing + no history ──────────────────────────────────
  if (gradeMissing && !hasHistory) {
    return { isBroken: true, reason: 'grade_missing' };
  }

  // ── Rule B1: selected text too short + no history ───────────────────────
  if (trimmed.length < 5 && !hasHistory) {
    return { isBroken: true, reason: 'no_evidence' };
  }

  // ── Rule B2: no word overlap with transcript ────────────────────────────
  if (trimmed.length >= 5) {
    const overlap = jaccardSimilarity(trimmed, transcriptText);
    if (overlap < EVIDENCE_THRESHOLD) {
      return { isBroken: true, reason: 'no_evidence' };
    }
  }

  // ── Normal ──────────────────────────────────────────────────────────────
  return { isBroken: false, reason: null };
}
