# HV2 — Prompt/Retrieval Engineer
## Hướng dẫn chi tiết từ CP1 đến CP5
### Nhóm: K4-3B-E402-CiteTutor · Track A1c · Lớp 3B, Phòng E402

---

## 1. Vai trò & trách nhiệm HV2

### Mục tiêu
Xây dựng **Prompt system** cho tutor VLearn đạt quality bar chốt tại CP4. Sản phẩm core: 
1. **Suy ra mức hiểu** của học viên từ lịch sử tương tác (không dựa vào cột `understanding_level` đang trống 99,85%)
2. **Phát hiện segment hỏng** (`grade_missing`) và từ chối cùng cảnh báo

### Trách nhiệm chính (PIVOT)
| Trách nhiệm | Output | Deadline |
|---|---|---|
| Định nghĩa logic suy ra mức hiểu | Canvas CP1 dòng 6 | CP1 (19:30 17/9) |
| Định nghĩa logic phát hiện segment hỏng | Canvas CP1 dòng 6 | CP1 (19:30 17/9) |
| Mock pipeline | `codebase/prompt_tutor_v1.py` (mock) | CP2 (21:00 17/9) |
| Pipeline thật + ≥1 AI call | Code chạy được + video 30s | CP3 (16:00 18/9) |
| Golden set + quality bar | `eval/golden-set.csv`, `eval/results-cp3.md` | CP4 (21:00 18/9) |

### Tiêu chí rubric liên quan
- **R3 (11đ)** — 4 lớp chỗ khó (§7) + ≥8 kịch bản rủi ro (§8)
- **R4 (15đ)** — Golden set ≥20 case + quality bar ≥85% personalization + 100% broken detection + bảng % trong `eval/results-cp3.md`

---

## 2. Kiến trúc hệ thống (PIVOT)

### Sơ đồ flow chính

```
┌─────────────────────────────────────────────────────────────────┐
│                    HV3 Frontend (UI)                            │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │  Ô bôi đen đoạn slide │    │  Ô chat / câu trả lời tutor  │  │
│  │  + User history badge  │    │  + Mức hiểu indicator (🟢/🟡/🔴)│  │
│  └──────────┬───────────┘    └──────────────┬───────────────┘  │
└─────────────┼────────────────────────────────────┼──────────────┘
              │                                    │
              ▼                                    │
┌─────────────────────────────────────────────────────────────────┐
│                    HV2 Backend (prompt_tutor_v1.py)             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  1. UNDERSTANDING INFERENCE — Suy ra mức hiểu         │    │
│  │     • Phân tích lịch sử câu hỏi (số lần, độ dài)     │    │
│  │     • Phân tích độ dài câu trả lời user               │    │
│  │     • Phân tích từ vựng sử dụng (chuyên ngữ/đơn giản)│    │
│  │     • Phân tích số lần hỏi lại                        │    │
│  │     → Trả về: beginner / intermediate / advanced       │    │
│  └─────────────────────────────┬───────────────────────────┘    │
│                                  │                               │
│                                  ▼                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  2. SEGMENT DETECTION — Phát hiện segment hỏng       │    │
│  │     • Kiểm tra grade_missing flag                     │    │
│  │     • Kiểm tra lịch sử tương tác (rỗng = cảnh báo) │    │
│  │     • Kiểm tra căn cứ trong transcript               │    │
│  │                                                          │    │
│  │     ┌──────────────────────────────────────────┐          │    │
│  │     │  SEGMENT HỎNG → return warning + refuse  │          │    │
│  │     └──────────────────────────────────────────┘          │    │
│  └─────────────────────────────┬───────────────────────────┘    │
│                                  │                               │
│                                  │ Không phải segment hỏng       │
│                                  ▼                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  3. GENERATION — Sinh câu trả lời theo mức hiểu       │    │
│  │     • System prompt: vai trò tutor + mức hiểu          │    │
│  │     • User prompt: đoạn bôi đen + mức hiểu suy ra     │    │
│  │     • Format: Câu trả lời phù hợp + mức hiểu badge   │    │
│  └─────────────────────────────┬───────────────────────────┘    │
│                                  │                               │
│                                  ▼                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  4. LOG — Lưu trace cho eval                          │    │
│  │     • eval/logs/cp3-run-1.jsonl                       │    │
│  │     • Input · mức hiểu suy ra · output · latency      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Data flow chi tiết

```
Input: Đoạn text bôi đen ("backpropagation") + user_id

Step 1: Understanding Inference
  ↓
  history = get_user_history(user_id)
  # history = {questions: [...], answers: [...], ask_count: N}
  
  # Tín hiệu 1: Số câu hỏi trong lịch sử
  if history.questions.length <= 1:
      level = "beginner"
  
  # Tín hiệu 2: Độ dài câu trả lời user
  avg_answer_len = average([len(a) for a in history.answers])
  if avg_answer_len < 50:
      level = "beginner"
  
  # Tín hiệu 3: Từ vựng sử dụng
  if has_technical_terms(user_last_answer):
      level = "intermediate" or "advanced"
  
  # Tín hiệu 4: Số lần hỏi lại
  if ask_count > 2:
      level = "beginner"
      
Step 2: Segment Detection
  ↓
  user_profile = get_user_profile(user_id)
  
  if user_profile.grade_missing == True AND history.is_empty:
      → return SEGMENT_BROKEN
      → message: "Mình nhận thấy bạn chưa có điểm trong hệ thống..."
      → options: ["Chuyển GV", "Trả lời mặc định"]

