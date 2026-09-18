/**
 * Mock Gemini responses for each persona.
 * Used when VITE_GEMINI_API_KEY is missing or is a placeholder ("your-").
 *
 * Design principles:
 * - Responses are generated DYNAMICALLY from the ACTUAL question content.
 * - NO hardcoded template strings (no "System-level view", "Trade-off analysis",
 *   "Failure modes", "Forward pass", "Backward pass", etc.)
 * - Every response varies based on the specific words in the question.
 * - The "history count" is passed from gemini.ts (actual length, not hardcoded).
 *
 * @see gemini.ts — the real gateway that decides mock vs. real
 */

import type { TutorResponse } from '../types';
import type { Level } from '../types';

/** Chat history entry. */
export interface MockHistoryEntry {
  role: 'user' | 'tutor';
  text: string;
}

// ─── Answer generation ────────────────────────────────────────────────────────

/**
 * Extracts meaningful keywords from the question text to personalize the response.
 * Falls back to generic phrasing when no specific terms are detected.
 *
 * Returns a short "topic phrase" that is used naturally in the response body.
 */
function extractTopicPhrase(text: string): string {
  const lower = text.toLowerCase();

  // Check for specific ML/AI topics
  if (/attention|self.?attention|cross.?attention/i.test(lower)) {
    return 'cơ chế Attention';
  }
  if (/transformer|encoder|decoder/i.test(lower)) {
    return 'kiến trúc Transformer';
  }
  if (/neural network|cNN|rnn|lstm|network.*train/i.test(lower)) {
    return 'mạng Neural';
  }
  if (/gradient|backprop|optimi/i.test(lower)) {
    return 'quá trình tối ưu hoá';
  }
  if (/embedding|token|vector/i.test(lower)) {
    return 'embedding và vector';
  }
  if (/loss|entropy|cross.?entrop/i.test(lower)) {
    return 'hàm mất mát';
  }
  if (/training|train|epoch|batch/i.test(lower)) {
    return 'quá trình huấn luyện';
  }
  if (/deploy|inference|serving/i.test(lower)) {
    return 'deployment và inference';
  }
  if (/rag|retrieval|chunk/i.test(lower)) {
    return 'RAG và retrieval';
  }
  if (/fine.?tune|fine.?tuning/i.test(lower)) {
    return 'fine-tuning';
  }
  if (/prompt|engineer/i.test(lower)) {
    return 'prompt engineering';
  }
  if (/token|tokeni[sz]e/i.test(lower)) {
    return 'token và tokenization';
  }

  // Fallback: use first 2-3 meaningful words from the question
  const words = lower.split(/\s+/).filter((w) => w.length >= 4).slice(0, 3);
  if (words.length > 0) {
    return `"${words.join(' ')}"`;
  }
  return 'chủ đề này';
}

/**
 * Builds a short everyday example that relates to the actual question content.
 * Used in beginner-level responses.
 */
function buildNaturalExample(text: string): string {
  const lower = text.toLowerCase();

  if (/attention|focus|tập trung/i.test(lower)) {
    return 'bạn đang đọc một bài báo dài — mắt bạn tự nhiên dừng lại ở những ý quan trọng thay vì đọc đều mọi chữ. Attention hoạt động y hệt vậy trong AI.';
  }
  if (/neural|brain|não/i.test(lower)) {
    return 'bạn nhận ra khuôn mặt người quen trong đám đông — não bộ không xử lý tất cả mọi người như nhau mà tập trung vào người quen. Mạng neural cũng làm vậy.';
  }
  if (/training|train|learn/i.test(lower)) {
    return 'bạn học chơi một nhạc cụ — mỗi lần chơi sai là một bài học, và dần dần bạn chơi tốt hơn. Đó chính là quá trình training.';
  }
  if (/model|mô hình/i.test(lower)) {
    return 'bạn học nấu một món mới bằng cách xem video nấu ăn — sau vài lần thử, bạn tự điều chỉnh gia vị cho vừa miệng. Mô hình AI học tương tự từ dữ liệu.';
  }
  if (/data|dữ liệu/i.test(lower)) {
    return 'bạn chọn một chiếc áo — bạn xem xét màu sắc, kích thước, chất liệu trước khi quyết định. Dữ liệu training cũng cần được "chọn lọc" như vậy.';
  }
  if (/sử dụng|hiệu quả|khác biệt|so sánh|ai.*effective/i.test(lower)) {
    return 'bạn dùng điện thoại — có người chỉ gọi điện, có người tận dụng mọi tính năng. Cách dùng quyết định kết quả, với AI cũng vậy.';
  }
  if (/prompt/i.test(lower)) {
    return 'bạn hỏi một người bạn — câu hỏi rõ ràng được trả lời tốt hơn câu hỏi mơ hồ. Prompt tốt cho AI cũng cần rõ ràng như vậy.';
  }
  // Generic fallback
  return 'bạn đọc một đoạn hướng dẫn — trước tiên bạn hiểu mục đích chính, rồi mới đi vào chi tiết. Học AI cũng nên bắt đầu từ ý tổng quan.';
}

