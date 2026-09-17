/**
 * Mock Gemini responses for each persona.
 * Used when VITE_GEMINI_API_KEY is missing or is a placeholder ("your-").
 *
 * Each persona gets a deterministic TutorResponse that matches the
 * real API schema so ChatBox renders correctly with or without a real key.
 *
 * @see gemini.ts — the real gateway that decides mock vs. real
 */

import type { TutorResponse } from '../types';

/** Chat history entry. */
export interface MockHistoryEntry {
  role: 'user' | 'tutor';
  text: string;
}

/**
 * Returns a mock TutorResponse for the given persona + selected text.
 *
 * Happy path:
 * - Minh  → beginner + low-confidence beginner answer (with "Chỉnh mức" hint)
 * - Lan   → intermediate + deeper technical answer
 *
 * Broken path:
 * - Ẩn danh → segment:"broken", reason:"grade_missing", warning + 2 options
 *
 * @param personaId  - persona identifier: "minh" | "lan" | "anonymous"
 * @param selectedText - text the user highlighted in the transcript
 */
export function getMockResponse(
  personaId: string,
  selectedText: string
): TutorResponse {
  const excerpt = selectedText.slice(0, 60);

  switch (personaId) {
    case 'minh': {
      return {
        level: 'beginner',
        confidence: 0.55,
        segment: 'normal',
        segment_reason: null,
        answer:
          `## 🟢 Mức hiểu của bạn: Beginner\n\n` +
          `Mình suy ra bạn đang ở **mức mới bắt đầu** từ ${3} câu hỏi đã hỏi trước đó.\n\n` +
          `### Giải thích về *"${excerpt}"*\n\n` +
          `Mình sẽ giải thích thật đơn giản nhé:\n\n` +
          `**${excerpt}** là một khái niệm cơ bản trong lĩnh vực này.\n\n` +
          `> 💡 **Ví dụ đời thường:** Hãy tưởng tượng bạn đang đọc một bài báo. Bạn không đọc từng chữ một mà ` +
          `tập trung vào **ý chính** của từng đoạn. Cơ chế này hoạt động tương tự!\n\n` +
          `### Tóm tắt\n\n` +
          `- Đây là khái niệm **nền tảng** bạn cần nắm vững\n` +
          `- Nếu bạn muốn hiểu sâu hơn, hãy bấm **"Chỉnh mức"** để mình giải thích chuyên sâu hơn nhé!`,
        warning: null,
        options: [],
      };
    }

    case 'lan': {
      return {
        level: 'intermediate',
        confidence: 0.72,
        segment: 'normal',
        segment_reason: null,
        answer:
          `## 🟡 Mức hiểu của bạn: Intermediate\n\n` +
          `Mình suy ra bạn đang ở **mức trung bình** — bạn đã có kiến thức nền tảng và ` +
          `đang hỏi những câu hỏi có độ sâu hơn.\n\n` +
          `### Giải thích về *"${excerpt}"*\n\n` +
          `Ở mức này, mình sẽ giải thích **vừa đủ** kèm thuật ngữ chính xác:\n\n` +
          `**${excerpt}** liên quan đến cách hệ thống xử lý thông tin theo trình tự, ` +
          `trong đó mỗi bước nhận đầu vào từ bước trước đó và tạo đầu ra cho bước tiếp theo.\n\n` +
          `### Điểm chính cần nhớ\n\n` +
          `1. **Cấu trúc:** Dạng pipeline, mỗi layer là một transformation\n` +
          `2. **Thứ tự:** Xử lý tuần tự, output của layer N là input của layer N+1\n` +
          `3. **Vanishing gradient:** Layer đầu nhận tín hiệu yếu hơn khi network sâu\n\n` +
          `### Gợi ý\n\n` +
          `Nếu bạn muốn chuyên sâu hơn → bấm **"Chỉnh mức"** để mình đi sâu vào chi tiết kỹ thuật!`,
        warning: null,
        options: [],
      };
    }

    // Broken segment — Ẩn danh (grade_missing=True, empty history)
    default: {
      return {
        level: 'unknown',
        confidence: 0,
        segment: 'broken',
        segment_reason: 'grade_missing',
        answer:
          `Mình không thể xác định mức hiểu của bạn một cách chính xác. ` +
          `Để trả lời đúng cho bạn, mình đề xuất bạn hỏi giảng viên trực tiếp nhé.`,
        warning:
          'Bạn chưa có điểm trong hệ thống VLearn và mình không có lịch sử tương tác. ' +
          'Mình không thể suy ra mức hiểu của bạn một cách chính xác.',
        options: ['Chuyển giảng viên', 'Trả lời mặc định'],
      };
    }
  }
}
