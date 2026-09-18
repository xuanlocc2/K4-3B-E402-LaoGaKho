/**
 * Understanding-level inference from chat history.
 *
 * Algorithm — 4 weighted signals (HV2 §3):
 *
 *  Signal 1 · Question count (weight 25 %)
 *    ≤ 2 questions  → 0.2  (beginner: new or low-engagement user)
 *    3–5 questions  → 0.5  (intermediate)
 *    6+ questions   → 0.8  (advanced: experienced user)
 *
 *  Signal 2 · Average answer length (weight 25 %)
 *    < 50 chars     → 0.2  (beginner: short = not going deep)
 *    50–149 chars   → 0.5  (intermediate)
 *    150+ chars     → 0.8  (advanced: elaborate explanations)
 *
 *  Signal 3 · Technical vocabulary density (weight 30 %)
 *    No match      → 0.3  (beginner)
 *    Has match     → 0.8  (intermediate / advanced)
 *
 *  Signal 4 · Rephrase / simplify requests (weight 20 %)
 *    > 1 request   → 0.2  (beginner: still confused)
 *    1 request     → 0.5  (intermediate)
 *    0 requests    → 0.8  (advanced)
 *
 *  Total score = weighted average → maps to level:
 *    < 0.40  → beginner
 *    0.40–0.69 → intermediate
 *    ≥ 0.70  → advanced
 */

export type Level = 'beginner' | 'intermediate' | 'advanced';

/** Weight assigned to each signal (must sum to 1.0). */
const WEIGHT_QCOUNT    = 0.25;
const WEIGHT_ANSLEN    = 0.25;
const WEIGHT_JARGON     = 0.30;
const WEIGHT_REPHRASE  = 0.20;

// ─── Signal thresholds ────────────────────────────────────────────────────────

const QCOUNT_BOUNDARIES  = [2,   5]  as const;   // ≤2 beginner, ≤5 intermediate
const ANSLEN_BOUNDARIES  = [50,  150] as const;  // chars

// ─── Technical term list (HV2 §3 Signal 3) ─────────────────────────────────

const JARGON_PATTERNS: RegExp[] = [
  /chain\s*rule/i,
  /gradient\s*descent/i,
  /backprop(?:agation)?/i,
  /softmax/i,
  /embedding/i,
  /neural\s*network/i,
  /\bCNN\b/i,
  /\bRNN\b/i,
  /transformer/i,
  /attention\s*mechanism/i,
  /\bLSTM\b/i,
  /\bBERT\b/i,
  /token(?:ize|ization)?/i,
  /\bKV\b/i,              // key-value attention
  /\bQKV\b/i,
  /cross.?attention/i,
  /self.?attention/i,
  /encoder|decoder/i,
  /fine.?tuning/i,
  /\bNLP\b/i,
  /\bCV\b/i,
  /convolutional/i,
  /pooling/i,
  /batch.?norm/i,
  /dropout/i,
  /loss\s*function/i,
  /cross.?entropy/i,
  /\bSGD\b/i,
  /momentum/i,
  /learning\s*rate/i,
  /epoch|batch.?size/i,
  /overfit(?:ting)?|underfit(?:ting)?/i,
];

// ─── Rephrase / simplify patterns ────────────────────────────────────────────

const REPRASE_PATTERNS: RegExp[] = [
  /giải\s*thích\s*lại/i,
  /nói\s*(lại|đơn\s*giản)/i,
  /cho\s*ví\s*dụ/i,
  /ví\s*dụ\s*khác/i,
  /mình\s*chưa\s*hiểu/i,
  /vẫn\s*chưa\s*rõ/i,
  /thật\s*à/i,
  /làm\s*sao\s*(hiểu|mà)/i,
  /nghĩa\s*là\s*gì/i,
  /tóm\s*tắt/i,
  /nói\s*ngắn\s*gọn/i,
];

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  role: 'user' | 'tutor';
  text: string;
}

export interface InferenceSignals {
  questionCount: number;
  avgAnswerLength: number;
  jargonDensity: number;   // 0..1
  rephraseCount: number;
}

export interface InferenceResult {
  level: Level;
  confidence: number;     // 0..1
  signals: InferenceSignals;
}

// ─── Core function ───────────────────────────────────────────────────────────

/**
 * Infers the user's understanding level from chat history.
 *
 * @param history  - ordered list of chat messages (role + text)
 * @returns InferenceResult with level, confidence, and per-signal breakdown
 */
export function inferLevel(history: HistoryEntry[]): InferenceResult {
  const userMessages = history.filter((e) => e.role === 'user');

  // ── Signal 1: question count ─────────────────────────────────────────────
  const qCount = userMessages.length;
  const sig1 =
    qCount <= QCOUNT_BOUNDARIES[0] ? 0.2 :
    qCount <= QCOUNT_BOUNDARIES[1] ? 0.5 :
    0.8;

  // ── Signal 2: average answer length ──────────────────────────────────────
  const avgLen = userMessages.length > 0
    ? userMessages.reduce((s, e) => s + e.text.length, 0) / userMessages.length
    : 0;
  const sig2 =
    avgLen < ANSLEN_BOUNDARIES[0] ? 0.2 :
    avgLen < ANSLEN_BOUNDARIES[1] ? 0.5 :
    0.8;

  // ── Signal 3: jargon / technical vocabulary density ─────────────────────
  // Count how many user messages contain at least one jargon term
  const jargonMsgCount = userMessages.filter((msg) =>
    JARGON_PATTERNS.some((re) => re.test(msg.text))
  ).length;
  const jargonDensity = userMessages.length > 0
    ? jargonMsgCount / userMessages.length
    : 0;
  // Score: 0 jargon → 0.3 (beginner), ≥1 → 0.8 (intermediate/advanced)
  const sig3 = jargonDensity === 0 ? 0.3 : 0.8;

  // ── Signal 4: rephrase / simplify requests ──────────────────────────────
  const rephraseCount = userMessages.filter((msg) =>
    REPRASE_PATTERNS.some((re) => re.test(msg.text))
  ).length;
  const sig4 =
    rephraseCount > 1 ? 0.2 :
    rephraseCount === 1 ? 0.5 :
    0.8;

  // ── Weighted total score ────────────────────────────────────────────────
  const totalScore =
    sig1 * WEIGHT_QCOUNT +
    sig2 * WEIGHT_ANSLEN +
    sig3 * WEIGHT_JARGON +
    sig4 * WEIGHT_REPHRASE;

  const level: Level =
    totalScore < 0.40 ? 'beginner' :
    totalScore < 0.70 ? 'intermediate' :
    'advanced';

  return {
    level,
    confidence: Math.max(0, Math.min(1, totalScore)),
    signals: {
      questionCount: qCount,
      avgAnswerLength: Math.round(avgLen),
      jargonDensity,
      rephraseCount,
    },
  };
}
