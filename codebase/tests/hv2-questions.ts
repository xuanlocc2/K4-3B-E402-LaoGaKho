/**
 * HV2 test question set — 20 Vietnamese questions across 4 buckets.
 *
 * Bucket A  (Minh persona, beginner)   — simple "what is X" questions
 * Bucket B  (Lan persona,  intermediate) — "how does X work" questions
 * Bucket C  (Phong persona, advanced)  — "compare X vs Y" questions
 * Bucket D  (Ẩn danh persona, broken) — off-topic / malformed / no-evidence
 *
 * Each question maps to a callGemini() invocation.
 * Bucket D questions should NOT trigger a real Gemini call — they are
 * caught by segment-detect.ts before callGemini is even called.
 */

import type { Question, PersonaContext } from './hv2-run';

// ─── Transcript excerpts ─────────────────────────────────────────────────────────
// These MUST match transcript vocabulary so word-overlap detection passes for A/B/C.
// Bucket A+B: actual transcript terms (AI, agent, model, deploy, MLOps)
// Bucket C:   actual transcript terms with ML/NN vocabulary overlap
// Bucket D:   intentionally off-topic → low Jaccard → detected as broken

/** Bucket A+B: transcript-03 terms from paragraphs 22–25 */
const EXCERPT_AB =
  'AI Engineer MLOps deploy model nhẹ chatbot assistant custom agent ' +
  'AI system prompt product management fine-tuning quality safety';

/** Bucket C: same transcript with ML/NN framing */
const EXCERPT_C =
  'machine learning model fine-tuning embedding RAG pipeline ' +
  'neural network transformer attention mechanism gradient descent ' +
  'self-hosting model quantization vLLM production system latency';