Step 3: Gemini Generation
  ↓
  prompt = f"""
  Bạn là tutor VLearn. Học viên đang ở mức: {inferred_level}
  
  Đoạn slide được chọn:
  "{highlighted_text}"
  
  Yêu cầu:
  - Trả lời PHÙ HỢP với mức: {inferred_level}
  - Beginner: Giải thích từ gốc, dùng analogy đời thường
  - Intermediate: Giải thích vừa đủ, có thuật ngữ
  - Advanced: Trả lời chuyên sâu, có công thức
  - Nếu không chắc chắn → nói rõ giới hạn
  """
  response = model.generate_content(prompt)
  
Output: {"answer": "...", "level": "beginner", "segment": "normal", "message": null}
```

---

## 3. Công việc CP1 (Deadline: 19:30, 17/9/2026)

### Mục tiêu
Định nghĩa 2 logic chính: **Suy ra mức hiểu** và **Phát hiện segment hỏng**.

### Tiêu chí "Suy ra mức hiểu" (4 tín hiệu)

| # | Tín hiệu | Threshold | Giải thích |
|---|---|---|---|
| 1 | **Số câu hỏi trong lịch sử** | ≤2 câu = beginner | HV mới hoặc ít tương tác |
| 2 | **Độ dài câu trả lời user** | <50 ký tự = beginner | Câu trả lời ngắn = chưa hiểu sâu |
| 3 | **Từ vựng sử dụng** | Có thuật ngữ chuyên ngành = intermediate/advanced | VD: "chain rule", "gradient descent" |
| 4 | **Số lần hỏi lại** | >2 lần cùng vấn đề = beginner | HV chưa hiểu rõ |

### Tiêu chí "Phát hiện segment hỏng" (3 điều kiện — nếu ĐÚNG 1 trong 2 nhóm thì là segment hỏng)

| Nhóm | Điều kiện | Threshold | Giải thích |
|---|---|---|---|
| **A** | `grade_missing = True` VÀ lịch sử rỗng | BẮT BUỘC cả 2 | Không có data để suy ra |
| **B** | Câu hỏi ngoài transcript VÀ không có lịch sử | BẮT BUỘC cả 2 | Không có căn cứ |

### Cập nhật canvas-cp1.md

Mở file `canvas-cp1.md`, thêm vào dòng 6 (phần "Tự làm / Không tự"):

```markdown
| 6 | AI tự làm / Không tự | **HV2 (Prompt/Retrieval):**
- **Tự:** suy ra mức hiểu từ lịch sử (4 tín hiệu) + phát hiện segment hỏng (2 nhóm điều kiện)
- **Không tự:** giả vờ biết mức hiểu khi không đủ tín hiệu · trả lời khi thuộc segment hỏng mà không cảnh báo |
```

### Checklist CP1 cho HV2

- [x] Định nghĩa "suy ra mức hiểu" đã ghi vào canvas dòng 6 (4 tín hiệu)
- [x] Định nghĩa "phát hiện segment hỏng" đã ghi vào canvas dòng 6 (2 nhóm điều kiện)
- [x] Threshold cho từng tín hiệu đã ghi rõ

---

## 4. Công việc CP2 (Deadline: 21:00, 17/9/2026)

### Mục tiêu
Mock inference pipeline chạy được với data giả — **chưa cần AI thật**.

### Cấu trúc thư mục cần tạo

```
codebase/
├── prompt_tutor_v1.py      # Pipeline chính (mock)
├── mock_data/
│   ├── user_profiles.json  # Profile giả (có grade_missing)
│   └── user_history.json   # Lịch sử tương tác giả
├── .env.example            # Template API key
└── .gitignore
```

### Code mock understanding inference

```python
# codebase/prompt_tutor_v1.py

from dataclasses import dataclass
from typing import Optional
import json
from datetime import datetime

@dataclass
class UserProfile:
    user_id: str
    grade_missing: bool
    cohort_hint: str = ""

@dataclass
class UserHistory:
    user_id: str
    questions: list[str]
    answers: list[str]
    ask_count: dict[str, int]  # topic -> count

@dataclass
class InferenceResult:
    level: str  # beginner / intermediate / advanced
    confidence: float
    signals: dict[str, float]

def infer_understanding_level(history: UserHistory) -> InferenceResult:
    """
    Suy ra mức hiểu từ 4 tín hiệu.
    CHƯA có AI thật — dùng heuristic mock.
    """
    signals = {}
    
    # Tín hiệu 1: Số câu hỏi trong lịch sử
    question_count = len(history.questions)
    if question_count <= 2:
        signals['question_count'] = 0.2  # beginner
    elif question_count <= 5:
        signals['question_count'] = 0.5  # intermediate
    else:
        signals['question_count'] = 0.8  # advanced
    
    # Tín hiệu 2: Độ dài câu trả lời user (avg)
    if history.answers:
        avg_answer_len = sum(len(a) for a in history.answers) / len(history.answers)
        if avg_answer_len < 50:
            signals['answer_length'] = 0.2
        elif avg_answer_len < 150:
            signals['answer_length'] = 0.5
        else:
            signals['answer_length'] = 0.8
    else:
        signals['answer_length'] = 0.3  # Không có câu trả lời → beginner
    
    # Tín hiệu 3: Từ vựng chuyên ngành
    technical_terms = ['chain rule', 'gradient descent', 'backprop', 
                       'softmax', 'embedding', 'neural network', 'CNN', 'RNN']
    has_technical = any(term in ' '.join(history.answers).lower() 
                        for term in technical_terms)
    signals['technical_vocabulary'] = 0.8 if has_technical else 0.3
    
    # Tín hiệu 4: Số lần hỏi lại
    total_asks = sum(history.ask_count.values())
    if total_asks > 3:
        signals['repeat_asks'] = 0.2  # beginner - hỏi nhiều
    elif total_asks > 1:
        signals['repeat_asks'] = 0.5  # intermediate
    else:
        signals['repeat_asks'] = 0.8  # advanced
    
    # Tổng hợp score (trung bình có trọng số)
    total_score = (
        signals['question_count'] * 0.25 +
        signals['answer_length'] * 0.25 +
        signals['technical_vocabulary'] * 0.3 +
        signals['repeat_asks'] * 0.2
    )
    
    if total_score < 0.4:
        level = "beginner"
    elif total_score < 0.7:
        level = "intermediate"
    else:
        level = "advanced"
    
    return InferenceResult(level=level, confidence=total_score, signals=signals)


