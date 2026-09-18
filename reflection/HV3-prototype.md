# HV3 — Frontend/Prototype Engineer
## Nhóm K4-3B-E402 · Repo: CiteTutor · Track A1c: Cá nhân hoá Tutor VLearn theo mức hiểu

---

## 1. Vai trò & trách nhiệm HV3

### Mục tiêu
Prototype chạy end-to-end theo **lát cắt A1c (PIVOT)**: học viên bôi đen đoạn transcript chưa hiểu → AI suy ra mức hiểu từ lịch sử tương tác → điều chỉnh độ sâu câu trả lời phù hợp → ĐỒNG THỜI phát hiện segment hỏng và cảnh báo. Demo được trong **5 phút** trên sân khấu.

### Trách nhiệm chính (PIVOT)
- Thiết kế và build prototype theo mức **Mock** (flow bấm được, data giả, AI thật ở lõi từ CP3 trở đi).
- Đảm bảo **4 đường đi trải nghiệm** đều bấm được và demo được: Happy · Low-Confidence · Failure · Correction.
- Tích hợp với HV2 backend (inference + generation thật).
- Quay video 30 giây (CP3) và video dự phòng 2 phút (CP5).
- Contribute phần UI flow vào `spec.md` §4.

### Tiêu chí rubric
- **R5 (Prototype — 8đ):**
    - [3đ] Chạy end-to-end theo lát cắt, không can thiệp tay giữa chừng.
    - [3đ] ≥1 lời gọi AI thật ở quyết định trung tâm (log/trace trong repo); phần mock ghi rõ.
    - [2đ] Mức prototype khai báo (Sketch/Mock/Working) khớp thực tế.

### Cam kết mức prototype (PIVOT)
| Phần | Mức |
|---|---|
| Slide text hiển thị | **Thật** (copy từ transcript pack) |
| Bôi đen | **Thật** |
| Understanding inference (HV2) | **Thật** |
| Generation (HV2) | **Thật** |
| Mức hiểu indicator (🟢/🟡/🔴) | **Thật** |
| Warning segment hỏng | **Mock** (chưa cần kết nối grade_missing) |
| Jump-to-page trong slide | **Mock** (chưa cần) |
| Lưu lịch sử chat | **Mock** (chưa cần) |
| Đăng nhập / auth | **Mock** (1 user giả) |

---

## 2. Bốn đường đi trải nghiệm (PIVOT)

### 2.1. Happy Path ✅ — Cá nhân hoá đúng mức

```
[Học viên bôi đen đoạn "attention mechanism" trong slide]
  → [Nhấn nút "Hỏi tutor"]
    → [Loading: "Tutor đang suy luận mức hiểu của bạn..."]
      → [AI suy ra: beginner (dựa trên lịch sử 2 câu hỏi)]
        → [Câu trả lời hiện ra kèm: "🟢 Mức hiểu của bạn: Beginner"]
          → [Học viên thấy câu trả lời phù hợp trình độ]
```

### 2.2. Low-Confidence Path ⚠️ — Suy luận sai → user phản hồi

```
[Học viên bôi đen đoạn "gradient descent"]
  → [Nhấn "Hỏi tutor"]
    → [AI suy ra: beginner]
      → [AI trả lời với giả định beginner]
        → [Học viên trả lời bằng thuật ngữ: "chain rule để tính gradient"]
          → [AI nhận ra: user có kiến thức nền]
            → [AI hỏi: "Mình nhận thấy bạn dùng thuật ngữ chính xác. Bạn muốn tăng độ khó không?"]
              → [User xác nhận → AI điều chỉnh: intermediate]
```

### 2.3. Failure Path ❌ — Segment hỏng → chuyển GV

```
[Học viên bôi đen đoạn "neural network architecture"]
  → [Nhấn "Hỏi tutor"]
    → [AI kiểm tra: grade_missing=True + lịch sử=rỗng]
      → [⚠️ PHÁT HIỆN SEGMENT HỎNG]
        → [Hiển thị: "Mình nhận thấy bạn chưa có điểm trong hệ thống..."]
          → [Cảnh báo: "Mình không thể suy ra mức hiểu của bạn"]
            → [Nút: "Chuyển giảng viên" + "Trả lời mặc định"]
```

### 2.4. Correction Path 🔄 — User chỉnh mức hiểu

```
[AI trả lời câu hỏi → Học viên thấy mức hiểu không đúng]
  → [Bấm "Chỉnh mức hiểu"]
    → [Hiển thị: "Bạn đang ở mức nào?" với 3 lựa chọn]
      → [User chọn: "Intermediate"]
        → [AI: "✅ Đã cập nhật: Intermediate. Mình sẽ trả lời ở mức sâu hơn nhé!"]
          → [Câu trả lời mới hiện ra với độ khó phù hợp]
```

---

## 3. Công việc CP1 — Deadline 19:30, 17/9/2026

### Nhiệm vụ chính: Vẽ wireframe 3 màn hình (PIVOT)

