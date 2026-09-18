/**
 * Gemini API integration for CiteTutor.
 *
 * Architecture:
 * 1. Checks if VITE_GEMINI_API_KEY is a real key (not a placeholder).
 *    - If no real key → delegates to gemini-mock.ts (dynamic per-question responses).
 * 2. If real key available → calls Gemini 2.0 Flash with a natural prompt
 *    that returns a conversational Vietnamese answer FIRST, then a minimal JSON
 *    block at the END only.
 * 3. Parses the trailing JSON block to extract level/confidence metadata.
 * 4. The natural answer text (pre-JSON) is returned as-is — no template wrapping.
 *
 * All calls are wrapped in try/catch. API key is never logged.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMockResponse } from './gemini-mock';
import type { TutorResponse } from '../types';

/** Chat history entry — same shape used across lib files. */
type ChatMsg = { role: 'user' | 'tutor'; text: string };

// ─── Constants ────────────────────────────────────────────────────────────────

/** Model identifier — gemini-2.0-flash is the current stable fast model. */
const MODEL_NAME = 'gemini-2.0-flash';

/** Placeholder prefix — any key starting with this triggers mock mode. */
const MOCK_KEY_PREFIX = 'your-';

/** Dev-mode banner (shown only in development). */
const MOCK_BANNER =
  '🔑 Mock mode — VITE_GEMINI_API_KEY không được cấu hình. ' +
  'Sử dụng dữ liệu mock cho demo.';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true when a real API key is available. */
function hasRealApiKey(): boolean {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  return (
    key !== undefined &&
    key.length > 0 &&
    !key.startsWith(MOCK_KEY_PREFIX)
  );
}

/**
 * Strips the trailing JSON block from the Gemini response text.
 * The JSON block is appended at the very end by the prompt instructions.
 *
 * Handles:
 * - ```json\n{...}\n``` (fenced)
 * - ```{...}``` (fenced, no language tag)
 * - Raw {...} at end of text
 *
 * @returns { answerText: string, jsonBlock: string | null }
 */
function stripJsonBlock(text: string): { answerText: string; jsonBlock: string | null } {
  // Try fenced code block first: ```json ... ```
  const fencedMatch = text.match(/(```(?:json)?\s*)([\s\S]*?)(\s*```)$/);
  if (fencedMatch && fencedMatch[2]) {
    const jsonStr = fencedMatch[2].trim();
    const answerText = text.slice(0, fencedMatch.index).trimEnd();
    return { answerText, jsonBlock: jsonStr };
  }

  // Try raw JSON object at end of text
  const rawMatch = text.match(/(\}[^}]*)$/);
  if (rawMatch) {
    const jsonStr = rawMatch[0].trim();
    // Only accept if it looks like a valid JSON object (starts with {)
    if (jsonStr.startsWith('{')) {
      const answerText = text.slice(0, rawMatch.index!).trimEnd();
      return { answerText, jsonBlock: jsonStr };
    }
  }

  // No JSON found — return entire text as answer
  return { answerText: text.trim(), jsonBlock: null };
}

/**
 * Parses the JSON block extracted from the Gemini response.
 * @returns Record with level, confidence, segment, segment_reason — or null on failure.
 */