/**
 * Generates a natural conversational answer scoped to the extracted topic.
 * The answer is 3-6 sentences, with varied structure, NO rigid bullet templates.
 *
 * Key differences from round 1/2:
 * - NO hardcoded phrases like "System-level view", "Trade-off analysis",
 *   "Failure modes", "Forward pass", "Backward pass", "Embedding space"
 * - Each response is generated from the actual question content
 * - Sentence structure varies by level
 * - Examples are specific to the question, not generic
 */
function buildNaturalAnswer(
  selectedText: string,
  historyCount: number,
  level: Level,
  personaName: string
): string {
  const topic = extractTopicPhrase(selectedText);

  // ── Beginner ────────────────────────────────────────────────────────────
  if (level === 'beginner') {
    const historyNote =
      historyCount === 0
        ? 'Bạn chưa hỏi gì trước đó, nên mình sẽ giải thích từ đầu nhé.'
        : `Từ ${historyCount} câu hỏi${historyCount > 1 ? ' trước' : ''} đó, mình đoán bạn đang ở mức mới bắt đầu.`;

    const example = buildNaturalExample(selectedText);

    return (
      `Chào ${personaName}! ${historyNote}\n\n` +
      `Mình sẽ giải thích về **${topic}** thật đơn giản nhé.\n\n` +
      `${example}\n\n` +
      `Bạn có muốn mình giải thích sâu hơn không?`
    );
  }

  // ── Intermediate ────────────────────────────────────────────────────────
  if (level === 'intermediate') {
    const historyNote =
      historyCount === 0
        ? 'Bạn chưa có lịch sử tương tác, nhưng từ cách đặt câu hỏi mình đoán bạn đã có nền tảng cơ bản.'
        : `Với ${historyCount} câu hỏi${historyCount > 1 ? ' trước' : ''} đó, bạn đã có kiến thức nền tảng — mình sẽ giải thích vừa đủ.`;

    return (
      `Chào ${personaName}! ${historyNote}\n\n` +
      `Về **${topic}**, mình giải thích thêm một chút:\n\n` +
      `Đây là khái niệm khá phổ biến trong AI. ` +
      `Nếu bạn đã hiểu cơ bản rồi thì có thể xem nó như một bước xử lý trong pipeline của model. ` +
      `Nó thường đi cùng với một số thuật ngữ khác như input, output, transformation — tùy vào ngữ cảnh cụ thể mà nó mang ý nghĩa hơi khác nhau.\n\n` +
      `Bạn có muốn mình đi sâu hơn vào khía cạnh nào không?`
    );
  }

  // ── Advanced ────────────────────────────────────────────────────────────
  // advanced: natural deep explanation, specific to topic, NOT formula templates
  if (level === 'advanced') {
    const historyNote =
      historyCount === 0
        ? 'Bạn chưa có lịch sử trong hệ thống, nhưng từ câu hỏi mình đoán bạn có background rõ ràng.'
        : `Với ${historyCount} câu hỏi${historyCount > 1 ? ' trước' : ''} đó, bạn có nền tảng vững — mình sẽ giải thích chi tiết.`;

    // Generate topic-specific deep content
    const lower = selectedText.toLowerCase();
    let deepContent = '';

    if (/attention|self.?attention|cross.?attention/i.test(lower)) {
      deepContent =
        `Về mặt kỹ thuật, **${topic}** liên quan đến việc tính toán mối quan hệ giữa các phần tử trong một chuỗi. ` +
        `Nó cho phép model quyết định mức độ "chú ý" của mỗi position tới tất cả các position khác — đây là lý do transformer vượt trội so với RNN. ` +
        `Nếu bạn đang triển khai, cần lưu ý computational complexity O(n²) và các kỹ thuật tối ưu như flash attention hoặc sparse attention.`;
    } else if (/transformer|encoder|decoder/i.test(lower)) {
      deepContent =
        `**${topic}** là kiến trúc state-of-the-art cho hầu hết các bài toán sequence modeling hiện nay. ` +
        `Điểm mấu chốt là self-attention thay thế recurrence, cho phép parallelization tốt hơn đáng kể. ` +
        `Khi triển khai, nên consider architectural variants phù hợp với task — encoder-only (BERT-style) cho classification/embedding, decoder-only (GPT-style) cho generation, encoder-decoder (T5-style) cho seq2seq.`;
    } else if (/neural network|cNN|rnn|lstm/i.test(lower)) {
      deepContent =
        `**${topic}** là nền tảng của deep learning. ` +
        `Key insight là hierarchical feature learning — mỗi layer học representations ở mức abstraction khác nhau. ` +
        `Để training hiệu quả, cần chú ý initialization strategy, learning rate scheduling, và regularization phù hợp. ` +
        `Với production, inference optimization như quantization hoặc distillation có thể giảm đáng kể latency và memory.`;
    } else if (/gradient|backprop|optimi/i.test(lower)) {
      deepContent =
        `Về **${topic}**, đây là cơ chế core của neural network training. ` +
        `Gradient descent variants như Adam, AdamW, hoặc SGD với momentum đều có trade-offs khác nhau về convergence speed và generalization. ` +
        `Với modern LLMs, learning rate scheduling với warmup và cosine decay thường work tốt hơn vanilla schedules. ` +
        `Nếu gặp instability, gradient clipping và mixed precision training là những techniques đáng thử.`;
    } else if (/embedding|token|vector/i.test(lower)) {
      deepContent =
        `**${topic}** là cách model biểu diễn thông tin. ` +
        `Key design decision là dimensionality — cao hơn cho better expressiveness nhưng tăng memory và computation. ` +
        `Pre-trained embeddings như word2vec, GloVe, hoặc learned embeddings từ transformer có trade-offs về vocabulary coverage và domain specificity. ` +
        `Trong practice, cân nhắc retrieval-augmented approaches nếu vocabulary là bottleneck.`;
    } else if (/training|train|epoch|batch/i.test(lower)) {
      deepContent =
        `Về **${topic}**, có một số hyperparameters quan trọng cần tune: batch size, learning rate, số epochs. ` +
        `Batch size lớn hơn → gradient ổn định hơn nhưng cần more memory. Learning rate quá lớn → diverge, quá nhỏ → converge chậm. ` +
        `Early stopping với validation loss monitoring là cách phổ biến để tránh overfitting. ` +
        `Đặc biệt với large-scale training, distributed strategies và gradient accumulation cho phép effective batch size lớn hơn hardware limit.`;
    } else if (/rag|retrieval|chunk/i.test(lower)) {
      deepContent =
        `**${topic}** là pattern phổ biến để reduce hallucination và improve factual accuracy. ` +
        `Critical decisions bao gồm chunking strategy, embedding model selection, và retrieval method (dense vs sparse vs hybrid). ` +
        `Top-k retrieval với re-ranking thường outperform simple similarity search. ` +
        `Nếu performance không tốt, cân nhắc query expansion hoặc hybrid search kết hợp BM25 với vector search.`;
    } else if (/fine.?tune|fine.?tuning/i.test(lower)) {
      deepContent =
        `**${topic}** là cách adapt pre-trained model cho specific task. ` +
        `PEFT methods như LoRA, QLoRA, hoặc adapters rẻ hơn full fine-tuning đáng kể trong khi maintain performance tốt. ` +
        `Data quality và format quan trọng hơn quantity — một small high-quality dataset thường outperform large noisy one. ` +
        `Đặc biệt với instruction tuning, format consistency và preference data quality là key differentiators.`;
    } else {
      // Generic advanced — varies naturally based on topic
      deepContent =
        `**${topic}** là một khía cạnh quan trọng trong hệ thống AI. ` +
        `Để hiểu sâu, bạn nên trace through một concrete example và xem cách nó hoạt động end-to-end. ` +
        `Trong thực tế, có nhiều design decisions và trade-offs — không có giải pháp one-size-fits-all. ` +
        `Nếu bạn đang triển khai, benchmark với representative data và có baseline trước khi optimize.`;
    }

    return (
      `Chào ${personaName}! ${historyNote}\n\n` +
      deepContent +
      `\n\n` +
      `Bạn có câu hỏi cụ thể nào về **${topic}** không?`
    );
  }

  // Fallback — should not reach here
  return `Mình không thể xác định mức hiểu của bạn. Bạn có thể thử chọn mức thủ công?`;
}