def detect_segment_broken(profile: UserProfile, history: UserHistory, 
                          has_transcript_evidence: bool) -> tuple[bool, str]:
    """
    Phát hiện segment hỏng.
    Returns: (is_broken, reason)
    """
    # Nhóm A: grade_missing = True VÀ lịch sử rỗng
    if profile.grade_missing and len(history.questions) == 0:
        return (True, "grade_missing + no_history")
    
    # Nhóm B: Câu hỏi ngoài transcript VÀ không có lịch sử
    if not has_transcript_evidence and len(history.questions) == 0:
        return (True, "no_evidence + no_history")
    
    return (False, "")


def answer_with_personalization_mock(
    user_id: str, 
    highlighted_text: str, 
    has_transcript_evidence: bool = True
) -> dict:
    """
    Mock pipeline — CHƯA có AI thật.
    Chỉ test được flow, chưa test được output.
    """
    # 1. Get user data
    profile = mock_get_user_profile(user_id)
    history = mock_get_user_history(user_id)
    
    # 2. Detect segment broken
    is_broken, reason = detect_segment_broken(profile, history, has_transcript_evidence)
    
    if is_broken:
        return {
            "level": None,
            "answer": None,
            "segment": "broken",
            "message": "Mình nhận thấy bạn chưa có điểm trong hệ thống và mình không có lịch sử tương tác. Mình không thể suy ra mức hiểu của bạn. Bạn nên hỏi giảng viên trực tiếp nhé.",
            "options": ["Chuyển câu hỏi cho giảng viên", "Trả lời mặc định"]
        }
    
    # 3. Infer understanding level
    inference = infer_understanding_level(history)
    
    # 4. Mock generation (hardcode response theo mức)
    level_descriptions = {
        "beginner": "mức mới bắt đầu",
        "intermediate": "mức trung bình", 
        "advanced": "mức nâng cao"
    }
    
    return {
        "level": inference.level,
        "level_description": level_descriptions[inference.level],
        "confidence": inference.confidence,
        "answer": f"[MOCK] Trả lời cho {inference.level} với đoạn: '{highlighted_text[:30]}...'",
        "segment": "normal",
        "message": None,
        "signals": inference.signals
    }


# === TEST CP2 ===
if __name__ == "__main__":
    test_users = [
        # User 1: Beginner (grade_missing + no history)
        {"user_id": "U001", "grade_missing": True, "history_empty": True},
        # User 2: Beginner (ít tương tác, câu trả ngắn)
        {"user_id": "U002", "grade_missing": False, "history_empty": False, 
         "questions": ["attention là gì?"], "answers": ["ok"]},
        # User 3: Intermediate (có tương tác, dùng thuật ngữ)
        {"user_id": "U003", "grade_missing": False, "history_empty": False,
         "questions": ["attention là gì?", "backprop hoạt động kiểu gì?"],
         "answers": ["mình hiểu rồi", "chain rule dùng để tính gradient"]},
    ]
    
    print("=== CP2 Mock Personalization Test ===\n")
    for user in test_users:
        result = answer_with_personalization_mock(
            user["user_id"], 
            "attention mechanism",
            has_transcript_evidence=True
        )
        print(f"User: {user['user_id']}")
        print(f"  Level: {result.get('level') or 'N/A'}")
        print(f"  Segment: {result['segment']}")
        print(f"  Answer: {result['answer'] or result['message']}")
        print()
```

### Test với 3 user giả

| User | Profile | Level dự kiến | Output |
|---|---|---|---|
| U001 | grade_missing=True, no history | broken segment | Message segment hỏng + options |
| U002 | grade_missing=False, ít tương tác | beginner | Mock answer beginner |
| U003 | Có tương tác, dùng thuật ngữ | intermediate | Mock answer intermediate |

### Checklist CP2 cho HV2

- [ ] Tạo thư mục `codebase/mock_data/` với profile và history giả
- [ ] `prompt_tutor_v1.py` có mock inference chạy được
- [ ] Test với 3 user giả — level + segment detection trả về đúng
- [ ] Tạo `.env.example` với nội dung `GEMINI_API_KEY=your_key_here`
- [ ] `.gitignore` đã có `.env`, `*.csv`, `node_modules/`

---

## 5. Công việc CP3 (Deadline: 16:00, 18/9/2026) — QUAN TRỌNG

### Yêu cầu bắt buộc
✅ **Phải có ≥1 lời gọi AI thật** ở quyết định trung tâm  
✅ **Log/trace giữ trong repo** (`eval/logs/cp3-run-1.jsonl`)

### Setup Gemini API

**Lưu ý bảo mật:**
- API key qua biến môi trường, **KHÔNG commit .env**
- Chỉ dùng data giả hoặc data trong pack (free tier có thể dùng data để train)

#### Cách setup an toàn

```bash
# Terminal — TẠO file .env (KHÔNG commit)
# Bước 1: Tạo file .env từ template
Copy codebase/.env.example thành codebase/.env
# Bước 2: Mở .env, thay your_key_here bằng key thật