#### Màn 1: SlideView (Màn transcript)

```
┌─────────────────────────────────────────────────────────┐
│  ← Quay lại bài giảng                    Buổi 2 · Trang 6/15 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ## 3.2 Attention Mechanism                             │
│                                                         │
│  Attention mechanism là kỹ thuật cho phép model tập    │
│  trung vào các phần liên quan của input sequence thay  │
│  vì xử lý toàn bộ. [BÔI ĐEN ĐƯỢC]                   │
│                                                         │
│  Công thức:                                            │
│  Attention(Q, K, V) = softmax(QK^T / √d_k) V          │
│                                                         │
│  Trong đó Q (Query), K (Key), V (Value) được học từ │
│  dữ liệu. [BÔI ĐEN ĐƯỢC]                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  👆 Bôi đen đoạn bạn chưa hiểu, rồi nhấn "Hỏi tutor"│
└─────────────────────────────────────────────────────────┘
```

#### Màn 2: ChatBox (Màn chat với mức hiểu indicator) — PIVOT

```
┌─────────────────────────────────────────────────────────┐
│  💬 Tutor VLearn                    [🟢 Beginner ▼]   │  ← PIVOT: Badge mức hiểu
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 Bạn: attention mechanism là gì?                   │
│                                                         │
│  🤖 Tutor: Mình suy ra: bạn đang ở mức **mới bắt     │
│     đầu** (mình nhận thấy bạn hay hỏi những khái      │
│     niệm cơ bản).                                      │
│                                                         │
│     Mình giải thích chi tiết nhé:                      │
│     Attention mechanism giống như khi bạn đọc một      │
│     câu — bạn tập trung vào từ khóa để hiểu ý        │
│     chính, thay vì đọc từng chữ riêng lẻ.            │
│                                                         │
│  🟢 Mức hiểu của bạn: Beginner                         │
│     (Cập nhật dựa trên 3 câu hỏi đã hỏi)             │
│                                                         │
│  ─────────────────────────────────────────────         │
│  [👍 Đúng] [✏️ Chỉnh mức hiểu] [📩 Chuyển GV]       │  ← PIVOT: Nút chỉnh mức
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Bôi đen đoạn mới trong slide...] [Hỏi tutor]       │
└─────────────────────────────────────────────────────────┘
```

#### Màn 3: Segment Hỏng Warning (PIVOT) — MÀN MỚI

```
┌─────────────────────────────────────────────────────────┐
│  💬 Tutor VLearn                              [✕ Đóng]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 Bạn: neural network architecture là gì?           │
│                                                         │
│  🤖 Tutor:                                            │
│                                                         │
│  ⚠️ Mình nhận thấy:                                    │
│     • Bạn chưa có điểm trong hệ thống VLearn         │
│     • Mình không có lịch sử tương tác với bạn        │
│                                                         │
│  Mình không thể suy ra mức hiểu của bạn một cách      │
│  chính xác. Nếu mình trả lời với giả định sai,      │
│  bạn có thể nhận được câu trả lời quá dễ hoặc       │
│  quá khó.                                              │
│                                                         │
│  💡 Đề xuất: Bạn nên hỏi giảng viên trực tiếp.       │
│     Giảng viên sẽ biết bạn đang ở mức nào.           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🟠 Mức hiểu: Chưa xác định                     │   │  ← PIVOT: Warning badge
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Chuyển giảng viên]   [Trả lời mặc định]           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Deliverables CP1
- Wireframe 3 màn hình (vẽ tay hoặc Figma/Excalidraw)
- Upload ảnh wireframe vào repo: `codebase/wireframes/`

---

## 4. Công việc CP2 — Deadline 21:00, 17/9/2026

### Mục tiêu: "Bấm được" — Flow chính chạy hết được với data giả

### Stack đề xuất
- **Next.js 14 (App Router)** + Tailwind CSS + TypeScript
- Hoặc **Vite + React + Tailwind** (nhanh hơn, chạy trong 30 phút)

### Cài đặt nhanh (Vite + React)

```bash
npm create vite@latest cite-tutor -- --template react-ts
cd cite-tutor
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react
```

### Cấu trúc thư mục

```
codebase/
├── app/
│   ├── page.tsx              # Main page (SlideView + ChatBox)
│   └── layout.tsx            # Layout
├── components/
│   ├── SlideView.tsx        # Hiển thị slide text, bôi đen được
│   ├── ChatBox.tsx          # Q&A + mức hiểu indicator
│   ├── UnderstandingBadge.tsx # Badge 🟢/🟡/🔴 (PIVOT)
│   ├── SegmentWarning.tsx    # Warning khi segment hỏng (PIVOT)
│   ├── TutorChat.tsx         # Chat container
│   └── LevelSelector.tsx     # Modal chọn mức hiểu (PIVOT)
├── data/
│   ├── transcript-03-mock.json  # 200 từ đầu từ transcript thật
│   └── mock-responses.json     # Câu trả lời giả cho 4 path
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── .gitignore
└── README.md
```

### 4 Component chính (PIVOT)

#### Component 1: UnderstandingBadge.tsx — MÀN MỚI

```tsx
interface UnderstandingBadgeProps {
  level: 'beginner' | 'intermediate' | 'advanced' | 'unknown';
  confidence?: number;
  onEdit?: () => void;
}