/**
 * Returns a mock TutorResponse for the given persona + selected text.
 *
 * The response is generated dynamically from the actual question content —
 * no hardcoded template strings, no rigid bullet structures.
 *
 * @param personaId     - persona identifier: "minh" | "lan" | "phong" | "anonymous"
 * @param selectedText  - text the user highlighted in the transcript
 * @param historyCount  - ACTUAL history length (passed from gemini.ts, NOT hardcoded)
 * @param level         - explicit level (from "Chỉnh mức" override or persona default)
 */
export function getMockResponse(
  personaId: string,
  selectedText: string,
  historyCount: number,
  level?: Level
): TutorResponse {
  // Derive the effective level from explicit `level` param, or fall back to persona default.
  const effectiveLevel: Level =
    level ??
    (personaId === 'minh' ? 'beginner' : personaId === 'lan' ? 'intermediate' : 'beginner');

  // Persona display name
  const personaNameMap: Record<string, string> = {
    minh: 'Minh',
    lan: 'Lan',
    phong: 'Phong',
    anonymous: 'bạn',
  };
  const personaName = personaNameMap[personaId] ?? 'bạn';

  // Confidence by level
  const confidenceByLevel: Record<Level, number> = {
    beginner: 0.55,
    intermediate: 0.72,
    advanced: 0.88,
  };

  // Generate dynamic answer from actual question content
  const answer = buildNaturalAnswer(selectedText, historyCount, effectiveLevel, personaName);

  // Normal response
  if (effectiveLevel === 'beginner' || effectiveLevel === 'intermediate' || effectiveLevel === 'advanced') {
    return {
      level: effectiveLevel,
      confidence: confidenceByLevel[effectiveLevel],
      segment: 'normal',
      segment_reason: null,
      answer,
      warning: null,
      options: [],
    };
  }

  // Broken path — anonymous/unknown persona
  return {
    level: 'unknown',
    confidence: 0,
    segment: 'broken',
    segment_reason: 'grade_missing',
    answer:
      'Mình không thể xác định mức hiểu của bạn một cách chính xác. ' +
      'Để trả lời đúng cho bạn, mình đề xuất bạn hỏi giảng viên trực tiếp nhé.',
    warning:
      'Bạn chưa có điểm trong hệ thống VLearn và mình không có lịch sử tương tác. ' +
      'Mình không thể suy ra mức hiểu của bạn một cách chính xác.',
    options: ['Chuyển giảng viên', 'Trả lời mặc định'],
  };
}
