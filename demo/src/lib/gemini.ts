/**
 * Gemini API integration for CiteTutor.
 *
 * Architecture:
 * 1. Checks if VITE_GEMINI_API_KEY is a real key (not a placeholder).
 *    - If no real key → delegates to gemini-mock.ts (deterministic per persona).
 * 2. If real key available → calls Gemini 1.5 Flash with a structured prompt
 *    that forces JSON-only output matching the TutorResponse schema.
 * 3. Parses JSON; if parse fails → fallback regex extraction.
 *
 * All calls are wrapped in try/catch. API key is never logged.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMockResponse } from './gemini-mock';
import type { TutorResponse } from '../types';

/** Chat history entry — same shape used across lib files. */
type ChatMsg = { role: 'user' | 'tutor'; text: string };

// ─── Constants ────────────────────────────────────────────────────────────────

/** Model identifier. */
const MODEL_NAME = 'gemini-1.5-flash';

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
 * Extracts a JSON block from the Gemini response text.
 * Tries triple-backtick json first, then raw { } fallback.
 */
function parseJsonFromResponse(text: string): Record<string, unknown> | null {
  // Attempt 1: fenced code block
  const fencedMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fencedMatch && fencedMatch[1]) {
    try {
      return JSON.parse(fencedMatch[1]) as Record<string, unknown>;
    } catch {
      // fall through
    }
  }

  // Attempt 2: raw JSON object
  const rawMatch = text.match(/\{[\s\S]*\}/);
  if (rawMatch && rawMatch[0]) {
    try {
      return JSON.parse(rawMatch[0]) as Record<string, unknown>;
    } catch {
      // fall through
    }
  }

  return null;
}

/**
 * Builds the system prompt for Gemini.
 * Tells the model to output ONLY a JSON block and includes all
 * context needed (persona, history, selected text).
 */
function buildPrompt(
  personaName: string,
  personaLevel: string,
  history: ChatMsg[],
  selectedText: string
): string {
  // Format history for the prompt
  const historyLines = history
    .map((h) => `${h.role === 'user' ? 'Học viên' : 'Tutor'}: ${h.text}`)
    .join('\n');

  return `Bạn là Tutor VLearn — trợ lý AI cá nhân hoá theo mức hiểu của học viên.

## Ngữ cảnh hiện tại

- **Học viên:** ${personaName}
- **Mức hiểu suy ra (heuristic):** ${personaLevel}
- **Lịch sử tương tác:**
${historyLines || '(chưa có lịch sử)'}

- **Đoạn transcript được chọn:**
"${selectedText}"

## Nhiệm vụ

Suy ra mức hiểu thực sự của học viên (bỏ qua mức heuristic nếu có tín hiệu rõ ràng khác), rồi trả lời câu hỏi PHÙ HỢP với mức đó.

### Quy tắc bắt buộc

1. **Trả lời theo mức:**
   - beginner → Giải thích từ gốc, dùng ví dụ đời thường, TRÁNH thuật ngữ phức tạp
   - intermediate → Giải thích vừa đủ, có thể dùng thuật ngữ kèm giải thích ngắn
   - advanced → Giải thích chuyên sâu, dùng thuật ngữ đầy đủ, có thể kèm công thức

2. **Trường hợp KHÔNG suy ra được mức hiểu:**
   - Nếu lịch sử TRỐNG VÀ grade_missing=true → trả về segment="broken"
   - Nếu câu hỏi KHÔNG liên quan transcript VÀ lịch sử trống → segment="broken"
   - Khi broken: trả về warning (tiếng Việt thân thiện) + options

3. **Định dạng output — CHỈ JSON, KHÔNG kèm markdown code block:**
{level, confidence, segment, segment_reason, answer, warning, options}
   - level: "beginner" | "intermediate" | "advanced" | "unknown"
   - confidence: số 0..1 (0.0 = hoàn toàn không chắc, 1.0 = rất chắc)
   - segment: "normal" | "broken"
   - segment_reason: "grade_missing" | "no_evidence" | null
   - answer: câu trả lời dạng markdown (sử dụng **bold**, ### headings, bullet points)
   - warning: null khi segment="normal", hoặc chuỗi tiếng Việt thân thiện khi broken
   - options: mảng rỗng [] khi normal, ["Chuyển giảng viên", "Trả lời mặc định"] khi broken

4. **Nếu lịch sử TRỐNG (0 tin nhắn):**
   - Ưu tiên trả về confidence THẤP (< 0.4)
   - Trả lời ở mức beginner mặc định
   - answer phải kèm gợi ý để user tự chọn mức ("Bạn có muốn mình giải thích sâu hơn không?")

## Ví dụ output

\`\`\`json
{
  "level": "beginner",
  "confidence": 0.45,
  "segment": "normal",
  "segment_reason": null,
  "answer": "## 🟢 Mức hiểu: Beginner\\n\\n**Attention mechanism** giống như khi bạn đọc tin nhắn — bạn tập trung vào từ khóa thay vì đọc từng chữ...",
  "warning": null,
  "options": []
}
\`\`\`

 Bây giờ hãy trả lời. Output CHỈ là JSON, không giải thích thêm.`;
}