export default function UnderstandingBadge({ 
  level, 
  confidence,
  onEdit 
}: UnderstandingBadgeProps) {
  const levelConfig = {
    beginner: { color: 'bg-green-100 text-green-800', emoji: '🟢', label: 'Beginner' },
    intermediate: { color: 'bg-yellow-100 text-yellow-800', emoji: '🟡', label: 'Intermediate' },
    advanced: { color: 'bg-red-100 text-red-800', emoji: '🔴', label: 'Advanced' },
    unknown: { color: 'bg-gray-100 text-gray-800', emoji: '🟠', label: 'Chưa xác định' },
  };

  const config = levelConfig[level];

  return (
    <div className="flex items-center gap-2">
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.emoji} Mức hiểu: {config.label}
      </span>
      {onEdit && (
        <button 
          onClick={onEdit}
          className="text-xs text-blue-600 hover:underline"
        >
          Chỉnh mức hiểu
        </button>
      )}
    </div>
  );
}
```

#### Component 2: SegmentWarning.tsx — MÀN MỚI

```tsx
interface SegmentWarningProps {
  reason: string;  // "grade_missing" | "no_evidence"
  onTransferGV: () => void;
  onDefaultAnswer: () => void;
}

export default function SegmentWarning({ 
  reason, 
  onTransferGV, 
  onDefaultAnswer 
}: SegmentWarningProps) {
  const getWarningMessage = () => {
    if (reason === 'grade_missing') {
      return 'Bạn chưa có điểm trong hệ thống VLearn';
    }
    if (reason === 'no_evidence') {
      return 'Mình không có lịch sử tương tác với bạn';
    }
    return 'Mình không thể xác định mức hiểu của bạn';
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h4 className="font-medium text-orange-800">
            Mình nhận thấy:
          </h4>
          <ul className="mt-2 text-sm text-orange-700 space-y-1">
            <li>• {getWarningMessage()}</li>
            <li>• Mình không thể suy ra mức hiểu của bạn một cách chính xác</li>
          </ul>
          
          <p className="mt-3 text-sm text-orange-800">
            💡 Nếu mình trả lời với giả định sai, bạn có thể nhận được câu trả lời quá dễ hoặc quá khó.
          </p>
          
          <p className="mt-2 text-sm font-medium text-orange-900">
            💡 Đề xuất: Bạn nên hỏi giảng viên trực tiếp.
          </p>

          <div className="mt-4 flex gap-2">
            <button 
              onClick={onTransferGV}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Chuyển giảng viên
            </button>
            <button 
              onClick={onDefaultAnswer}
              className="px-4 py-2 bg-white text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Trả lời mặc định
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### Component 3: LevelSelector.tsx — MÀN MỚI

```tsx
interface LevelSelectorProps {
  currentLevel: string;
  onSelect: (level: string) => void;
  onClose: () => void;
}

export default function LevelSelector({ 
  currentLevel, 
  onSelect, 
  onClose 
}: LevelSelectorProps) {
  const levels = [
    { id: 'beginner', emoji: '🟢', label: 'Mới bắt đầu', description: 'Cần giải thích từ gốc, dùng ví dụ đời thường' },
    { id: 'intermediate', emoji: '🟡', label: 'Trung bình', description: 'Hiểu cơ bản, cần giải thích vừa đủ' },
    { id: 'advanced', emoji: '🔴', label: 'Nâng cao', description: 'Có nền tảng, cần giải thích chuyên sâu' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold mb-4">
          Chọn mức hiểu của bạn
        </h3>
        
        <div className="space-y-3">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => onSelect(level.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                currentLevel === level.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{level.emoji}</span>
                <div>
                  <div className="font-medium">{level.label}</div>
                  <div className="text-sm text-gray-500">{level.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="mt-4 w-full py-2 text-gray-500 hover:text-gray-700"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
```

#### Component 4: ChatBox.tsx — UPDATE

```tsx
import { useState, useRef, useEffect } from 'react';
import UnderstandingBadge from './UnderstandingBadge';
import SegmentWarning from './SegmentWarning';
import LevelSelector from './LevelSelector';

interface Message {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'unknown';
  isSegmentBroken?: boolean;
  segmentReason?: string;
  isCorrection?: boolean;
}

interface ChatBoxProps {
  highlightedText: string;
  onSendMessage: (text: string) => void;
  messages: Message[];
  isLoading: boolean;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
}

export default function ChatBox({ 
  highlightedText, 
  onSendMessage, 
  messages, 
  isLoading,
  userLevel,
}: ChatBoxProps) {
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAskTutor = () => {
    if (highlightedText.trim()) {
      onSendMessage(highlightedText);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-xl shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <span className="font-semibold">Tutor VLearn</span>
        </div>
        <UnderstandingBadge 
          level={userLevel} 
          onEdit={() => setShowLevelSelector(true)}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Welcome message */}
        <div className="bg-white p-4 rounded-lg shadow-sm text-sm text-gray-600">
          👋 Xin chào! Mình là Tutor VLearn. Mình sẽ suy ra mức hiểu 
          của bạn từ lịch sử tương tác và điều chỉnh câu trả lời phù hợp.
          Nếu không xác định được mức hiểu, mình sẽ nói rõ cho bạn nhé.
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white shadow-sm'
              }`}
            >
              <div className="flex items-start gap-2">
                <span>{msg.role === 'user' ? '👤' : '🤖'}</span>
                <div className="flex-1">
                  <p className="text-sm">{msg.content}</p>
                  
                  {/* Level badge for tutor messages */}
                  {msg.role === 'tutor' && msg.level && !msg.isSegmentBroken && (
                    <div className="mt-3">
                      <UnderstandingBadge level={msg.level} />
                    </div>
                  )}

                  {/* Segment broken warning */}
                  {msg.isSegmentBroken && (
                    <div className="mt-3">
                      <SegmentWarning 
                        reason={msg.segmentReason || 'unknown'}
                        onTransferGV={() => {/* Handle */}}
                        onDefaultAnswer={() => {/* Handle */}}
                      />
                    </div>
                  )}

                  {/* Action buttons - G9 */}
                  {msg.role === 'tutor' && !msg.isSegmentBroken && (
                    <div className="mt-3 flex gap-2 text-xs">
                      <button className="text-green-600 hover:underline">👍 Đúng</button>
                      <button 
                        onClick={() => setShowLevelSelector(true)}
                        className="text-blue-600 hover:underline"
                      >
                        ✏️ Chỉnh mức hiểu
                      </button>
                      <button className="text-gray-500 hover:underline">📩 Chuyển GV</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin">⟳</div>
                <span className="text-sm">Tutor đang suy luận mức hiểu của bạn...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Level Selector Modal */}
      {showLevelSelector && (
        <LevelSelector
          currentLevel={userLevel}
          onSelect={(level) => {
            // Handle level change
            setShowLevelSelector(false);
          }}
          onClose={() => setShowLevelSelector(false)}
        />
      )}
    </div>
  );
}
```

### Mock data: mock-responses.json (PIVOT)

```json
{
  "beginner": {
    "level": "beginner",
    "content": "Mình suy ra: bạn đang ở mức **mới bắt đầu**. Mình giải thích chi tiết nhé:\n\n**Attention mechanism** giống như khi bạn đọc một câu — bạn tập trung vào từ khóa để hiểu ý chính, thay vì đọc từng chữ riêng lẻ. Model cũng làm vậy!",
    "example": "Như khi bạn đọc tin nhắn 'Gặp nhau lúc 7h ở quán cafe' — bạn không đọc từng chữ mà tập trung vào '7h' và 'quán cafe'."
  },
  "intermediate": {
    "level": "intermediate", 
    "content": "Mình suy ra: bạn đang ở mức **trung bình**. Mình giải thích vừa đủ:\n\n**Attention mechanism** là kỹ thuật cho phép model tập trung vào các phần liên quan của input. Công thức: Attention(Q,K,V) = softmax(QK^T/√d)V. Trong đó Q (Query), K (Key), V (Value) được học từ dữ liệu.",
    "example": "Giống như khi bạn search google, hệ thống sẽ tập trung vào từ khóa chính để trả kết quả phù hợp nhất."
  },
  "advanced": {
    "level": "advanced",
    "content": "Mình suy ra: bạn đang ở mức **nâng cao**. Mình giải thích chuyên sâu:\n\n**Attention mechanism** là core component của Transformer architecture. Cho phép model tính dependencies giữa các positions dù ở xa nhau trong sequence. Multi-head attention cho phép model học different aspects của relationships.",
    "example": "Self-attention: attention(Q,K,V) = softmax(QK^T/√d_k)V. Mỗi head học một subspace khác nhau của representation."
  },
  "segment_broken": {
    "segment": "broken",
    "reason": "grade_missing",
    "content": "Mình nhận thấy bạn chưa có điểm trong hệ thống VLearn và mình không có lịch sử tương tác với bạn. Mình không thể suy ra mức hiểu của bạn một cách chính xác.",
    "warning": "Nếu mình trả lời với giả định sai, bạn có thể nhận được câu trả lời quá dễ hoặc quá khó.",
    "suggestion": "💡 Đề xuất: Bạn nên hỏi giảng viên trực tiếp."
  }
}
```

### Flow end-to-end (CP2)

1. Mở app → thấy slide với nội dung transcript
2. Bôi đen đoạn text → text hiện trong hint bar
3. Nhấn nút "Hỏi tutor" → mock response hiện ra (1.5s delay để giả loading)
4. Mức hiểu badge 🟢/🟡/🔴 hiển thị với câu trả lời
5. Test 4 path bằng data test khác nhau:
   - Happy: user có lịch sử → cá nhân hoá đúng
   - Low-Conf: user phản hồi → chỉnh mức
   - Failure: user segment hỏng → warning
   - Correction: bấm "Chỉnh mức" → level selector

---

## 5. Công việc CP3 — Deadline 16:00, 18/9/2026

### Mục tiêu: "AI thật" — ≥1 lời gọi AI thật + video 30 giây

### Tích hợp HV2 Backend

#### API Endpoint (HV2 cung cấp)

```typescript
// POST /api/tutor
// Request
{
  "user_id": string,
  "highlighted_text": string,      // Đoạn text học viên bôi đen
  "transcript_id": string,        // "03"
  "current_page": number          // Trang hiện tại
}