function parseJsonBlock(jsonStr: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Builds the system prompt for Gemini.
 *
 * Key design change from round 1/2:
 * - Gemini writes a NATURAL conversational answer FIRST (3-6 sentences)
 * - JSON block (level, confidence, segment) is appended at the END ONLY
 * - NO rigid bullet templates, NO hardcoded phrases like "System-level view"
 *
 * @param personaName  - display name of the persona
 * @param personaLevel - heuristic level from personas.json
 * @param history      - full chat history for context
 * @param selectedText - the question/selected transcript text
 */
function buildPrompt(
  personaName: string,
  personaLevel: string,
  history: ChatMsg[],
  selectedText: string
): string {
  const historyCount = history.length;
  const historyLines = history
    .map((h) => `${h.role === 'user' ? 'Học viên' : 'Tutor'}: ${h.text}`)
    .join('\n');

  return `Bạn là Tutor VLearn — trợ lý AI cá nhân hoá theo mức hiểu của học viên.

## Ngữ cảnh hiện tại

- **Học viên:** ${personaName}
- **Mức hiểu ước lượng (heuristic):** ${personaLevel}
- **Lịch sử tương tác (${historyCount} câu hỏi trước đó):**
${historyLines || '(chưa có lịch sử)'}

- **Câu hỏi của học viên:**
  "${selectedText}"

## Nhiệm vụ

Hãy suy luận mức hiểu THỰC SỰ của học viên từ ngữ cảnh trên, rồi viết câu trả lời TỰ NHIÊN bằng tiếng Việt — giống như một người bạn giỏi đang giảng bài, KHÔNG phải robot trả lời theo khuôn mẫu.

### Nguyên tắc quan trọng

1. **Viết tự nhiên:**
   - Không dùng cụm từ cố định như "System-level view", "Trade-off analysis", "Failure modes", "Recommendation: Để tối ưu...", "ở góc nhìn người có nền tảng", "Forward pass", "Backward pass", "Embedding space"
   - Không dùng cấu trúc: "### Điểm chính cần nhớ" + bullet list + "### Gợi ý"
   - Thay vào đó: viết 3-6 câu liền mạch, xen ví dụ cụ thể, có thể dùng **bold** cho từ khóa quan trọng

2. **Phù hợp mức hiểu:**
   - beginner → Giải thích từ gốc, dùng ví dụ đời thường cụ thể, TRÁNH thuật ngữ
   - intermediate → Giải thích vừa đủ, có thể dùng thuật ngữ kèm giải thích ngắn
   - advanced → Giải thích chuyên sâu, dùng thuật ngữ đầy đủ, có thể kèm công thức/note kỹ thuật

3. **Điều chỉnh nếu cần:**
   - Nếu lịch sử TRỐNG (0 câu) → ưu tiên confidence THẤP (< 0.4), viết ở beginner
   - Nếu câu hỏi KHÔNG liên quan transcript VÀ lịch sử trống → trả về broken segment

## Định dạng output

Viết câu trả lời TỰ NHIÊN trước (3-6 câu tiếng Việt), rồi ở CUỐI CÙNG append một JSON block trên một dòng riêng:

[Viết câu trả lời tự nhiên ở đây - 3-6 câu, xen ví dụ cụ thể, KHÔNG theo khuôn mẫu]

\`\`\`json
{"level": "beginner|intermediate|advanced", "confidence": 0.XX, "segment": "normal", "segment_reason": null}
\`\`\`

## Ví dụ output HAY (tự nhiên, không template):

**Câu hỏi:** "Sự khác biệt giữa người dùng AI hiệu quả và không hiệu quả là gì?"

**Output:**
Chào bạn! Câu hỏi này mình hay gặp khi học về AI.

Người dùng hiệu quả thường hiểu rõ giới hạn của công cụ — họ biết khi nào nên hỏi AI và khi nào nên tự suy nghĩ. Họ không expect AI làm thay công việc suy nghĩ mà coi nó là một người trợ lý, không phải ông chủ. Ngược lại, người dùng kém hiệu quả thường accept mọi output từ AI mà không verify, dẫn đến sai lệch nghiêm trọng.

\`\`\`json
{"level": "intermediate", "confidence": 0.72, "segment": "normal", "segment_reason": null}
\`\`\`

**Câu hỏi:** "Attention mechanism là gì?"

**Output:**
Mình giải thích thật đơn giản nhé!

Hãy tưởng tượng bạn đọc một bài báo dài. Bạn không đọc từng chữ mà tập trung vào ý chính của từng đoạn. Non nội dung nào quan trọng, mắt bạn sẽ dừng lâu hơn. Attention mechanism trong AI hoạt động y hệt vậy — model "chú ý" vào những phần quan trọng của input thay vì xử lý đều đều tất cả.

\`\`\`json
{"level": "beginner", "confidence": 0.58, "segment": "normal", "segment_reason": null}
\`\`\`

---

Bây giờ hãy trả lời câu hỏi trên. Viết câu trả lời TỰ NHIÊN trước, rồi append JSON ở cuối.`;
}

// ─── Fallback when JSON block is missing or unparseable ──────────────────────

/**
 * Last-resort extraction when the JSON block is missing.
 * Uses regex to pull the most useful fields from the raw text.
 */
function fallbackParse(text: string): Partial<TutorResponse> {
  const levelMatch = text.match(
    /\b(beginner|intermediate|advanced|unknown)\b/i
  );
  const confMatch = text.match(/confidence[:\s]*0?\.\d+/i);
  const segMatch = text.match(/segment[:\s]*["']?(broken|normal)["']?/i);

  return {
    level: (levelMatch?.[1]?.toLowerCase() as TutorResponse['level']) ?? 'unknown',
    confidence: confMatch ? parseFloat(confMatch[0].replace(/\D/g, '')) : 0.3,
    segment: (segMatch?.[1]?.toLowerCase() as 'broken' | 'normal') ?? 'normal',
  };
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Calls Gemini (real or mock) and returns a TutorResponse.
 *
 * Real path:
 * 1. Build natural prompt (answer first, JSON at end)
 * 2. Call Gemini
 * 3. Strip JSON block → answerText (natural) + jsonBlock
 * 4. Parse jsonBlock → level, confidence, segment
 * 5. Return { answer: answerText, level, confidence, segment, ... }
 *
 * @param prompt        - display prompt shown to user (e.g. selected transcript text)
 * @param history       - full chat history for this persona
 * @param personaId     - persona identifier: "minh" | "lan" | "phong" | "anonymous"
 * @param personaName   - display name of the persona
 * @param personaLevel  - heuristic level from personas.json (used in system prompt).
 *                        Also threaded through to getMockResponse so that level overrides
 *                        (from "Chỉnh mức") take effect in mock mode.
 * @returns TutorResponse matching the schema
 */
export async function callGemini(
  prompt: string,
  history: ChatMsg[],
  personaId: string,
  personaName: string,
  personaLevel: string
): Promise<TutorResponse> {
  // ── Mock path ──────────────────────────────────────────────────────────────
  if (!hasRealApiKey()) {
    // Log dev banner only once per session
    if (import.meta.env.DEV && !(window as unknown as { __geminiMockBannerShown?: boolean }).__geminiMockBannerShown) {
      console.info(MOCK_BANNER);
      (window as unknown as { __geminiMockBannerShown: boolean }).__geminiMockBannerShown = true;
    }
    return getMockResponse(
      personaId,
      prompt,
      history.length,        // pass ACTUAL history count (fixes TASK 3)
      personaLevel as import('../types').Level
    );
  }

  // ── Real Gemini path ───────────────────────────────────────────────────────
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const systemPrompt = buildPrompt(personaName, personaLevel, history, prompt);

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    // ── Step 1: Strip trailing JSON block ────────────────────────────────
    const { answerText, jsonBlock } = stripJsonBlock(responseText);

    // ── Step 2: Parse JSON block for metadata ────────────────────────────
    let level: TutorResponse['level'] = 'unknown';
    let confidence = 0.5;
    let segment: 'normal' | 'broken' = 'normal';
    let segmentReason: TutorResponse['segment_reason'] = null;

    if (jsonBlock) {
      const parsed = parseJsonBlock(jsonBlock);
      if (parsed) {
        const rawLevel = (parsed['level'] as string | undefined);
        const validLevels: TutorResponse['level'][] = [
          'beginner', 'intermediate', 'advanced', 'unknown',
        ];
        if (rawLevel && validLevels.includes(rawLevel as TutorResponse['level'])) {
          level = rawLevel as TutorResponse['level'];
        }
        if (typeof parsed['confidence'] === 'number') {
          confidence = Math.max(0, Math.min(1, parsed['confidence'] as number));
        }
        const rawSegment = (parsed['segment'] as string | undefined);
        segment = rawSegment === 'broken' ? 'broken' : 'normal';
        const rawReason = (parsed['segment_reason'] as string | null | undefined);
        if (rawReason === 'grade_missing' || rawReason === 'no_evidence') {
          segmentReason = rawReason;
        }
      } else {
        // JSON block present but unparseable → fallback regex
        console.warn('[gemini] Could not parse JSON block, using fallback regex');
        const fb = fallbackParse(responseText);
        level = fb.level ?? 'unknown';
        confidence = fb.confidence ?? 0.3;
        segment = fb.segment ?? 'normal';
      }
    } else {
      // No JSON block found → fallback regex on full text
      console.warn('[gemini] No JSON block found in Gemini response, using fallback');
      const fb = fallbackParse(responseText);
      level = fb.level ?? 'unknown';
      confidence = fb.confidence ?? 0.3;
      segment = fb.segment ?? 'normal';
    }

    // ── Step 3: Handle broken segment ──────────────────────────────────
    if (segment === 'broken') {
      return {
        level,
        confidence,
        segment: 'broken',
        segment_reason: segmentReason,
        answer: '',
        warning:
          segmentReason === 'grade_missing'
            ? 'Bạn chưa có điểm trong hệ thống VLearn và mình không có lịch sử tương tác. Mình không thể suy ra mức hiểu của bạn một cách chính xác.'
            : 'Mình không có căn cứ trong transcript cho đoạn này và không có lịch sử tương tác.',
        options: ['Chuyển giảng viên', 'Trả lời mặc định'],
      };
    }

    // ── Step 4: Return natural answer + metadata ─────────────────────────
    return {
      level,
      confidence,
      segment: 'normal',
      segment_reason: null,
      answer: answerText,
      warning: null,
      options: [],
    };
  } catch (err) {
    // Never log the API key
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[gemini] API call failed:', msg);

    // Graceful degradation → fall back to mock for this persona
    return getMockResponse(
      personaId,
      prompt,
      history.length,
      personaLevel as import('../types').Level
    );
  }
}

// Module-level flag for dev banner suppression
declare global {
  // eslint-disable-next-line no-var
  var __geminiMockBannerShown: boolean | undefined;
}
