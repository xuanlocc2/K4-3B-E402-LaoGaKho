# CiteTutor — Demo Scaffold

> **Track:** A1c — VLearn Tutor cá nhân hoá theo mức hiểu + phát hiện segment hỏng
> **Nhóm:** K4-3B-E402 · **Hackathon AI20k Batch 04**
> **Repo:** `demo/` — Vite + React 18 + TypeScript + Tailwind v3

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Cài đặt](#2-cài-đặt)
3. [Cấu hình](#3-cấu-hình)
4. [Chạy ứng dụng](#4-chạy-ứng-dụng)
5. [Demo Flow — 4 đường đi](#5-demo-flow--4-đường-đi)
6. [Pitch Script 5 phút](#6-pitch-script-5-phút)
7. [Tech Stack](#7-tech-stack)
8. [Cấu trúc thư mục](#8-cấu-trúc-thư-mục)
9. [Những gì đã làm / sắp làm / blocker](#9-những-gì-đã-làm--sắp-làm--blocker)

---

## 1. Giới thiệu

**CiteTutor** là tính năng tutor thông minh cho nền tảng VLearn:

- Học viên **bôi đen đoạn transcript** chưa hiểu
- AI **suy ra mức hiểu** từ lịch sử tương tác (không dùng cột `understanding_level` đang trống 99,85%)
- AI **điều chỉnh độ sâu câu trả lời** phù hợp với trình độ
- **Đồng thời** phát hiện segment hỏng (`grade_missing`) và **từ chối + chuyển giảng viên** thay vì bịa

### Hai painpoint chính (HV1 mining)

| Painpoint | Số liệu |
|-----------|----------|
| `understanding_level` trống 99,85% → không cá nhân hoá được | 20/13.494 dòng có giá trị |
| `grade_missing` segment hỏng hoàn toàn | 129/13.494 dòng (100% có `move_used` rỗng + `has_citation=False`) |

---

## 2. Cài đặt

```bash
cd demo
npm install
```

> Yêu cầu: Node.js ≥18, npm ≥9

---

## 3. Cấu hình

### Bước 1: Tạo file `.env.local`

```bash
# Windows PowerShell:
Copy-Item .env.local.example .env.local

# Hoặc thủ công:
# Copy file .env.local.example → .env.local
```

### Bước 2: Điền GEMINI_API_KEY

```bash
# Mở .env.local bằng notepad (Windows):
notepad .env.local

# Hoặc dùng code editor:
code .env.local
```

Điền API key của bạn:

```
GEMINI_API_KEY=AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Cách lấy API key:**
1. Truy cập [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Đăng nhập → Create API Key
3. Copy key và dán vào `.env.local`

> ⚠️ **KHÔNG bao giờ commit file `.env.local`** — nó đã được thêm vào `.gitignore`

---

## 4. Chạy ứng dụng

```bash
npm run dev
```

Sau đó mở trình duyệt tại: **http://localhost:5173**

### Build để kiểm tra lỗi TypeScript

```bash
npm run build
```

### Smoke test (kiểm tra server chạy)

```bash
npm run dev
# Mở trình duyệt → http://localhost:5173
# Xác nhận trang hiển thị đúng (2 cột 60/40)
```

---

## 5. Demo Flow — 4 đường đi

> **Lưu ý:** App chạy ở chế độ **mock** (không cần API key thật). Banner màu vàng hiện ở trên cùng: *"Mock mode — VITE_GEMINI_API_KEY chưa được cấu hình"*.
> Nếu muốn dùng Gemini thật: tạo `.env.local` với `VITE_GEMINI_API_KEY=AIza...` (lấy từ [Google AI Studio](https://aistudio.google.com/app/apikey)).

---

### Path 1: ✅ Happy Path — Minh (Beginner)

```
1.  Persona mặc định: "Minh (beginner)" đã được chọn sẵn
2.  Bôi đen đoạn text bất kỳ trong transcript (VD: "giảng viên sẽ hướng dẫn")
3.  Thanh màu tím hiện ra: '"...giảng viên sẽ hướng dẫn..."'
4.  Nhấn nút "Hỏi tutor"
5.  Loading: 3 chấm nhảy + "Tutor đang suy luận mức hiểu…"  (~1-2s mock)
6.  Hiện câu trả lời:
    • Badge 🟢 Beginner (55% chắc) ở góc trên bên phải
    • Câu trả lời markdown phù hợp beginner (giải thích đơn giản, ví dụ đời thường)
7.  Click "Chỉnh mức" → modal 3 lựa chọn → chọn "Nâng cao"
8.  Loading lại → Badge đổi thành 🔴 Advanced + câu trả lời chuyên sâu hơn
```

---

### Path 2: ⚠️ Low-Confidence → Correction — Lan (Intermediate)

```
1.  Header: chọn dropdown "👤 Lan (intermediate)"
2.  History reset, hội thoại trước đó bị xoá
3.  Bôi đen đoạn text (VD: "attention mechanism")
4.  Nhấn "Hỏi tutor"
5.  Loading → Badge 🟡 Intermediate (72% chắc)
6.  Câu trả lời ở mức trung bình (dùng thuật ngữ, giải thích vừa đủ)
7.  "Chỉnh mức" → modal → chọn "Nâng cao" → 🔴 Advanced + câu trả sâu hơn
```

---

### Path 3: ❌ Failure — Ẩn danh (Broken Segment)

```
1.  Header: chọn dropdown "👤 Ẩn danh (unknown)"
2.  History reset, hội thoại trước đó bị xoá
3.  Bôi đen đoạn text bất kỳ trong transcript
4.  Nhấn "Hỏi tutor"
5.  KHÔNG gọi Gemini — phát hiện segment hỏng NGAY LẬP TỨC
6.  Hiện ⚠️ Panel cảnh báo màu vàng:
    • "Bạn chưa có điểm trong hệ thống VLearn"
    • "Mình không có lịch sử tương tác"
    • 2 nút: "📩 Chuyển giảng viên"  /  "Trả lời mặc định"
7.  Click "Chuyển giảng viên" → alert "Đã chuyển câu hỏi cho giảng viên!"
```

---

### Path 4: 🔄 Correction — User chỉnh mức hiểu (bất kỳ persona nào)

```
1.  Sau khi nhận câu trả lời tutor (bất kỳ path 1 hoặc 2)
2.  Click link "Chỉnh mức" bên dưới badge mức hiểu
3.  Modal hiện ra: 3 lựa chọn (🟢 Mới bắt đầu / 🟡 Trung bình / 🔴 Nâng cao)
4.  Chọn 1 mức khác
5.  Loading → Badge cập nhật → câu trả lời mới với độ sâu khác
6.  Click "Hủy" để đóng modal mà không đổi
```

---

### 4 Path tổng hợp

| # | Path | Persona | Điều kiện | Kết quả |
|---|---|---|---|---|
| 1 | Happy | Minh | grade_missing=false, có history | 🟢 Badge + câu trả beginner |
| 2 | Low-Conf → Correction | Lan | grade_missing=false, có history | 🟡 Badge + câu trả intermediate → sửa lên 🔴 |
| 3 | Failure | Ẩn danh | grade_missing=true, không history | ⚠️ Panel cảnh báo — KHÔNG gọi Gemini |
| 4 | Correction | Minh / Lan | Bất kỳ, sau Path 1/2 | Modal → đổi mức → câu trả lời mới |

---

## 6. Pitch Script 5 phút

> **Mở đầu (30 giây) — HV4**
>
> "Xin chào, nhóm K4-3B-E402 CiteTutor. Đề tài của chúng tôi: Tối ưu tutor VLearn — cá nhân hoá theo mức hiểu + phát hiện segment hỏng. Chúng tôi đã pivot từ hướng citation sang hướng này vì HV1 mining data phát hiện 2 painpoint mới quan trọng hơn."

---

> **Slide 1: User & Pain (45 giây) — HV1**
>
> "Chúng tôi tập trung vào học viên K4 đang ngồi trong buổi học, đọc slide trên VLearn, vừa bôi đen một đoạn chưa hiểu.
>
> Pain lớn nhất: Trong 13.494 tutor_turns, chỉ **20 lần (0,15%)** có thông tin mức hiểu → tutor không cá nhân hoá được. Thêm vào đó, **129 lần (0,96%)** thuộc segment không có data đầu vào → trả lời sai hoàn toàn."

---

> **Slide 2: Vì sao chọn (45 giây) — HV1**
>
> "Chúng tôi chọn 2 painpoint trên. Citation không phù hợp vì ưu tiên painpoint cá nhân hoá + segment hỏng đã có số liệu cụ thể hơn. Evidence từ mining: understanding_level chỉ có 0,15% có giá trị; grade_missing segment hỏng 100% có move_used rỗng và has_citation=False."

---

> **Slide 3: Demo (2 phút) — HV3**
>
> "Giải pháp: khi học viên bôi đen transcript, AI suy ra mức hiểu từ lịch sử tương tác. Đồng thời phát hiện segment hỏng và cảnh báo.
>
> [Bật prototype]
>
> **Case 1 — Happy path:** Bôi đoạn 'attention mechanism' → hỏi → kết quả: mức hiểu 🟢 Beginner + câu trả lời phù hợp.
>
> **Case 2 — Segment hỏng:** Chọn persona 'Ẩn danh' (grade_missing=True) → bôi đoạn → kết quả: ⚠️ Warning + 'Chuyển giảng viên'."

---

> **Slide 4: Kết quả đo (45 giây) — HV2**
>
> "Golden set [X] case. Personalization [Y]% qua bar (≥85%). Segment hỏng [Z]% phát hiện (100%). 1 failure đáng chú ý: [case]. Nguyên nhân: [inference/segment/prompt]. Đã fix bằng [cách] hoặc để trong backlog."

---

> **Slide 5: User thật nói gì (45 giây) — HV1**
>
> "[Quote 1 nguyên văn]. [Quote 2 nguyên văn]. Sau test, chúng tôi đã thay đổi [thay đổi cụ thể]."

---

> **Slide 6: Nếu có thêm 1 tuần (30 giây) — HV4**
>
> "Nếu có thêm 1 tuần: [2-3 việc ưu tiên]. Bài học lớn nhất: [bài học]. Cảm ơn mọi người."

---

## 7. Tech Stack

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|-----------|
| Vite | 5.x | Build tool + dev server |
| React | 18.x | UI framework |
| TypeScript | 5.x | Strict mode, no `any` |
| Tailwind CSS | 3.x | Styling (utility classes only) |
| shadcn | *(sắp cài)* | UI primitives (future step) |
| Framer Motion | *(sắp cài)* | Animations (future step) |
| Gemini API | *(sắp kết nối)* | AI generation (CP3) |

---

## 8. Cấu trúc thư mục

```
demo/
├── .env.local.example       ← Template chứa GEMINI_API_KEY=
├── .gitignore              ← Đã exclude .env.local, node_modules, dist
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md               ← File này
└── src/
    ├── main.tsx            ← React entry point
    ├── App.tsx             ← Root: grid 60/40 (SlideView + ChatBox)
    ├── index.css           ← Tailwind directives + Inter font
    ├── vite-env.d.ts
    ├── app/
    │   └── layout.tsx      ← Stub (Next.js App Router style placeholder)
    ├── components/
    │   ├── SlideView.tsx        ← Transcript panel + onMouseUp selection
    │   ├── ChatBox.tsx          ← Chat panel: mock messages + send
    │   ├── TutorResponse.tsx    ← Single chat message
    │   ├── UnderstandingBadge.tsx ← 🟢/🟡/🔴 badge (4 variants)
    │   ├── SegmentWarning.tsx    ← ⚠️ warning for broken segment
    │   ├── LevelSelector.tsx     ← Modal: pick beginner/intermediate/advanced
    │   └── PersonaSwitcher.tsx   ← Dropdown: 3 personas (logs on change)
    ├── data/
    │   ├── transcript-03.json  ← 30 đoạn đầu từ transcript thật
    │   └── personas.json         ← 3 personas: Minh/Lan/Ẩn danh
    └── lib/
        ├── gemini.ts             ← Real Gemini API + JSON parse + mock fallback
        ├── gemini-mock.ts        ← Deterministic mock responses per persona
        ├── inference.ts          ← 4-signal heuristic: q-count / anslen / jargon / rephrase
        └── segment-detect.ts    ← grade_missing + Jaccard word-overlap
```

---

## 9. Những gì đã làm / sắp làm / blocker

### ✅ Đã làm (CP1 + CP2 + CP3)

- [x] Vite + React 18 + TypeScript strict mode (no `any`)
- [x] Tailwind CSS v3 với Inter font
- [x] 2 cột 60/40 grid layout (SlideView + ChatBox)
- [x] Tất cả component stubs (chạy được, không throw)
- [x] 3 persona trong `data/personas.json`
- [x] 30 đoạn transcript đầu trong `data/transcript-03.json`
- [x] Lib stubs với typed signatures (gemini, inference, segment-detect)
- [x] SlideView: `onMouseUp` → `window.getSelection()` → "Hỏi tutor" button
- [x] ChatBox: 2 hardcoded messages + send → 600ms mock loading + reply
- [x] `.gitignore` exclude `.env.local`
- [x] `.env.local.example` với `VITE_GEMINI_API_KEY=`
- [x] README.md với pitch script 5 phút
- [x] `npm run build` chạy thành công
- [x] **Gemini API tích hợp thật** (`@google/generative-ai` + `import.meta.env.VITE_GEMINI_API_KEY`)
- [x] **Mock fallback** khi không có API key (deterministic per persona)
- [x] **Inference thật** — 4 tín hiệu có trọng số: question count (25%), avg answer length (25%), jargon density (30%), rephrase count (20%)
- [x] **Segment detection thật** — grade_missing + word-overlap Jaccard < 0.15
- [x] **4 path hoàn chỉnh**: Happy (Minh) / Low-Conf (Lan) / Failure (Ẩn danh) / Correction
- [x] **LevelSelector modal** — gọi lại Gemini với override level
- [x] **Loading state** — animated 3-dot pulse + "Tutor đang suy luận mức hiểu…"
- [x] **Dev banner** — "Mock mode" hiện khi không có API key thật
- [x] `react-markdown` — câu trả lời tutor render markdown

### 🔄 Sắp làm

- [ ] Cài shadcn UI components (UI polish)
- [ ] Framer Motion animations
- [ ] Golden set ≥20 case (HV2)
- [ ] Quality bar: ≥85% personalization + 100% broken detection

### 🚫 Blocker hiện tại

- Không có blocker cho scaffold này — chạy được `npm run dev`
- Blocker tiếp theo: cần `VITE_GEMINI_API_KEY` thật để test AI call thật (dùng mock mode vẫn chạy đầy đủ)

---

## 10. Flow Diagram

See `../docs/flow-diagram.md` (Mermaid source) and `../docs/flow-diagram.svg` (drag into Figma).

### Mermaid Live Render

Copy the ````mermaid` block from `../docs/flow-diagram.md` and paste into [mermaid.live](https://mermaid.live) to see the interactive diagram.

### Import to Figma

1. Open Figma → **File** → **Import**
2. Choose `../docs/flow-diagram.svg`
3. All nodes become editable vector layers (rects + text + polygons for diamonds)
4. Connector arrows are `<line>` + `<marker>` elements — group-then-ungroup to detach them

### What the diagram covers

| Element | Covered |
|---------|---------|
| Start node — Mở app | ✅ |
| Persona switcher (Minh / Lan / Ẩn danh) | ✅ |
| Bôi đen text → Click "Hỏi tutor" | ✅ |
| Decision: `detectSegment()` → segment broken? | ✅ |
| Failure path: SegmentWarning panel (Ẩn danh) | ✅ |
| Happy path: 🟢 Beginner badge (Minh) | ✅ |
| Low-Conf path: 🟡 Intermediate badge (Lan) | ✅ |
| Correction loop: "Chỉnh mức" → LevelSelector → re-call Gemini | ✅ |
| End node — Answer rendered in ChatBox | ✅ |

---

## Ghi chú cho nhóm

| Thành viên | Phần việc | File liên quan |
|------------|-----------|----------------|
| HV1 | Evidence mining + survey | HV1-evidence.md |
| HV2 | AI pipeline + golden set + quality bar | HV2-prompt-retrieval.md |
| HV3 | Prototype + UI + video demo | HV3-prototype.md |
| HV4 | Spec + slides + validation + reflection | HV4-spec-qa-demo.md |

---

*CiteTutor Demo Scaffold · K4-3B-E402 · Hackathon AI20k Batch 04 · 17/09/2026*