// Response
{
  "answer": string,               // Câu trả lời của AI
  "level": "beginner" | "intermediate" | "advanced",
  "confidence": number,            // 0.0 - 1.0
  "segment": "normal" | "broken",
  "segment_reason"?: string,      // "grade_missing" | "no_evidence"
  "message"?: string,           // Thông báo khi segment hỏng
  "options"?: string[],         // ["Chuyển giảng viên", "Trả lời mặc định"]
  "type": "happy" | "low_confidence" | "segment_broken" | "correction"
}
```

### 4 Trường hợp hiển thị theo response (PIVOT)

| Response | UI hiển thị |
|---|---|
| Có `level` + `segment=normal` | Render UnderstandingBadge + câu trả lời cá nhân hoá |
| Có `segment=broken` | Render SegmentWarning + message cảnh báo |
| Loading | Spinner + "Tutor đang suy luận mức hiểu..." |
| Error | "Có lỗi, bạn thử lại nhé" |

### Video 30 giây CP3 — Script (PIVOT)

```
⏱️ THỜI GIAN     NỘI DUNG MÀN HÌNH
──────────────────────────────────────────────────────────────
0–5s   · Zoom vào slide · Bôi đen đoạn "attention mechanism"
        · Nói: "Đoạn này mình chưa hiểu rõ lắm"

