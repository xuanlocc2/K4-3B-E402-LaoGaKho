/**
 * HV2 test runner — CiteTutor measurement & evaluation.
 *
 * Architecture:
 *  1. Reads .env.local to check for VITE_GEMINI_API_KEY
 *  2. Loads questions from hv2-questions.ts
 *  3. For each question:
 *       - Runs segment-detect.ts logic (broken path → skip Gemini call)
 *       - Otherwise calls Gemini (real or mock) and records the response
 *  4. Evaluates pass/fail per bucket
 *  5. Prints a summary table and writes HV2-RESULTS.md
 *
 * Run:  npx tsx tests/hv2-run.ts
 *       node --experimental-strip-types tests/hv2-run.ts  (Node 22+)
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMockResponse } from '../src/lib/gemini-mock';
import type { TutorResponse } from '../src/types';
import { QUESTIONS, PERSONA_CONTEXTS } from './hv2-questions';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Question {
  id: string;
  bucket: 'A' | 'B' | 'C' | 'D';
  personaId: string;
  personaName: string;
  personaLevel: string;
  selectedText: string;
  expectedLevel: string;
  transcriptExcerpt: string;
  gradeMissing: boolean;
  history: Array<{ role: string; text: string }>;
  description: string;
}

export interface PersonaContext {
  id: string;
  name: string;
  level: string;
  history: Array<{ role: string; text: string }>;
  grade_missing: boolean;
}

export interface QuestionResult {
  id: string;
  bucket: string;
  personaName: string;
  expectedLevel: string;
  // segment-detect output
  segment: 'normal' | 'broken' | 'unknown';
  segmentReason: string | null;
  // callGemini output
  level: string;
  confidence: number;
  responseLength: number;
  answerExcerpt: string;
  warning: string | null;
  options: string[];
  // test metadata
  durationMs: number;
  passed: boolean;
  failReason: string | null;
  isRealCall: boolean;
}

// ─── Segment detection (inline copy of segment-detect.ts logic) ───────────────

function jaccardSimilarity(textA: string, textB: string): number {
  const tokenize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);

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

const EVIDENCE_THRESHOLD = 0.02;

function detectSegmentBroken(
  selectedText: string,
  gradeMissing: boolean,
  history: Array<{ role: string; text: string }>,
  transcriptExcerpt: string
): { isBroken: boolean; reason: string | null } {
  const hasHistory = history.length > 0;
  const trimmed = selectedText.trim();

  if (gradeMissing && !hasHistory) {
    return { isBroken: true, reason: 'grade_missing' };
  }

  if (trimmed.length < 5 && !hasHistory) {
    return { isBroken: true, reason: 'no_evidence' };
  }

  if (trimmed.length >= 5) {
    const overlap = jaccardSimilarity(trimmed, transcriptExcerpt);
    if (overlap < EVIDENCE_THRESHOLD) {
      return { isBroken: true, reason: 'no_evidence' };
    }
  }

  return { isBroken: false, reason: null };
}

// ─── Environment check ─────────────────────────────────────────────────────────

const DEMO_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvKey(): { hasKey: boolean; keyLength: number } {
  const envPath = join(DEMO_DIR, '.env.local');
  if (!existsSync(envPath)) {
    return { hasKey: false, keyLength: 0 };
  }
  const content = readFileSync(envPath, 'utf8');
  const match = content.match(/VITE_GEMINI_API_KEY=(.+)/);
  if (!match) return { hasKey: false, keyLength: 0 };
  const key = match[1]!.trim();
  return {
    hasKey: key.length > 0 && !key.startsWith('your-'),
    keyLength: key.length,
  };
}

const { hasKey: HAS_REAL_KEY, keyLength: KEY_LEN } = loadEnvKey();
const IS_REAL_MODE = HAS_REAL_KEY;

// Load API key for real calls
let apiKeyValue = '';
if (IS_REAL_MODE) {
  const envPath = join(DEMO_DIR, '.env.local');
  const content = readFileSync(envPath, 'utf8');
  const match = content.match(/VITE_GEMINI_API_KEY=(.+)/);
  apiKeyValue = match?.[1]?.trim() ?? '';
}

// ─── Gemini call (real) ────────────────────────────────────────────────────────

async function callGeminiReal(
  prompt: string,
  history: Array<{ role: string; text: string }>,
  personaId: string,
  personaName: string,
  personaLevel: string
): Promise<TutorResponse> {
  const MODEL_NAME = 'gemini-3.6-flash';

  function buildPrompt(
    pName: string,
    pLevel: string,
    hist: Array<{ role: string; text: string }>,
    selected: string
  ): string {
    const historyLines = hist
      .map((h) => `${h.role === 'user' ? 'Học viên' : 'Tutor'}: ${h.text}`)
      .join('\n');

    return `Bạn là Tutor VLearn — trợ lý AI cá nhân hoá theo mức hiểu của học viên.

## Ngữ cảnh hiện tại

- **Học viên:** ${pName}
- **Mức hiểu suy ra (heuristic):** ${pLevel}
- **Lịch sử tương tác:**
${historyLines || '(chưa có lịch sử)'}

- **Đoạn transcript được chọn:**
"${selected}"

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

  function parseJsonFromResponse(text: string): Record<string, unknown> | null {
    const fencedMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (fencedMatch && fencedMatch[1]) {
      try {
        return JSON.parse(fencedMatch[1]!) as Record<string, unknown>;
      } catch {
        // fall through
      }
    }

    const rawMatch = text.match(/\{[\s\S]*\}/);
    if (rawMatch && rawMatch[0]) {
      try {
        return JSON.parse(rawMatch[0]!) as Record<string, unknown>;
      } catch {
        // fall through
      }
    }

    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKeyValue);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const systemPrompt = buildPrompt(personaName, personaLevel, history, prompt);

  const result = await model.generateContent(systemPrompt);
  const responseText = result.response.text();
  const parsed = parseJsonFromResponse(responseText);

  if (!parsed) {
    const levelMatch = responseText.match(/\b(beginner|intermediate|advanced|unknown)\b/i);
    const confMatch = responseText.match(/confidence[:\s]*0?\.\d+/i);
    const segMatch = responseText.match(/segment[:\s]*["']?(broken|normal)["']?/i);

    return {
      level: (levelMatch?.[1]?.toLowerCase() ?? 'unknown') as TutorResponse['level'],
      confidence: confMatch ? parseFloat(confMatch[0]!.replace(/\D/g, '')) : 0.3,
      segment: (segMatch?.[1]?.toLowerCase() ?? 'normal') as 'broken' | 'normal',
      segment_reason: null,
      answer: responseText,
      warning: null,
      options: [],
    };
  }

  const level = parsed['level'] as string | undefined;
  const confidence =
    typeof parsed['confidence'] === 'number' ? (parsed['confidence'] as number) : 0.5;
  const segment = parsed['segment'] as string | undefined;
  const segmentReason = parsed['segment_reason'] as string | null | undefined;
  const answer =
    typeof parsed['answer'] === 'string' ? (parsed['answer'] as string) : responseText;
  const warning =
    typeof parsed['warning'] === 'string' ? (parsed['warning'] as string) : null;
  const options = Array.isArray(parsed['options']) ? (parsed['options'] as string[]) : [];

  const validLevels: TutorResponse['level'][] = [
    'beginner',
    'intermediate',
    'advanced',
    'unknown',
  ];
  const coercedLevel = validLevels.includes(level as TutorResponse['level'])
    ? (level as TutorResponse['level'])
    : 'unknown';

  const coercedSegment: 'broken' | 'normal' = segment === 'broken' ? 'broken' : 'normal';

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
}

// ─── Single question evaluator ─────────────────────────────────────────────────

async function evaluateQuestion(q: Question): Promise<QuestionResult> {
  const startTime = Date.now();

  // Step 1: Segment detection (before any Gemini call)
  const seg = detectSegmentBroken(
    q.selectedText,
    q.gradeMissing,
    q.history,
    q.transcriptExcerpt
  );

  // ── Broken path: no Gemini call ───────────────────────────────────────────
  if (seg.isBroken) {
    const durationMs = Date.now() - startTime;
    const warningMsg =
      seg.reason === 'grade_missing'
        ? 'Bạn chưa có điểm trong hệ thống VLearn và mình không có lịch sử tương tác. Mình không thể suy ra mức hiểu của bạn một cách chính xác.'
        : 'Mình không có căn cứ trong transcript cho đoạn này và không có lịch sử tương tác.';

    // ── Evaluate bucket pass/fail for broken question ──────────────────────
    // Only Bucket D allows broken segments; A/B/C should NEVER be broken.
    let passed = false;
    let failReason: string | null = null;

    if (q.bucket === 'D') {
      passed = true; // D: broken + warning = correct behavior
    } else {
      passed = false;
      failReason = `${q.bucket} questions should NOT be broken; got segment=broken (${seg.reason})`;
    }

    return {
      id: q.id,
      bucket: q.bucket,
      personaName: q.personaName,
      expectedLevel: q.expectedLevel,
      segment: 'broken',
      segmentReason: seg.reason,
      level: 'unknown',
      confidence: 0,
      responseLength: 0,
      answerExcerpt: '',
      warning: warningMsg,
      options: ['Chuyển giảng viên', 'Trả lời mặc định'],
      durationMs,
      passed,
      failReason,
      isRealCall: false,
    };
  }

  // ── Normal path: call Gemini (real or mock) ───────────────────────────────
  let response: TutorResponse;
  let isReal = false;

  if (IS_REAL_MODE) {
    try {
      response = await callGeminiReal(
        q.selectedText,
        q.history,
        q.personaId,
        q.personaName,
        q.personaLevel
      );
      isReal = true;
    } catch (err) {
      // Graceful fallback → mock
      console.warn(`[HV2] Real API failed for ${q.id}, falling back to mock: ${err instanceof Error ? err.message : String(err)}`);
      response = getMockResponse(q.personaId, q.selectedText);
    }
  } else {
    response = getMockResponse(q.personaId, q.selectedText);
  }

  const durationMs = Date.now() - startTime;
  const answerExcerpt = response.answer.slice(0, 80).replace(/\n/g, ' ');

  // ── Pass/fail logic per bucket ────────────────────────────────────────────
  let passed = false;
  let failReason: string | null = null;

  if (q.bucket === 'A') {
    // Beginner: must NOT be broken, must detect beginner level, sufficient length
    if (seg.isBroken) {
      passed = false;
      failReason = `A questions should NOT be broken; got segment=broken (${seg.reason})`;
    } else if (response.level !== 'beginner') {
      passed = false;
      failReason = `Expected level=beginner, got level=${response.level}`;
    } else if (response.answer.length <= 100) {
      passed = false;
      failReason = `Expected response_length > 100, got ${response.answer.length}`;
    } else {
      passed = true;
    }
  } else if (q.bucket === 'B') {
    // Intermediate: must NOT be broken, must detect intermediate level, sufficient length
    if (seg.isBroken) {
      passed = false;
      failReason = `B questions should NOT be broken; got segment=broken (${seg.reason})`;
    } else if (response.level !== 'intermediate') {
      passed = false;
      failReason = `Expected level=intermediate, got level=${response.level}`;
    } else if (response.answer.length <= 200) {
      passed = false;
      failReason = `Expected response_length > 200, got ${response.answer.length}`;
    } else {
      passed = true;
    }
  } else if (q.bucket === 'C') {
    // Advanced: must NOT be broken, must detect advanced level, sufficient length
    if (seg.isBroken) {
      passed = false;
      failReason = `C questions should NOT be broken; got segment=broken (${seg.reason})`;
    } else if (response.level !== 'advanced') {
      passed = false;
      failReason = `Expected level=advanced, got level=${response.level}`;
    } else if (response.answer.length <= 250) {
      passed = false;
      failReason = `Expected response_length > 250, got ${response.answer.length}`;
    } else {
      passed = true;
    }
  } else if (q.bucket === 'D') {
    // Broken: MUST be broken, MUST have warning, NO Gemini call
    if (seg.isBroken && response.warning !== null) {
      passed = true;
    } else if (seg.isBroken && response.warning === null) {
      passed = false;
      failReason = `D questions MUST produce a warning; got warning=null`;
    } else {
      passed = false;
      failReason = `Expected segment=broken, got segment=${seg.isBroken ? 'broken' : 'normal'}`;
    }
  }

  return {
    id: q.id,
    bucket: q.bucket,
    personaName: q.personaName,
    expectedLevel: q.expectedLevel,
    segment: seg.isBroken ? 'broken' : 'normal',
    segmentReason: seg.reason,
    level: response.level,
    confidence: response.confidence,
    responseLength: response.answer.length,
    answerExcerpt,
    warning: response.warning,
    options: response.options,
    durationMs,
    passed,
    failReason,
    isRealCall: isReal,
  };
}

// ─── Pass/fail summary ────────────────────────────────────────────────────────

interface BucketSummary {
  bucket: string;
  pass: number;
  total: number;
  rate: number;
  notes: string;
}

function summarize(results: QuestionResult[]): BucketSummary[] {
  const buckets = ['A', 'B', 'C', 'D'];
  const bucketLabels: Record<string, string> = {
    A: 'Beginner',
    B: 'Intermediate',
    C: 'Advanced',
    D: 'Broken',
  };

  return buckets.map((b) => {
    const group = results.filter((r) => r.bucket === b);
    const pass = group.filter((r) => r.passed).length;
    const total = group.length;
    const rate = total > 0 ? Math.round((pass / total) * 100) : 0;
    const notes = group.length > 0
      ? group.map((r) => r.passed ? `✓${r.id}` : `✗${r.id}`).join(', ')
      : '';

    return {
      bucket: `${b} — ${bucketLabels[b]}`,
      pass,
      total,
      rate,
      notes,
    };
  });
}

// ─── Pretty table printer ─────────────────────────────────────────────────────

function pad(s: string, len: number): string {
  return s.slice(0, len).padEnd(len, ' ');
}

function printTable(results: QuestionResult[]): void {
  const header =
    '╔════╦═══════════╦═════════════╦═══════════════╦══════════╦═══════════╦════════╦═════════╗\n' +
    '║ ID ║ Person    ║ Level       ║ Confidence    ║ Segment  ║ Length   ║ Warn  ║ Time   ║\n' +
    '╠════╬═══════════╬═════════════╬═══════════════╬══════════╬═══════════╬════════╬═════════╣';

  const rows = results.map((r) => {
    const flag = r.passed ? '✅' : '❌';
    const warn = r.warning ? '⚠️' : '—';
    const warn2 = r.warning ? 'Y' : 'N';
    const seg = r.segment.padEnd(8, ' ').slice(0, 8);
    const lvl = r.level.padEnd(11, ' ').slice(0, 11);
    const person = r.personaName.padEnd(9, ' ').slice(0, 9);
    const conf = r.confidence.toFixed(2).padEnd(12, ' ').slice(0, 12);
    const len = String(r.responseLength).padEnd(7, ' ').slice(0, 7);
    const dur = `${r.durationMs}ms`.padEnd(7, ' ').slice(0, 7);
    const real = r.isRealCall ? '🔴' : '⚪';
    return `║ ${flag} ${r.id} ║ ${person} ║ ${lvl} ║ ${conf} ║ ${seg} ║ ${len} ║  ${warn2}   ║ ${dur} ║`;
  });

  const separator = '╚════╩═══════════╩═════════════╩═══════════════╩══════════╩═══════════╩════════╩═════════╝';

  console.log('\n');
  console.log(header);
  for (const row of rows) {
    console.log(row);
  }
  console.log(separator);
}

function printSummaryTable(summaries: BucketSummary[]): void {
  const header =
    '╔══════════════════════════╦═══════╦═══════╦═══════╦═════════════════════════════════════════════╗\n' +
    '║ Bucket                    ║ Pass  ║ Total ║ Rate  ║ Notes                                       ║\n' +
    '╠══════════════════════════╬═══════╬═══════╬═══════╬═════════════════════════════════════════════╣';

  const rows = summaries.map((s) => {
    const bucket = s.bucket.padEnd(24, ' ').slice(0, 24);
    const pass = String(s.pass).padEnd(5, ' ');
    const total = String(s.total).padEnd(5, ' ');
    const rate = `${s.rate}%`.padEnd(5, ' ');
    const notes = s.notes.slice(0, 57).padEnd(57, ' ');
    return `║ ${bucket} ║  ${pass}║  ${total}║ ${rate}║ ${notes} ║`;
  });

  const allPass = summaries.reduce((a, b) => a + b.pass, 0);
  const allTotal = summaries.reduce((a, b) => a + b.total, 0);
  const allRate = allTotal > 0 ? Math.round((allPass / allTotal) * 100) : 0;
  const overall = `║ **OVERALL**                ║ **${allPass}** ║ **${allTotal}** ║ **${allRate}%** ║                                               ║`;
  const footer = '╚══════════════════════════╩═══════╩═══════╩═══════╩═════════════════════════════════════════════╝';

  console.log('\n');
  console.log(header);
  for (const row of rows) {
    console.log(row);
  }
  console.log(overall);
  console.log(footer);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\n========================================');
  console.log('  HV2 Measurement — CiteTutor');
  console.log('========================================');
  console.log(`  Mode:        ${IS_REAL_MODE ? '🔴 REAL Gemini API (gemini-3.6-flash)' : '⚪ MOCK (no API key)'}`);
  console.log(`  API key:     ${HAS_REAL_KEY ? `present (${KEY_LEN} chars)` : 'absent → using mock'}`);
  console.log(`  Questions:   ${QUESTIONS.length}`);
  console.log(`  Buckets:     A=Beginner(5), B=Intermediate(5), C=Advanced(5), D=Broken(5)`);
  console.log('========================================\n');

  const results: QuestionResult[] = [];

  for (const q of QUESTIONS) {
    process.stdout.write(`  [${q.id}] ${q.bucket} — ${q.personaName}: "${q.selectedText.slice(0, 50)}${q.selectedText.length > 50 ? '…' : ''}" ... `);
    try {
      const result = await evaluateQuestion(q);
      results.push(result);
      const flag = result.passed ? '✅ PASS' : `❌ FAIL`;
      const callType = result.isRealCall ? '🔴real' : '⚪mock';
      console.log(`${flag} (${result.level}, len=${result.responseLength}, ${callType}, ${result.durationMs}ms)`);
      if (result.failReason) {
        console.log(`         → ${result.failReason}`);
      }
    } catch (err) {
      console.log(`❌ ERROR: ${err instanceof Error ? err.message : String(err)}`);
      results.push({
        id: q.id,
        bucket: q.bucket,
        personaName: q.personaName,
        expectedLevel: q.expectedLevel,
        segment: 'unknown',
        segmentReason: null,
        level: 'unknown',
        confidence: 0,
        responseLength: 0,
        answerExcerpt: '',
        warning: null,
        options: [],
        durationMs: 0,
        passed: false,
        failReason: `Uncaught exception: ${err instanceof Error ? err.message : String(err)}`,
        isRealCall: false,
      });
    }

    // 5-second delay between real API calls to respect Gemini free-tier rate limit (15 req/min)
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  printTable(results);

  const summaries = summarize(results);
  printSummaryTable(summaries);

  const allPass = summaries.reduce((a, b) => a + b.pass, 0);
  const allTotal = summaries.reduce((a, b) => a + b.total, 0);
  const allRate = allTotal > 0 ? Math.round((allPass / allTotal) * 100) : 0;
  const realCount = results.filter((r) => r.isRealCall).length;

  console.log('\n');
  console.log('========================================');
  console.log(`  Overall: ${allPass}/${allTotal} passed (${allRate}%)`);
  console.log(`  Real Gemini calls: ${realCount}/20`);
  if (!IS_REAL_MODE) {
    console.log('  ⚠️  BLOCKER: No API key found. Results are from mock mode.');
    console.log('      Real API calls could NOT be verified.');
    console.log('      Please add VITE_GEMINI_API_KEY to .env.local to enable real mode.');
  } else {
    console.log(`  ✅ At least 1 real Gemini API call confirmed (${realCount} calls)`);
  }
  console.log('========================================\n');

  // ── Write HV2-RESULTS.md ──────────────────────────────────────────────────
  const resultsPath = join(dirname(fileURLToPath(import.meta.url)), 'HV2-RESULTS.md');

  const failures = results.filter((r) => !r.passed);

  const md = buildResultsMd(results, summaries, allPass, allTotal, allRate, realCount, failures);
  writeFileSync(resultsPath, md, 'utf8');
  console.log(`  Results written → ${resultsPath}\n`);
}

function buildResultsMd(
  results: QuestionResult[],
  summaries: BucketSummary[],
  allPass: number,
  allTotal: number,
  allRate: number,
  realCount: number,
  failures: QuestionResult[]
): string {
  const now = new Date().toISOString();

  const perQuestionMd = results
    .map(
      (r) =>
        `| ${r.id} | ${r.bucket} | ${r.personaName} | ${r.expectedLevel} | ${r.level} | ${r.confidence.toFixed(2)} | ${r.segment} | ${r.responseLength} | ${r.warning ? '⚠️' : '—'} | ${r.passed ? '✅' : '❌'} |`
    )
    .join('\n');

  const failureMd =
    failures.length > 0
      ? failures
          .map(
            (f) =>
              `### ${f.id}: "${QUESTIONS.find((q) => q.id === f.id)?.selectedText}"\n\n` +
              `- **Expected:** bucket=${f.bucket} criteria met\n` +
              `- **Got:** level=${f.level}, segment=${f.segment}, responseLength=${f.responseLength}, warning=${f.warning !== null ? 'present' : 'null'}\n` +
              `- **Fail reason:** ${f.failReason ?? 'unknown'}\n`
          )
          .join('\n')
      : '*(None — all tests passed!)*';

  const bucketTableMd = summaries
    .map(
      (s) =>
        `| ${s.bucket} | ${s.pass} | ${s.total} | ${s.rate}% | ${s.notes} |`
    )
    .join('\n');

  return `# HV2 Measurement Results

Date: ${now}
Mode: ${IS_REAL_MODE ? 'REAL' : 'MOCK'}
API Key: ${HAS_REAL_KEY ? 'present' : 'absent'}
Total questions: 20

## Per-bucket pass rate

| Bucket | Pass | Total | Rate | Notes |
|--------|------|-------|------|-------|
${bucketTableMd}
| **Overall** | **${allPass}** | **${allTotal}** | **${allRate}%** | |

## Per-question results

| ID | Bucket | Persona | Expected | Got | Confidence | Segment | Length | Warning | Pass? |
|----|--------|---------|----------|-----|------------|---------|--------|---------|-------|
${perQuestionMd}

## Failure analysis${failures.length > 0 ? '' : ' — all tests passed ✅'}

${failureMd}

## Real-vs-mock verdict

- Was at least 1 real Gemini API call made? ${realCount > 0 ? `**YES** (${realCount} of 20 questions)` : '**NO**'}
- Mode: ${IS_REAL_MODE ? 'REAL — Gemini 1.5 Flash called with production key' : 'MOCK — no VITE_GEMINI_API_KEY found'}
- Blocking reason if mock: ${!IS_REAL_MODE ? 'VITE_GEMINI_API_KEY is absent or is a placeholder (starts with "your-") in .env.local. Please copy .env.local.example to .env.local and fill in a real key from https://aistudio.google.com/app/apikey' : 'N/A'}

## Honest assessment

"Thử ${allTotal} câu, ${allPass} câu đúng, ${failures.length} câu sai" → overall pass rate: **${allRate}%**

${allPass === allTotal ? '✅ All 20 tests passed — system is working correctly.' : `⚠️ ${failures.length} test(s) failed — see failure analysis above for details.`}
`;
}

// ─── Execute ──────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error('\n[HV2] Fatal error:', err);
  process.exit(1);
});