export const QUESTIONS: Question[] = [
  // ════════════════════════════════════════════════════════
  // BUCKET A — Beginner (5 questions, Minh persona)
  // Expected: level=beginner, response_length > 100, NOT broken
  // ════════════════════════════════════════════════════════
  {
    id: 'A1',
    bucket: 'A',
    personaId: 'minh',
    personaName: 'Minh',
    personaLevel: 'beginner',
    selectedText: 'AI là gì?',
    expectedLevel: 'beginner',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'attention là gì?' },
      { role: 'user', text: 'giải thích đơn giản hơn' },
    ],
    description: 'Minh hỏi về khái niệm AI cơ bản nhất',
  },
  {
    id: 'A2',
    bucket: 'A',
    personaId: 'minh',
    personaName: 'Minh',
    personaLevel: 'beginner',
    selectedText: 'AI agent là gì vậy?',
    expectedLevel: 'beginner',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'AI là gì?' },
      { role: 'user', text: 'giải thích đơn giản hơn' },
    ],
    description: 'Minh hỏi về AI agent — term directly from transcript',
  },
  {
    id: 'A3',
    bucket: 'A',
    personaId: 'minh',
    personaName: 'Minh',
    personaLevel: 'beginner',
    selectedText: 'Prompt là cái gì?',
    expectedLevel: 'beginner',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'AI là gì?' },
      { role: 'user', text: 'cho ví dụ đi' },
    ],
    description: 'Minh hỏi về prompt — short beginner question',
  },
  {
    id: 'A4',
    bucket: 'A',
    personaId: 'minh',
    personaName: 'Minh',
    personaLevel: 'beginner',
    selectedText: 'Tại sao thời đại này cần học AI?',
    expectedLevel: 'beginner',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'AI là gì?' },
      { role: 'user', text: 'AI agent là gì?' },
    ],
    description: 'Minh hỏi về lý do học AI — motivation question',
  },
  {
    id: 'A5',
    bucket: 'A',
    personaId: 'minh',
    personaName: 'Minh',
    personaLevel: 'beginner',
    selectedText: 'MLOps là gì?',
    expectedLevel: 'beginner',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'AI là gì?' },
    ],
    description: 'Minh hỏi về MLOps — beginner question',
  },

  // ════════════════════════════════════════════════════════
  // BUCKET B — Intermediate (5 questions, Lan persona)
  // Expected: level=intermediate, response_length > 200, NOT broken
  // ════════════════════════════════════════════════════════
  {
    id: 'B1',
    bucket: 'B',
    personaId: 'lan',
    personaName: 'Lan',
    personaLevel: 'intermediate',
    selectedText: 'Agent system hoạt động như thế nào?',
    expectedLevel: 'intermediate',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'AI agent là gì?' },
      { role: 'user', text: 'so sánh với chatbot thường đi' },
    ],
    description: 'Lan hỏi về cơ chế hoạt động của agent system',
  },
  {
    id: 'B2',
    bucket: 'B',
    personaId: 'lan',
    personaName: 'Lan',
    personaLevel: 'intermediate',
    selectedText: 'MLOps khác gì AI Engineer?',
    expectedLevel: 'intermediate',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'AI Engineer là gì?' },
      { role: 'user', text: 'vậy MLOps làm gì?' },
    ],
    description: 'Lan hỏi phân biệt MLOps vs AI Engineer',
  },
  {
    id: 'B3',
    bucket: 'B',
    personaId: 'lan',
    personaName: 'Lan',
    personaLevel: 'intermediate',
    selectedText: 'Làm sao deploy một model AI lên production?',
    expectedLevel: 'intermediate',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'model nhẹ là gì?' },
      { role: 'user', text: 'deploy ở đâu?' },
    ],
    description: 'Lan hỏi về deploy — intermediate practical question',
  },
  {
    id: 'B4',
    bucket: 'B',
    personaId: 'lan',
    personaName: 'Lan',
    personaLevel: 'intermediate',
    selectedText: 'Custom agent khác gì ChatGPT thường?',
    expectedLevel: 'intermediate',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'ChatGPT là gì?' },
      { role: 'user', text: 'custom agent là gì?' },
    ],
    description: 'Lan hỏi về custom agent vs general chatbot',
  },
  {
    id: 'B5',
    bucket: 'B',
    personaId: 'lan',
    personaName: 'Lan',
    personaLevel: 'intermediate',
    selectedText: 'Làm sao đánh giá chất lượng câu trả lời của AI?',
    expectedLevel: 'intermediate',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'prompt là gì?' },
      { role: 'user', text: 'tại sao AI đôi khi sai?' },
    ],
    description: 'Lan hỏi về đánh giá AI quality',
  },

  // ════════════════════════════════════════════════════════
  // BUCKET C — Advanced (5 questions, Phong persona)
  // Expected: level=advanced, response_length > 250, NOT broken
  // ════════════════════════════════════════════════════════
  {
    id: 'C1',
    bucket: 'C',
    personaId: 'phong',
    personaName: 'Phong',
    personaLevel: 'advanced',
    selectedText: 'So sánh prompt engineering với fine-tuning model — khi nào nên dùng cái nào?',
    expectedLevel: 'advanced',
    transcriptExcerpt: EXCERPT_C,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'gradient descent là gì?' },
      { role: 'user', text: 'backpropagation hoạt động thế nào?' },
      { role: 'user', text: 'attention mechanism khác gì transformer?' },
    ],
    description: 'Phong hỏi advanced comparison: prompt vs fine-tuning',
  },
  {
    id: 'C2',
    bucket: 'C',
    personaId: 'phong',
    personaName: 'Phong',
    personaLevel: 'advanced',
    selectedText: 'Embedding space trong LLM là gì và tại sao nó quan trọng cho RAG?',
    expectedLevel: 'advanced',
    transcriptExcerpt: EXCERPT_C,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'tokenization là gì?' },
      { role: 'user', text: 'vector database khác gì SQL?' },
      { role: 'user', text: 'RAG pipeline hoạt động ra sao?' },
    ],
    description: 'Phong hỏi về embedding space và RAG',
  },
  {
    id: 'C3',
    bucket: 'C',
    personaId: 'phong',
    personaName: 'Phong',
    personaLevel: 'advanced',
    selectedText: 'Chain-of-thought prompting so với few-shot learning — ưu nhược điểm gì?',
    expectedLevel: 'advanced',
    transcriptExcerpt: EXCERPT_C,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'few-shot learning là gì?' },
      { role: 'user', text: 'chain-of-thought khác gì?' },
    ],
    description: 'Phong hỏi advanced prompting technique comparison',
  },
  {
    id: 'C4',
    bucket: 'C',
    personaId: 'phong',
    personaName: 'Phong',
    personaLevel: 'advanced',
    selectedText: 'Fine-tuning LLM khác gì RAG — trường hợp nào dùng cái nào hiệu quả hơn?',
    expectedLevel: 'advanced',
    transcriptExcerpt: EXCERPT_C,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'fine-tuning LLM là gì?' },
      { role: 'user', text: 'RAG với vector database hoạt động ra sao?' },
      { role: 'user', text: 'embedding model khác gì base LLM?' },
    ],
    description: 'Phong hỏi domain-specific LLM strategy',
  },
  {
    id: 'C5',
    bucket: 'C',
    personaId: 'phong',
    personaName: 'Phong',
    personaLevel: 'advanced',
    selectedText: 'Self-hosting một model nhẹ với vLLM có đủ cho chatbot production không?',
    expectedLevel: 'advanced',
    transcriptExcerpt: EXCERPT_C,
    gradeMissing: false,
    history: [
      { role: 'user', text: 'model quantization là gì?' },
      { role: 'user', text: 'vLLM khác gì llama.cpp?' },
      { role: 'user', text: 'latency của 7B model với vLLM bao nhiêu?' },
    ],
    description: 'Phong hỏi về self-hosting LLM production infrastructure',
  },

  // ════════════════════════════════════════════════════════
  // BUCKET D — Broken segment (5 questions, Ẩn danh persona)
  // Expected: segment=broken, warning !== null, NO Gemini call
  // ════════════════════════════════════════════════════════
  {
    id: 'D1',
    bucket: 'D',
    personaId: 'anonymous',
    personaName: 'Ẩn danh',
    personaLevel: 'unknown',
    selectedText: '',
    expectedLevel: 'unknown',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: true,
    history: [],
    description: 'Empty question — grade_missing + empty selectedText',
  },
  {
    id: 'D2',
    bucket: 'D',
    personaId: 'anonymous',
    personaName: 'Ẩn danh',
    personaLevel: 'unknown',
    selectedText: 'x',
    expectedLevel: 'unknown',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: true,
    history: [],
    description: 'Single char, unrelated to transcript — no_evidence + grade_missing',
  },
  {
    id: 'D3',
    bucket: 'D',
    personaId: 'anonymous',
    personaName: 'Ẩn danh',
    personaLevel: 'unknown',
    selectedText: 'công thức tính diện tích hình tròn là gì',
    expectedLevel: 'unknown',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: true,
    history: [],
    description: 'Off-topic question — no word overlap with transcript',
  },
  {
    id: 'D4',
    bucket: 'D',
    personaId: 'anonymous',
    personaName: 'Ẩn danh',
    personaLevel: 'unknown',
    selectedText: 'tôi thích ăn phở',
    expectedLevel: 'unknown',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: true,
    history: [],
    description: 'Irrelevant personal statement — no_evidence + grade_missing',
  },
  {
    id: 'D5',
    bucket: 'D',
    personaId: 'anonymous',
    personaName: 'Ẩn danh',
    personaLevel: 'unknown',
    selectedText: 'hello',
    expectedLevel: 'unknown',
    transcriptExcerpt: EXCERPT_AB,
    gradeMissing: true,
    history: [],
    description: 'English greeting — unrelated to transcript, grade_missing',
  },
];

export const PERSONA_CONTEXTS: Record<string, PersonaContext> = {
  minh: {
    id: 'minh',
    name: 'Minh',
    level: 'beginner',
    history: [
      { role: 'user', text: 'attention là gì?' },
      { role: 'user', text: 'giải thích đơn giản hơn' },
      { role: 'user', text: 'cho ví dụ' },
    ],
    grade_missing: false,
  },
  lan: {
    id: 'lan',
    name: 'Lan',
    level: 'intermediate',
    history: [
      { role: 'user', text: 'self-attention khác gì cross-attention?' },
      { role: 'user', text: 'QKV là gì?' },
    ],
    grade_missing: false,
  },
  phong: {
    id: 'phong',
    name: 'Phong',
    level: 'advanced',
    history: [
      { role: 'user', text: 'gradient descent là gì?' },
      { role: 'user', text: 'backpropagation hoạt động thế nào?' },
      { role: 'user', text: 'attention mechanism khác gì transformer?' },
      { role: 'user', text: 'embedding là gì?' },
    ],
    grade_missing: false,
  },
  anonymous: {
    id: 'anonymous',
    name: 'Ẩn danh',
    level: 'unknown',
    history: [],
    grade_missing: true,
  },
};