5–10s  · Nhấn nút "Hỏi tutor"
        · Màn hình: Loading spinner "Tutor đang suy luận mức hiểu..."

10–20s · Loading animation (fake 10s để drama)
        · Nói: "AI suy ra mức hiểu từ lịch sử tương tác..."

20–30s · Câu trả lời hiện ra kèm badge 🟢 "Beginner"
        · Chỉ vào badge: "Mức hiểu của bạn: Beginner"
        · Highlight đoạn trả lời phù hợp trình độ
        · Nói: "Tutor cá nhân hoá câu trả lời theo mức hiểu. User có thể chỉnh mức nếu chưa đúng!"
```

### Screenshot bắt buộc (lưu vào `codebase/screenshots/`)

- `cp3-happy.png` — Happy path với badge 🟢 Beginner
- `cp3-low-conf.png` — Low-Confidence path (hỏi lại)
- `cp3-broken.png` — Segment hỏng với warning
- `cp3-correction.png` — Correction path (level selector)

---

## 6. Công việc CP4 — Deadline 21:00, 18/9/2026

### Mục tiêu: Spec chốt + update prototype theo feedback

### Cập nhật spec.md §4 (HV4 chịu chính, HV3 contribute phần UI flow)

#### Thêm vào spec.md §4b: Nguyên tắc HAX đã áp dụng (PIVOT)

```markdown
## §4b. Nguyên tắc HAX/PAIR đã áp dụng