# Bước 3: Export biến môi trường (chạy MỖI lần mở terminal mới)
# Windows PowerShell:
$env:GEMINI_API_KEY="AIza..."

# Bước 4: Verify đã set đúng
echo $env:GEMINI_API_KEY  # PowerShell
```

### Code pipeline inference + generation thật

```python
# codebase/prompt_tutor_v1.py

import os
import json
import time
from dataclasses import dataclass, asdict
from typing import Optional
from datetime import datetime

# === GEMINI SETUP ===
import google.generativeai as genai

def setup_gemini():
    """Setup Gemini với API key từ biến môi trường."""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY chưa được set. "
            "Chạy: $env:GEMINI_API_KEY='your_key' (PowerShell)"
        )
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.0-flash')

# Khởi tạo model (lazy load)
_model = None

def get_model():
    global _model
    if _model is None:
        _model = setup_gemini()
    return _model


# === DATA STRUCTURES ===
@dataclass
class UnderstandingLevel:
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


@dataclass
class AnswerResult:
    answer: Optional[str]
    level: Optional[str]
    level_description: Optional[str]
    confidence: Optional[float]
    segment: str  # "normal" / "broken"
    message: Optional[str]
    options: Optional[list]
    latency_ms: Optional[float]
    signals: dict = None


# === UNDERSTANDING INFERENCE ===
def infer_understanding_level(history: UserHistory) -> InferenceResult:
    """
    Suy ra mức hiểu từ 4 tín hiệu.
    """
    signals = {}
    
    # Tín hiệu 1: Số câu hỏi
    question_count = len(history.questions)
    signals['question_count'] = 0.2 if question_count <= 2 else (0.5 if question_count <= 5 else 0.8)
    
    # Tín hiệu 2: Độ dài câu trả lời
    if history.answers:
        avg_len = sum(len(a) for a in history.answers) / len(history.answers)
        signals['answer_length'] = 0.2 if avg_len < 50 else (0.5 if avg_len < 150 else 0.8)
    else:
        signals['answer_length'] = 0.3
    
    # Tín hiệu 3: Từ vựng chuyên ngành
    tech_terms = ['chain rule', 'gradient descent', 'backprop', 'softmax', 'embedding']
    has_tech = any(term in ' '.join(history.answers).lower() for term in tech_terms)
    signals['technical_vocabulary'] = 0.8 if has_tech else 0.3
    
    # Tín hiệu 4: Số lần hỏi lại
    total_asks = sum(history.ask_count.values())
    signals['repeat_asks'] = 0.2 if total_asks > 3 else (0.5 if total_asks > 1 else 0.8)
    
    # Tổng hợp
    total_score = (
        signals['question_count'] * 0.25 +
        signals['answer_length'] * 0.25 +
        signals['technical_vocabulary'] * 0.3 +
        signals['repeat_asks'] * 0.2
    )
    
    if total_score < 0.4:
        level = "beginner"
    elif total_score < 0.7:
        level = "intermediate"
    else:
        level = "advanced"
    
    return InferenceResult(level=level, confidence=total_score, signals=signals)


# === SEGMENT DETECTION ===
def detect_segment_broken(profile: UserProfile, history: UserHistory, 
                          has_evidence: bool) -> tuple[bool, str]:
    """Phát hiện segment hỏng."""
    # Nhóm A
    if profile.grade_missing and len(history.questions) == 0:
        return (True, "grade_missing + no_history")
    # Nhóm B
    if not has_evidence and len(history.questions) == 0:
        return (True, "no_evidence + no_history")
    return (False, "")