// ─── Fallback when JSON parse fails ──────────────────────────────────────────

/**
 * Last-resort extraction when Gemini returns non-JSON text.
 * Uses regex to pull out the most useful fields.
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
 * @param prompt        - display prompt shown to user (e.g. selected transcript text)
 * @param history       - full chat history for this persona
 * @param personaId     - persona identifier: "minh" | "lan" | "anonymous"
 * @param personaName   - display name of the persona
 * @param personaLevel  - heuristic level from personas.json (used in system prompt)
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
    // Log dev banner only once per session (use a module-level flag)
    if (import.meta.env.DEV && !window.__geminiMockBannerShown) {
      console.info(MOCK_BANNER);
      window.__geminiMockBannerShown = true;
    }
    return getMockResponse(personaId, prompt);
  }

  // ── Real Gemini path ───────────────────────────────────────────────────────
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const systemPrompt = buildPrompt(personaName, personaLevel, history, prompt);

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    const parsed = parseJsonFromResponse(responseText);

    if (!parsed) {
      console.warn('[gemini] Could not parse JSON from Gemini response, using fallback');
      const fallback = fallbackParse(responseText);
      return {
        level: fallback.level ?? 'unknown',
        confidence: fallback.confidence ?? 0.3,
        segment: fallback.segment ?? 'normal',
        segment_reason: null,
        answer: responseText,
        warning: null,
        options: [],
      };
    }

    // Validate and coerce known fields
    const level = (parsed['level'] as string | undefined);
    const confidence = typeof parsed['confidence'] === 'number'
      ? (parsed['confidence'] as number)
      : 0.5;
    const segment = (parsed['segment'] as string | undefined);
    const segmentReason = (parsed['segment_reason'] as string | null | undefined);
    const answer = typeof parsed['answer'] === 'string'
      ? parsed['answer']
      : responseText;
    const warning = typeof parsed['warning'] === 'string'
      ? parsed['warning']
      : null;
    const options = Array.isArray(parsed['options'])
      ? (parsed['options'] as string[])
      : [];

    // Enforce type-safe level
    const validLevels: TutorResponse['level'][] = [
      'beginner', 'intermediate', 'advanced', 'unknown',
    ];
    const coercedLevel = validLevels.includes(level as TutorResponse['level'])
      ? (level as TutorResponse['level'])
      : 'unknown';

    // Enforce type-safe segment
    const coercedSegment: 'normal' | 'broken' =
      segment === 'broken' ? 'broken' : 'normal';

    // Enforce type-safe segment_reason
    const coercedReason: TutorResponse['segment_reason'] =
      segmentReason === 'grade_missing' || segmentReason === 'no_evidence'
        ? segmentReason
        : null;

    return {
      level: coercedLevel,
      confidence: Math.max(0, Math.min(1, confidence)),
      segment: coercedSegment,
      segment_reason: coercedReason,
      answer,
      warning,
      options,
    };
  } catch (err) {
    // Never log the API key
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[gemini] API call failed:', msg);

    // Graceful degradation → fall back to mock for this persona
    return getMockResponse(personaId, prompt);
  }
}

// Module-level flag for dev banner suppression
declare global {
  // eslint-disable-next-line no-var
  var __geminiMockBannerShown: boolean | undefined;
}