| Nguyên tắc | Áp dụng vào đâu trong prototype |
|---|---|
| **G1** — Làm rõ hệ thống làm được gì | Màn chat: câu chào "Mình sẽ suy ra mức hiểu và điều chỉnh câu trả lời phù hợp" |
| **G2** — Làm rõ nó làm tốt đến đâu | Badge 🟢/🟡/🔴 LUÔN hiển thị → user tự kiểm được mức suy ra |
| **G5** — Hợp chuẩn mực xã hội | Giọng tutor: "Mình suy ra..." thay vì "Hệ thống xác định..." |
| **G10** — Thu hẹp phạm vi khi nghi ngờ | Segment hỏng → warning UI + options "Chuyển GV" |
| **G9** — Sửa dễ dàng | Nút "Chỉnh mức hiểu" → level selector → AI điều chỉnh |
```

### Update prototype theo feedback
- **HV1 (Evidence):** Nếu có feedback về flow bị miss → fix
- **HV2 (Golden set fail):** Cập nhật logic xử lý edge case mới từ eval

### Checklist 4 đường đi đều demo được

- [ ] Happy path: bôi đen → mức hiểu badge hiện ra
- [ ] Low-Confidence: suy luận sai → hỏi lại xác nhận
- [ ] Failure: segment hỏng → warning + options
- [ ] Correction: bấm "Chỉnh mức" → level selector → AI điều chỉnh

---

## 7. Công việc CP5 — Deadline 22:30, 18/9/2026

### Nộp cuối: Slide PDF + Video dự phòng

### Slide 6 trang (HV4 chịu chính, HV3 contribute slide 3 — Demo)

| Slide | Người phụ trách |
|---|---|
| 1. User & Job | HV1 |
| 2. Vì sao chọn tính năng này | HV1 |
| **3. Demo (UI + flow)** | **HV3** |
| 4. Kết quả đo | HV2 |
| 5. User thật nói gì | HV1 |
| 6. Nếu có thêm 1 tuần | HV4 |

#### Slide 3 — Demo (HV3 viết nội dung) (PIVOT)

```
┌────────────────────────────────────────────────────────────┐
│  DEMO: CiteTutor — Cá nhân hoá theo mức hiểu              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🎯 Lát cắt: Học viên bôi đen đoạn transcript chưa hiểu │
│              → AI suy ra mức hiểu từ lịch sử tương tác   │
│              → Điều chỉnh độ sâu câu trả lời             │
│                                                            │
│  Demo cases:                                               │
│  ✅ Happy path: đoạn có trong transcript → cá nhân hoá    │
│  ✅ Low-Conf: suy luận sai → hỏi lại xác nhận            │
│  ✅ Failure: segment hỏng → warning + chuyển GV           │
│  ✅ Correction: user chỉnh mức → AI điều chỉnh             │
│                                                            │
│  [Screenshot/Video embed ở đây]                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Video demo dự phòng 2 phút — Script chi tiết (PIVOT)

```
⏱️ THỜI GIAN     NỘI DUNG MÀN HÌNH
──────────────────────────────────────────────────────────────
0–15s  · Giới thiệu: "Mình là HV3, phụ trách prototype"
        · Zoom vào slide: "Đây là giao diện CiteTutor"
        · Di chuột qua slide: "Học viên có thể bôi đen đoạn cần hỏi"

15–45s · HAPPY PATH
        · Bôi đen đoạn "attention mechanism"
        · Nhấn "Hỏi tutor"
        · Loading: "Tutor đang suy luận mức hiểu..."
        · Câu trả lời hiện ra kèm badge 🟢 "Beginner"
        · Nói: "Tutor cá nhân hoá câu trả lời theo mức Beginner. User thấy phù hợp!"

45s–1m15s · FAILURE PATH (Segment hỏng)
        · Giả lập: user thuộc segment hỏng (grade_missing=True)
        · Bôi đen đoạn "neural network architecture"
        · Nhấn "Hỏi tutor"
        · Câu trả lời: "⚠️ Mình nhận thấy bạn chưa có điểm trong hệ thống..."
        · Nói: "Khi phát hiện segment hỏng, tutor cảnh báo thay vì đoán. User có thể chuyển giảng viên."

1m15s–1m45s · CORRECTION PATH
        · Bấm "Chỉnh mức hiểu"
        · Level selector hiện ra
        · Chọn "Intermediate"
        · AI: "✅ Đã cập nhật: Intermediate"
        · Câu trả lời mới hiện ra với độ khó cao hơn
        · Nói: "User luôn có thể chỉnh mức hiểu bất cứ lúc nào — tuân theo G9."

1m45s–2m   · LOW-CONFIDENCE PATH
        · Giả lập: user phản hồi bằng thuật ngữ
        · AI: "Mình nhận thấy bạn dùng thuật ngữ chính xác. Bạn muốn tăng độ khó không?"
        · Nói: "Khi không chắc, tutor hỏi lại thay vì đoán — tuân theo G10."

──────────────────────────────────────────────────────────────
TOTAL: 2 phút (120 giây)
```

### Backup: Screenshot từng bước

Lưu vào `codebase/screenshots/`:
- `cp5-step1-slide-view.png` — Slide transcript
- `cp5-step2-highlight.png` — Bôi đen text
- `cp5-step3-loading.png` — Loading state
- `cp5-step4-answer.png` — Câu trả lời có badge mức hiểu
- `cp5-step5-broken.png` — Segment hỏng warning
- `cp5-step6-correction.png` — Level selector

---

## 8. UI/UX Nguyên tắc (HAX G1, G2, G5) — PIVOT

### G1 — Làm rõ hệ thống làm được gì

```tsx
// Trong ChatBox — câu chào đầu tiên
<div className="bg-white p-4 rounded-lg shadow-sm text-sm text-gray-600">
  👋 Xin chào! Mình là Tutor VLearn. Mình sẽ suy ra mức hiểu 
  của bạn từ lịch sử tương tác và điều chỉnh câu trả lời phù hợp.
  Nếu không xác định được mức hiểu, mình sẽ nói rõ cho bạn nhé.
</div>
```