# === CORE PIPELINE ===
def answer_with_personalization(
    user_id: str,
    highlighted_text: str,
    has_transcript_evidence: bool = True
) -> AnswerResult:
    """
    Pipeline chính: segment check → understanding inference → generation.
    """
    start_time = time.time()
    
    # 1. Get user data
    profile = mock_get_user_profile(user_id)
    history = mock_get_user_history(user_id)
    
    # 2. Check segment broken
    is_broken, reason = detect_segment_broken(profile, history, has_transcript_evidence)
    
    if is_broken:
        latency_ms = (time.time() - start_time) * 1000
        return AnswerResult(
            answer=None,
            level=None,
            level_description=None,
            confidence=None,
            segment="broken",
            message="Mình nhận thấy bạn chưa có điểm trong hệ thống và mình không có lịch sử tương tác. Mình không thể suy ra mức hiểu của bạn một cách chính xác. Để trả lời đúng cho bạn, mình đề xuất bạn hỏi giảng viên trực tiếp nhé.",
            options=["Chuyển câu hỏi cho giảng viên", "Trả lời mặc định (không cá nhân hoá)"],
            latency_ms=latency_ms
        )
    
    # 3. Infer understanding level
    inference = infer_understanding_level(history)
    
    # 4. Generate answer with Gemini
    model = get_model()
    
    level_prompts = {
        "beginner": "bạn đang ở mức mới bắt đầu. Hãy giải thích từ gốc, dùng ví dụ đời thường, tránh thuật ngữ phức tạp.",
        "intermediate": "bạn đang ở mức trung bình. Giải thích vừa đủ, có thể dùng thuật ngữ nhưng kèm giải thích.",
        "advanced": "bạn đang ở mức nâng cao. Có thể giải thích chuyên sâu, dùng thuật ngữ đầy đủ, kèm công thức nếu phù hợp."
    }
    
    prompt = f"""Bạn là tutor VLearn. Học viên đang hỏi về đoạn slide:

Đoạn slide được chọn:
"{highlighted_text}"

Mức hiểu của học viên (đã suy ra từ lịch sử tương tác): {level_prompts[inference.level]}

Yêu cầu:
- Trả lời PHÙ HỢP với mức hiểu trên
- Nếu không chắc chắn → nói rõ giới hạn
- **KHÔNG GIẢ VỜ** biết mức hiểu khi không đủ tín hiệu
- Giọng thân thiện, phù hợp học viên

Format output:
[Câu trả lời phù hợp với mức {inference.level}]
[Badge: Mức hiểu của bạn: {'🟢 Beginner' if inference.level == 'beginner' else ('🟡 Intermediate' if inference.level == 'intermediate' else '🔴 Advanced')}]"""

    try:
        response = model.generate_content(prompt)
        answer = response.text
    except Exception as e:
        latency_ms = (time.time() - start_time) * 1000
        return AnswerResult(
            answer=None,
            level=None,
            level_description=None,
            confidence=None,
            segment="error",
            message=f"Lỗi khi gọi Gemini: {str(e)}",
            options=None,
            latency_ms=latency_ms
        )
    
    latency_ms = (time.time() - start_time) * 1000
    
    level_descriptions = {
        "beginner": "mức mới bắt đầu",
        "intermediate": "mức trung bình",
        "advanced": "mức nâng cao"
    }
    
    return AnswerResult(
        answer=answer,
        level=inference.level,
        level_description=level_descriptions[inference.level],
        confidence=inference.confidence,
        segment="normal",
        message=None,
        options=None,
        latency_ms=latency_ms,
        signals=inference.signals
    )


# === LOGGING ===
def log_call(user_id: str, highlighted_text: str, result: AnswerResult, 
             run_name: str = "cp3-run-1"):
    """Log mỗi call vào file JSONL cho eval."""
    log_dir = Path("eval/logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    
    log_file = log_dir / f"{run_name}.jsonl"
    
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "user_id": user_id,
        "input": highlighted_text,
        "result": asdict(result)
    }
    
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
    
    return log_file


# === TEST CP3 ===
if __name__ == "__main__":
    from pathlib import Path
    
    test_cases = [
        # Case 1: Segment hỏng
        {"user_id": "U_BROKEN", "text": "attention mechanism là gì?", "evidence": True},
        # Case 2: Beginner
        {"user_id": "U_BEGINNER", "text": "neural network là gì?", "evidence": True},
        # Case 3: Intermediate
        {"user_id": "U_INTER", "text": "gradient descent hoạt động kiểu gì?", "evidence": True},
    ]
    
    print("=== CP3 Real Gemini Test ===\n")
    
    for case in test_cases:
        print(f"User: {case['user_id']}")
        print(f"Query: {case['text']}")
        result = answer_with_personalization(case["user_id"], case["text"], case["evidence"])
        
        print(f"  Latency: {result.latency_ms:.0f}ms")
        print(f"  Level: {result.level or 'N/A'}")
        print(f"  Segment: {result.segment}")
        
        if result.answer:
            print(f"  Answer preview: {result.answer[:100]}...")
        else:
            print(f"  Message: {result.message[:100]}...")
        
        # Log
        log_call(case["user_id"], case["text"], result)
        print()
    
    print(f"Log saved to: eval/logs/cp3-run-1.jsonl")
```

### Video 30 giây cần quay

1. Mở terminal → chạy script test
2. Show input (user beginner + đoạn bôi đen)
3. Show output (câu trả lời + mức hiểu 🟢 + confidence)
4. Show log file được tạo trong `eval/logs/`

### Checklist CP3 cho HV2

- [ ] Setup Gemini API key qua biến môi trường
- [ ] Code có `import google.generativeai` và `genai.configure()`
- [ ] ≥1 lời gọi `model.generate_content()` thật trong pipeline
- [ ] Log mỗi call: input, level, output, latency → `eval/logs/cp3-run-1.jsonl`
- [ ] Quay video 30 giây demo AI call thật
- [ ] `.env` không commit vào repo (đã có trong `.gitignore`)

---

## 6. Công việc CP4 (Deadline: 21:00, 18/9/2026) — CHỐT QUALITY BAR

### Mục tiêu
Xây golden set ≥20 case → chạy → đối chiếu quality bar → **không sửa bar sau CP4**.

### Golden set structure (PIVOT)

```csv
# eval/golden-set.csv
case_id,input,user_profile,user_history,expected_level,expected_segment,expected_behavior,layer,source
G01,"Factory Method là gì?","grade_missing=False","3 câu hỏi, có thuật ngữ","intermediate","normal","Trả lời intermediate",①,mock
G02,"Attention mechanism là gì?","grade_missing=False","1 câu hỏi, câu trả ngắn","beginner","normal","Trả lời beginner",①,mock
...
```

### Golden set distribution (≥20 case)

| Loại | Số lượng | Mô tả |
|---|---|---|
| **Cá nhân hoá - Beginner đúng** | 4 case | Suy ra đúng beginner |
| **Cá nhân hoá - Intermediate đúng** | 4 case | Suy ra đúng intermediate |
| **Cá nhân hoá - Advanced đúng** | 4 case | Suy ra đúng advanced |
| **Cá nhân hoá - Suy luận sai** | 4 case | Suy ra sai → phải điều chỉnh |
| **Segment hỏng - Grade missing** | 3 case | grade_missing=True → refuse + warning |
| **Segment hỏng - No evidence** | 3 case | Không có căn cứ + không lịch sử → refuse |
| **Từ chatlog thật** | 2 case | HV1 cung cấp mã T0XXXX |

### Quality bar (PIVOT)

```
QUALITY BAR: ≥85% cá nhân hoá đúng + 100% segment hỏng được phát hiện