### G2 — Làm rõ nó làm tốt đến đâu

```tsx
// UnderstandingBadge luôn hiển thị mức hiểu
<UnderstandingBadge level={userLevel} onEdit={() => setShowLevelSelector(true)} />
```

### G5 — Hợp chuẩn mực xã hội (giọng thân thiện)

```tsx
// Thay vì:
// "Hệ thống xác định mức độ hiểu: Beginner"
// → Dùng:
// "Mình suy ra: bạn đang ở mức mới bắt đầu"

const tutorResponses = {
  beginner: "Mình suy ra: bạn đang ở mức mới bắt đầu. Mình giải thích chi tiết nhé...",
  intermediate: "Mình suy ra: bạn đang ở mức trung bình. Mình giải thích vừa đủ nhé...",
  advanced: "Mình suy ra: bạn đang ở mức nâng cao. Mình giải thích chuyên sâu nhé...",
  segmentBroken: "Mình nhận thấy bạn chưa có điểm trong hệ thống và mình không có lịch sử..."
};
```

---

## 9. Cảnh báo & lỗi thường gặp

### ⚠️ UI đẹp trước, flow sau = SAI

**Phải:** Flow chạy được trước, polish sau.

### ⚠️ Không có loading state = User tưởng app hỏng

```tsx
// ❌ Sai
{isLoading && <div>{/* nothing */}</div>}

// ✅ Đúng
{isLoading && (
  <div className="flex items-center gap-2">
    <div className="animate-spin">⟳</div>
    <span>Tutor đang suy luận mức hiểu của bạn...</span>
  </div>
)}
```

### ⚠️ Level badge không hiển thị = Fail AC1

```tsx
// Badge phải luôn hiển thị sau câu trả lời tutor
{msg.role === 'tutor' && (
  <UnderstandingBadge level={msg.level} />
)}
```

### ⚠️ Segment hỏng không có warning = Fail AC3

```tsx
// Phải có SegmentWarning khi segment=broken
{msg.segment === 'broken' && (
  <SegmentWarning reason={msg.segmentReason} ... />
)}
```

### ⚠️ Mock data không giống data thật = Demo không thuyết phục

- Copy thật từ `data/vlearn-pack/transcript/transcript-03-clean.md`
- Đảm bảo level response phù hợp với mức hiểu được chọn

---

## 10. Deliverables HV3 trong repo

```
K4-3B-E402-CiteTutor/
├── HV3-prototype.md              ← File này
├── spec.md                       ← HV4 chịu, HV3 contribute §4 UI flow
├── codebase/
│   ├── app/
│   │   ├── page.tsx              # Main page
│   │   └── layout.tsx            # Layout
│   ├── components/
│   │   ├── SlideView.tsx         # Hiển thị slide + bôi đen
│   │   ├── ChatBox.tsx           # Q&A + mức hiểu
│   │   ├── UnderstandingBadge.tsx # Badge 🟢/🟡/🔴 (PIVOT)
│   │   ├── SegmentWarning.tsx     # Warning segment hỏng (PIVOT)
│   │   ├── TutorChat.tsx          # Chat container
│   │   └── LevelSelector.tsx     # Modal chọn mức (PIVOT)
│   ├── data/
│   │   ├── transcript-03-mock.json    # 200 từ từ transcript thật
│   │   └── mock-responses.json        # Mock responses 4 path
│   ├── screenshots/
│   │   ├── cp3-happy.png
│   │   ├── cp3-low-conf.png
│   │   ├── cp3-broken.png
│   │   ├── cp3-correction.png
│   │   ├── cp5-step1-slide-view.png
│   │   ├── cp5-step2-highlight.png
│   │   ├── cp5-step3-loading.png
│   │   ├── cp5-step4-answer.png
│   │   ├── cp5-step5-broken.png
│   │   └── cp5-step6-correction.png
│   ├── video/
│   │   ├── cp3-30s.mp4           # Video 30 giây CP3
│   │   └── cp5-demo-backup.mp4    # Video dự phòng 2 phút
│   ├── wireframes/
│   │   ├── slide-view-wireframe.png
│   │   ├── chat-box-wireframe.png
│   │   └── segment-warning-wireframe.png (PIVOT)
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── .gitignore
│   └── README.md                 # Cách chạy: npm install && npm run dev
└── eval/
    └── (HV2 phụ trách golden set)
```

---

## 11. Tài nguyên tham chiếu

| Tài liệu | Đường dẫn | Phần liên quan |
|---|---|---|
| Guide | `02-guide.md` | §3.2 (3 mức prototype), §3.4 (tool menu), §3.5 (phân công song song) |
| Rubric | `04-rubric.md` | R5 (Prototype 8đ) |
| Spec template | `03-ai-spec-template.md` | §4 (lát cắt + thiết kế) |
| Transcript mẫu | `data/vlearn-pack/transcript/transcript-03-clean.md` | 200 từ đầu dùng cho mock |
| HAX Guidelines | `further-reading/hax-guidelines.md` | G1, G2, G5, G9, G10 |

---

## 12. Sơ đồ Flow 4 đường đi (ASCII) (PIVOT)

```
                    ┌─────────────────┐
                    │ Học viên bôi    │
                    │ đen đoạn text   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Nhấn "Hỏi tutor"│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Kiểm tra segment│
                    │ hỏng?           │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │ Segment   │ │ Kiểm tra  │ │ Có đủ     │
        │ hỏng ✓   │ │ đủ tín    │ │ tín hiệu? │
        └─────┬─────┘ │ hiệu?     │ └─────┬─────┘
              │        └─────┬─────┘       │
              │               │              ▼
              ▼               ▼        ┌───────────┐
        ┌───────────┐   ┌────────┐   │ CONFIDENCE│
        │⚠️ Warning │   │ 🟢/🟡/🔴│   │ < 0.4?    │
        │+ Chuyển GV│   │Infer OK │   └─────┬─────┘
        └───────────┘   └────┬───┘         │
                              │            ▼
                              │     ┌───────────┐
                              │     │⚠️ Hỏi lại │
                              │     │xác nhận   │
                              │     └─────┬─────┘
                              │           │
                              ▼           ▼
                        ┌─────────────────────────┐
                        │ Tạo câu trả lời theo   │
                        │ mức hiểu phù hợp       │
                        │ + Badge 🟢/🟡/🔴      │
                        └────────────┬────────────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │ User phản   │
                              │ hồi?        │
                              └──────┬──────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
              ┌──────────┐    ┌──────────┐    ┌──────────┐
              │Đúng ✓   │    │✏️ Chỉnh  │    │❌ Phản đối│
              │Kết thúc  │    │mức hiểu  │    │→ Sửa lỗi │
              └──────────┘    └────┬─────┘    └──────────┘
                                    │
                                    ▼
                              ┌─────────────┐
                              │Tạo câu trả │
                              │lời mới     │
                              │theo mức mới │
                              └─────────────┘
```

---

## 13. Checklist trước mỗi mốc

### CP1 (19:30, 17/9)
- [ ] Wireframe 3 màn hình (bao gồm SegmentWarning mới)
- [ ] Upload vào `codebase/wireframes/`

### CP2 (21:00, 17/9)
- [ ] Flow chính bấm đi hết được (4 path)
- [ ] Mock data từ transcript thật
- [ ] Git commit: `feat: CP2 mock prototype (PIVOT)`

### CP3 (16:00, 18/9)
- [ ] AI call thật ở quyết định trung tâm
- [ ] Log/trace trong repo
- [ ] Video 30 giây quay xong
- [ ] 4 screenshot bắt buộc

### CP4 (21:00, 18/9)
- [ ] spec.md §4 updated (UI flow)
- [ ] Feedback HV1/HV2 đã apply
- [ ] 4 đường đi đều demo được

### CP5 (22:30, 18/9)
- [ ] Slide 3 (Demo) hoàn thành
- [ ] Video dự phòng 2 phút
- [ ] Screenshot backup
- [ ] Dry run xong, bấm giờ < 5 phút

---

## 14. Timeline HV3

```
17/9
├── 19:30 ─── CP1: Wireframe xong
└── 21:00 ─── CP2: Mock prototype bấm được ✓

18/9
├── 16:00 ─── CP3: AI thật + video 30s ✓
├── 21:00 ─── CP4: Spec updated ✓
└── 22:30 ─── CP5: Nộp cuối ✓

19/9
└── 09:00 ─── CP6: Demo thuyết trình
```

---

## PIVOT NOTES

**Điều thay đổi so với phiên bản cũ:**

| Nội dung | Cũ | Mới |
|---|---|---|
| Focus | Citation kèm mã trang | Suy ra mức hiểu + phát hiện segment hỏng |
| Badge | Không có | 🟢/🟡/🔴 Mức hiểu indicator |
| Warning UI | Citation thiếu | Segment hỏng (grade_missing) |
| Level selector | Không có | Modal chọn mức hiểu (PIVOT) |
| 4 đường đi | Happy/Edge/Failure/Correction | Happy/Low-Conf/Failure/Correction |
| Wireframe mới | 2 màn hình | 3 màn hình (thêm SegmentWarning) |
| Component mới | 3 cái | 5 cái (thêm UnderstandingBadge, SegmentWarning, LevelSelector) |

---

> **Lưu ý quan trọng:** Mọi thành viên phải giải thích được phần có tên mình khi bị hỏi tại CP6 (vibe-coding rule). HV3 cần sẵn sàng trả lời: "Prototype hoạt động thế nào?" · "4 đường đi được xử lý ra sao?" · "Tại sao chọn mức Mock?"

---

*HV3 Frontend Lead · K4-3B-E402-CiteTutor · Hackathon AI20k Batch 04*