Chiều chất lượng đo:
1. Personalization Accuracy: Mức hiểu suy ra có khớp với thực tế không?
2. Segment Detection: Segment hỏng có được phát hiện 100% không?
3. Answer Quality: Câu trả lời có phù hợp với mức suy ra không?
```

### Results template

```markdown
# eval/results-cp3.md

# Kết quả Golden Set — CP3 Run 1
**Ngày:** 18/9/2026
**Quality bar:** ≥85% personalization + 100% broken detection

## Tổng quan

| Metric | Kết quả | Đạt bar? |
|---|---|---|
| Tổng case | 20 | — |
| Personalization đúng | X | — |
| % Personalization | X% | ❌ / ✅ |
| Segment hỏng phát hiện | X/X | — |
| % Segment hỏng | 100% / X% | ❌ / ✅ |

## Chi tiết từng case

| Case ID | Input | Expected Level | Actual Level | Đạt? | Ghi chú |
|---|---|---|---|---|---|
| G01 | ... | beginner | ... | ✅/❌ | |

## Phân tích failure

### Failure nghiêm trọng nhất
[Phân tích nguyên nhân case không qua]

### Cần cải thiện
1. [Vấn đề 1]
2. [Vấn đề 2]

## Kết luận
[Đạt/Không đạt quality bar + lý do]
```

### Checklist CP4 cho HV2

- [ ] `eval/golden-set.csv` có ≥20 case (chia 2 nhóm: cá nhân hoá + segment hỏng)
- [ ] Phân bố: 12 cá nhân hoá + 8 segment hỏng
- [ ] Chạy golden set → bảng % trong `eval/results-cp3.md`
- [ ] **Quality bar ≥85% personalization + 100% broken detection — KHÔNG sửa sau CP4**

---

## 7. 4 Lớp chỗ khó (PIVOT)

### Lớp ① — Cá nhân hoá sai (AI suy luận sai mức)

**Vấn đề:** AI suy luận sai mức hiểu từ tín hiệu không đủ → trả lời quá dễ hoặc quá khó.

**Giải pháp bắt buộc:**
- Prompt có câu: **"Nếu không chắc chắn về mức hiểu → hỏi lại user"**
- Heuristic: threshold confidence < 0.5 → hỏi lại thay vì đoán
- UI: Cho user chỉnh mức hiểu bằng tay

### Lớp ② — Segment hỏng không phát hiện

**Vấn đề:** AI cố trả lời khi user thuộc segment thiếu data → trả sai hoàn toàn.

**Giải pháp:**
- **BẮT BUỘC** kiểm tra `grade_missing` TRƯỚC khi sinh câu trả lời
- Nếu segment hỏng → KHÔNG trả lời, hiển thị warning + options

### Lớp ③ — Tín hiệu mơ hồ (không đủ để suy ra)

**Vấn đề:** User mới hoàn toàn, không có lịch sử → không đủ tín hiệu để suy ra.

**Giải pháp:**
- Nếu confidence < 0.4 → **"Mình chưa biết rõ mức độ của bạn. Bạn là người mới hay đã học rồi?"**
- Cho user chọn: Beginner / Intermediate / Advanced

### Lớp ④ — Mức hiểu thay đổi nhanh

**Vấn đề:** User có kiến thức nền nhưng đang ôn tập từ đầu → level không ổn định.

**Giải pháp:**
- **LUÔN** cho user chỉnh mức hiểu bằng tay
- Sau mỗi câu trả lời → "Mức hiểu của bạn có đúng không?"

---

## 8. ≥10 Kịch bản rủi ro (PIVOT)

| # | Tình huống cụ thể | Lớp | Hành vi mong muốn | Nguyên tắc |
|---|---|---|---|---|
| K1 | User beginner hỏi lần đầu, không có lịch sử | ③ | Hỏi lại "Bạn là người mới hay đã học rồi?" | G2 |
| K2 | User có grade_missing=True, hỏi câu hỏi cụ thể | ② | Phát hiện segment hỏng → refuse + warning | G10 |
| K3 | User beginner nhưng dùng 1 thuật ngữ → AI suy ra intermediate | ① | User phản hồi → AI hỏi lại xác nhận | G9 |
| K4 | User expert nhưng hỏi "lại từ đầu" (đang ôn) | ④ | User chỉnh mức → AI điều chỉnh | G1 |
| K5 | User intermediate, confidence = 0.55 (ngưỡng) | ③ | Hỏi lại để xác nhận | G10 |
| K6 | User hỏi ngoài transcript, không có lịch sử | ② | Phát hiện segment hỏng → refuse | G10 |
| K7 | User beginner hỏi câu dài → tín hiệu mâu thuẫn | ③ | Confidence thấp → hỏi lại | G9 |
| K8 | User advanced nhưng hỏi "cơ bản" (lỗi đánh máy) | ④ | AI nhận ra lỗi → hỏi lại "Bạn muốn hỏi gì?" | G2 |
| K9 | User grade_missing=True nhưng có lịch sử | ③ | Vẫn infer được, không phải segment hỏng | (handle edge) |
| K10 | User hỏi câu tương tự 4 lần (hỏi lại) | ③ | Suy ra beginner, trả lời chi tiết hơn | G1 |
| K11 | User trả lời bằng emoji ("👍 ok mình hiểu rồi") | ③ | Tín hiệu không rõ → hỏi lại | G9 |
| K12 | User hỏi bằng tiếng Anh, lịch sử tiếng Việt | ③ | Handle multilingual, vẫn infer được | (handle) |
| K13 | User mới, grade_missing=False → infer được | ③ | Infer beginner, bình thường | (happy path) |
| K14 | User advanced, có đầy đủ tín hiệu | ① | Infer advanced, trả lời sâu | (happy path) |
| K15 | User phản đối mức hiểu | ④ | "Xin lỗi, mình sẽ điều chỉnh" → user chọn lại | G9 |

---

## 9. ≥4 Nguyên tắc HAX/PAIR với vị trí áp dụng cụ thể

### G2 — Làm rõ nó làm tốt đến đâu

**Vị trí áp dụng:** Badge mức hiểu — **LUÔN hiển thị mức suy ra**

```python
# Trong answer result:
level_badge = {
    "beginner": "🟢 Mức mới bắt đầu",
    "intermediate": "🟡 Mức trung bình",
    "advanced": "🔴 Mức nâng cao"
}
```

### G10 — Thu hẹp phạm vi khi nghi ngờ (BẮT BUỘC)

**Vị trí áp dụng:** Khi `confidence < 0.4` HOẶC segment hỏng — **KHÔNG đoán, hỏi lại hoặc từ chối**

```python
# Trong pipeline:
if confidence < 0.4:
    return {
        "message": "Mình chưa biết rõ mức độ của bạn. Bạn là người mới hay đã học về AI rồi?",
        "options": ["Người mới", "Đã học rồi", "Chuyên gia"]
    }
```

### G11 — Giải thích vì sao

**Vị trí áp dụng:** Mỗi câu trả lời — **kèm badge mức hiểu để user tự kiểm**

```python
# Trong response:
response_text = f"""
{answer}

🟢 Mức hiểu của bạn: {level_badge[inferred_level]}
(Cập nhật dựa trên {len(history.questions)} câu hỏi đã hỏi)
"""
```

### G9 — Sửa dễ dàng

**Vị trí áp dụng:** Sau mỗi câu trả lời — **nút "Mức hiểu không đúng?" + "Chuyển giảng viên"**

```python
# Trong response format:
RESPONSE_TEMPLATE = """
{answer}

🟢 Mức hiểu của bạn: {level_badge}

---
[👍 Đúng] [✏️ Chỉnh mức hiểu] [📩 Chuyển giảng viên]
"""
```

---

## 10. Mức Automation theo Cost-of-Error

### Chọn: **AUGMENT** — AI gợi ý, học viên tự kiểm

**Lý do theo cost-of-error:**

| Sai thì | Hậu quả | Cost |
|---|---|---|
| Cá nhân hoá sai | Học viên học sai trình độ (quá dễ → chán / quá khó → nản) | **CAO** |
| Trả lời segment hỏng | Tutor trả sai hoàn toàn → trust collapse | **RẤT CAO** |
| User mất niềm tin vào AI | Không dùng nữa | **CAO** |

**Vì sao không Automate:**
- Học viên cần **tự kiểm** mức hiểu được suy ra
- Sai trình độ trong giáo dục = hậu quả nghiêm trọng
- User cần **quyền chỉnh** mức hiểu bất cứ lúc nào

**Vì sao không Human-only:**
- Tutor có thể phục vụ nhiều học viên cùng lúc với inference tự động
- Giảm tải cho giảng viên (chỉ xử lý segment hỏng)

**Kết luận:** Augment = AI suy ra + user kiểm/chỉnh + segment hỏng → refuse

---

## 11. Cảnh báo & lỗi thường gặp

### 🔴 Nghiêm trọng — Disqualify

| Lỗi | Hậu quả | Cách phòng |
|---|---|---|
| **API key commit vào repo** | Revoke key + bảo mật | `.gitignore` có `.env`; KHÔNG bao giờ commit key |
| **Data thật đưa vào Gemini** | Có thể bị dùng train | Chỉ data giả hoặc data trong pack |

### ⚠️ Ảnh hưởng điểm R3/R4

| Lỗi | Hậu quả | Cách phòng |
|---|---|---|
| **Confidence threshold quá thấp (0.2)** | AI trả lời khi không chắc chắn | Bắt đầu 0.4, chỉnh sau golden set |
| **Confidence threshold quá cao (0.8)** | AI hỏi lại quá nhiều | Giảm nếu coverage < 70% |
| **Không kiểm tra grade_missing trước** | Trả lời segment hỏng | LUÔN check grade_missing ĐẦU TIÊN |
| **Prompt không kèm mức hiểu** | AI không cá nhân hoá | Prompt phải có level prompt cụ thể |

### 💡 Best practices

| Thực hành | Lý do |
|---|---|
| Log mỗi call | Debug khi fail, đo latency |
| Hardcode threshold trong config | Đổi 1 chỗ = đổi tất cả |
| Test với edge cases trước | Tránh fail khi demo |
| Backup API key | Mất key = không chạy được |

---

## 12. Deliverables HV2 trong repo

```
K4-3B-E402-CiteTutor/
├── codebase/
│   ├── prompt_tutor_v1.py          # Pipeline inference + generation
│   ├── .env.example                  # GEMINI_API_KEY=your_key_here
│   └── .gitignore                    # .env, *.csv, node_modules/
│
├── eval/
│   ├── golden-set.csv               # ≥20 case đầu vào + expected (PIVOT: 2 nhóm)
│   ├── results-cp3.md                # Bảng % đạt/không đạt + phân tích
│   └── logs/
│       └── cp3-run-1.jsonl          # Log mỗi call (input, level, output, latency)
│
├── spec.md                           # §4 (lát cắt + automation + HAX/PAIR)
│                                    # §5 (4 lớp chỗ khó)
│                                    # §6 (≥10 kịch bản)
│                                    # §7 (golden set + quality bar ≥85% + 100%)
│
└── HV2-prompt-retrieval.md          # File này
```

### Checklist deliverables

- [ ] `codebase/prompt_tutor_v1.py` — pipeline inference + generation
- [ ] `codebase/.env.example` — `GEMINI_API_KEY=your_key_here`
- [ ] `codebase/.gitignore` — `.env`, `*.csv`, `node_modules/`
- [ ] `eval/golden-set.csv` — ≥20 case đầu vào + expected (PIVOT: cá nhân hoá + segment hỏng)
- [ ] `eval/results-cp3.md` — bảng % đạt/không đạt + phân tích
- [ ] `eval/logs/cp3-run-1.jsonl` — log mỗi call
- [ ] `spec.md` §4, §5, §6, §7 hoàn chỉnh

---

## 13. Tài nguyên tham chiếu

### Trong repo

| File | Nội dung | Dùng cho |
|---|---|---|
| `02-guide.md` §2.3 | Cost-of-error, automation | §10 Mức automation |
| `02-guide.md` §2.4 | HAX/PAIR 18 nguyên tắc | §9 Nguyên tắc HAX/PAIR |
| `02-guide.md` §2.5 | 4 lớp chỗ khó | §7 4 lớp chỗ khó |
| `02-guide.md` §2.6 | Golden set + quality bar | §6 Golden set |
| `04-rubric.md` R3 | 11 điểm chỗ khó | Checkpoint R3 |
| `04-rubric.md` R4 | 15 điểm kiểm thử | Checkpoint R4 |
| `data/vlearn-pack/chatlog/DATA_DICTIONARY.md` | Giải thích các trường | Hiểu grade_missing, understanding_level |
| `further-reading/hax-guidelines.md` | 18 nguyên tắc HAX | Tra cứu G1-G18 |
| `further-reading/pair-guidebook-digest.md` | PAIR 6 chương | Tra cứu PAIR |

### Bên ngoài

| Nguồn | Link | Dùng cho |
|---|---|---|
| HAX Toolkit | microsoft.com/haxtoolkit | Nguyên tắc HAX |
| PAIR Guidebook | pair.withgoogle.com/guidebook | Nguyên tắc PAIR |
| HAX Playbook | github.com/microsoft/HAXPlaybook | Sinh kịch bản rủi ro |
| Gemini API Docs | ai.google.dev/docs | Setup Gemini |

---

## 14. Tiêu chí xuất sắc — Checklist tự đánh giá

- [x] Code mẫu sẵn có thể copy chạy (Gemini API + inference) ✓
- [x] Có ≥10 kịch bản rủi ro (K1-K15) ✓
- [x] Có 4 nguyên tắc HAX/PAIR với vị trí áp dụng cụ thể ✓
- [x] Mức automation đúng cost-of-error (Augment, không Automate) ✓
- [x] Có lệnh setup API key an toàn (biến môi trường) ✓
- [x] Quality bar bằng số (≥85% personalization + 100% broken detection) ✓

---

## PIVOT NOTES

**Điều thay đổi so với phiên bản cũ:**

| Nội dung | Cũ | Mới |
|---|---|---|
| Focus | Citation kèm mã trang | Suy ra mức hiểu + phát hiện segment hỏng |
| Step 1 | Retrieval (tìm căn cứ) | Understanding Inference (4 tín hiệu) |
| Step 2 | Citation Check | Segment Detection (2 nhóm điều kiện) |
| Step 3 | Generation kèm citation | Generation theo mức hiểu |
| Golden set | 8 happy + 4 edge + 4 negative | 12 cá nhân hoá + 8 segment hỏng |
| Quality bar | ≥85% citation | ≥85% personalization + 100% broken detection |
| Kịch bản rủi ro | 10 cái về citation | 10+ cái về personalization + segment |
| HAX/PAIR | G2, G9, G10, G11 | G2, G9, G10, G11 (cùng 4 nguyên tắc, vị trí áp dụng mới) |

---

*HV2 Prompt/Retrieval Lead · K4-3B-E402-CiteTutor · Hackathon AI20k Batch 04*
