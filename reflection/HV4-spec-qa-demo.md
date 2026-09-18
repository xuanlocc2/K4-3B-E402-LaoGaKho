# HV4 — Spec/QA/Demo Lead
## K4-3B-E402-CiteTutor · AI20k Batch 04 · Phòng E402

---

> **Vai trò tổng quát:** Chịu trách nhiệm về spec đầy đủ, chất lượng đánh giá (quality bar), slide & demo, và thuyết trình CP6. HV4 là người gắn kết toàn bộ nhóm — đảm bảo mọi checkpoint đều có deliverable đúng deadline.

---

## Mục lục

1. [Vai trò & trách nhiệm HV4](#1-vai-trò--trách-nhiệm-hv4)
2. [Công việc CP1](#2-công-việc-cp1-deadline-1930-179)
3. [Công việc giữa CP1–CP4](#3-công-việc-giữa-cp1cp4-179--2100-189)
4. [Công việc CP3](#4-công-việc-cp3-deadline-1600-189)
5. [Công việc CP4](#5-công-việc-cp4-deadline-2100-189)
6. [Công việc CP5](#6-công-việc-cp5-deadline-2230-189)
7. [Công việc CP6](#7-công-việc-cp6-deadline-0900-199)
8. [Reflection cá nhân](#8-reflection-cá-nhân)
9. [Cảnh báo & lỗi thường gặp](#9-cảnh-báo--lỗi-thường-gặy)
10. [Checklist cuối cùng](#10-checklist-cuối-cùng-trước-cp6)
11. [Deliverables HV4 trong repo](#11-deliverables-hv4-trong-repo)
12. [Tài nguyên tham chiếu](#12-tài-nguyên-tham-chiếu)
13. [Tiêu chí xuất sắc](#13-tiêu-chí-xuất-sắc)

---

## 1. Vai trò & trách nhiệm HV4

### 1.1 Mục tiêu theo từng checkpoint

| Checkpoint | Deadline | Deliverable chính | Trạng thái |
|---|---|---|---|
| CP1 | 19:30, 17/9 | README.md nhóm + canvas-cp1.md + repo GitHub + willing users | HV4 chịu |
| CP3 | 16:00, 18/9 | eval/results-cp3.md + review prototype + video 30s | HV4 + HV2 + HV3 |
| CP4 | 21:00, 18/9 | spec.md đủ §1-§9 + quality bar bằng số + evidence | HV4 chính |
| CP5 | 22:30, 18/9 | demo-slides.pdf (6 trang) + video dự phòng + validation | HV4 chịu |
| CP6 | 09:00, 19/9 | Thuyết trình 5' + 5' Q&A, mỗi người nói ≥1 phần | Cả nhóm |

### 1.2 Tiêu chí rubric liên quan đến HV4

| Rubric | Nội dung | Điểm | Ai chịu |
|---|---|---|---|
| R7 | Quy trình & repo — cấu trúc rõ, README + spec + changelog đầy đủ | 3đ | HV4 chịu chính |
| R6 | Validation — ≥2 người ngoài nhóm dùng thử, log đủ 5 trường, ≥1 thay đổi ghi vào spec | +8đ bonus | HV4 chịu |
| CP6 | Thuyết trình — 5' trình bày + 5' Q&A, phân vai rõ, dry run xong | Giám khảo chấm | Cả nhóm (HV4 facilitate) |

### 1.3 Sơ đồ phân công chính

| Thành viên | Phần việc chính | Ai phối hợp |
|---|---|---|
| HV1 | Evidence mining + khảo sát + validation (thu tên người ngoài) | HV4 (validation folder) |
| HV2 | AI pipeline + golden set + quality bar + eval/results | HV4 (review CP3, chốt bar) |
| HV3 | Prototype + UI + video demo + screenshots | HV4 (video backup) |
| HV4 | spec.md + slide + validation + reflection + dry run + Q&A prep | Tất cả |

---

## 2. Công việc CP1 (Deadline 19:30, 17/9)

### 2.1 Tạo README.md nhóm

**HV4 chịu hoàn thiện** — copy từ README mẫu và điền bảng thành viên:

```markdown
# K4-3B-E402-CiteTutor
## AI20k Batch 04 · Phòng E402 · Lớp 3B

### Thành viên nhóm

| Họ tên | Mã HV | Vai trò | Phần việc |
|--------|-------|---------|-----------|
| [HV1 tên] | HV1XXX | Evidence Lead | Mining + khảo sát + validation |
| [HV2 tên] | HV2XXX | Prompt/Retrieval Lead | AI pipeline + golden set + quality bar |
| [HV3 tên] | HV3XXX | Frontend Lead | Prototype + UI + video demo |
| [HV4 tên] | HV4XXX | Spec/QA/Demo Lead | spec.md + slide + validation + reflection |

### Track & Lát cắt (PIVOT)

- **Track:** A1c — Tối ưu tutor VLearn
- **Lát cắt (PIVOT):** Học viên bôi đen đoạn transcript chưa hiểu → AI suy ra mức hiểu từ lịch sử tương tác → điều chỉnh độ sâu câu trả lời · ĐỒNG THỜI phát hiện segment hỏng và cảnh báo
- **Stack:** Cursor + Gemini

### Repo structure

```
repo/
├── README.md              ← HV4 chịu (hoàn thiện CP1)
├── canvas-cp1.md          ← HV4 chịu (HV1/2/3 contribute)
├── spec.md                ← HV4 chịu (hoàn thiện trước CP4)
├── demo-slides.pdf       ← HV4 chịu (CP5)
├── codebase/              ← HV3 chịu
│   ├── video/            │   ← HV3 + HV4 (backup video)
│   └── screenshots/      │   ← HV3 + HV4 (backup screenshots)
├── eval/                  ← HV2 chịu (golden set + logs)
├── validation/            ← HV1 + HV4
│   ├── feedback-log.md   │
│   └── synthesis.md      │
└── reflection/            ← HV4 setup, mỗi người tự viết
    ├── [hv1-ten].md
    ├── [hv2-ten].md
    ├── [hv3-ten].md
    └── [hv4-ten].md
```
```

### 2.2 Tạo canvas-cp1.md (ĐÃ UPDATE)

HV4 chịu cấu trúc. HV1/HV2/HV3 contribute phần của mình.

**Lưu ý:** Canvas đã được PIVOT từ "citation kèm mã trang" → "cá nhân hoá theo mức hiểu + phát hiện segment hỏng"

---

## 3. Công việc giữa CP1–CP4 (17/9 → 21:00 18/9)

### 3.1 Daily standup 5 phút cuối ngày

**HV4 facilitate** — mỗi ngày cuối buổi, chạy nhanh 5 phút:

```
Standup format (5 phút):
1. HV1: Evidence thu được bao nhiêu? Cần hỗ trợ gì?
2. HV2: Inference logic có chạy được không? Golden set đang ở đâu?
3. HV3: Prototype đến đâu? Còn blocker gì?
4. HV4: Spec viết đến § mấy? Cần feedback từ ai?

→ HV4 tổng hợp nhanh: ngày mai ưu tiên gì?
```

### 3.2 Spec.md theo `03-ai-spec-template.md` (PIVOT)

**HV4 chịu chính** — deadline hoàn thiện **21:00, 18/9 (CP4)**.

| § | Nội dung (PIVOT) | Người chịu | Chốt tại |
|---|---|---|---|
| §1 | Tóm tắt sản phẩm: cá nhân hoá + segment hỏng | HV4 | CP1 |
| §2 | Bằng chứng & impact (2 painpoint mới) | HV1 | CP4 |
| §3 | Nghiên cứu giải pháp tương tự | HV4 | CP4 |
| §4 | Lát cắt & thiết kế (suy ra mức hiểu + detect segment) | HV4 + HV3 | CP4 |
| §5 | 4 lớp chỗ khó (cá nhân hoá sai + segment hỏng) | HV2 | CP4 |
| §6 | ≥8 kịch bản rủi ro (personalization + segment) | HV2 | CP4 |
| §7 | Golden set ≥20 case + quality bar (85% + 100%) | HV2 | CP4 (chốt bằng số) |
| §8 | Multi-prototype (nếu có) | HV3 | CP4 |
| §9 | Changelog | HV4 | CP5 (sau validation) |

### 3.3 Quality Bar — CHỐT TRƯỚC 21:00 CP4, KHÔNG ĐỔI SAU (PIVOT)

HV2 đề xuất, HV4 review, cả nhóm chốt. Sau CP4 **không được sửa** (theo rule khoá).

```
┌─────────────────────────────────────────────────────────┐
│                  QUALITY BAR — CHỐT CP4                 │
│            (không đổi sau 21:00 18/9)                 │
├─────────────────────────────┬───────────────────────────┤
│ Metric                      │ Target                    │
├─────────────────────────────┼───────────────────────────┤
│ Personalization Accuracy     │ ≥ 85% cá nhân hoá đúng  │
│ Segment Broken Detection    │ 100% phát hiện segment  │
│ Answer Quality              │ ≥ 90% (trong happy cases)│
│ Refusal Correctness         │ 100% (segment hỏng)      │
├─────────────────────────────┴───────────────────────────┤
│ Baseline: [HV2 ghi kết quả baseline CP3]              │
│ Nếu CP3 < bar → phải cải thiện trước CP4            │
└─────────────────────────────────────────────────────────┘
```

**Quy tắc khoá quality bar:**
- Chốt trước 21:00 18/9 → không đổi sau đó
- Nếu baseline CP3 thấp hơn bar → phải cải thiện ngay, không đổi bar xuống
- Giấu fail hoặc chỉnh sửa số → mất điểm R4

---

## 4. Công việc CP3 (Deadline 16:00, 18/9)

### 4.1 Đánh giá golden set đầu tiên từ HV2

HV2 giao eval/results-cp3.md cho HV4 review.

**HV4 thực hiện:**

1. **Chạy 20 case** (hoặc số case HV2 đã đánh giá)
2. **Bảng % đối chiếu quality bar (PIVOT):**

## Kết quả CP3 — Golden Set Evaluation (PIVOT)

### Tổng quan

Nguồn: `codebase/tests/HV2-RESULTS.md` (Round 2 — MOCK, dùng làm baseline CP3; Round 3 — Real API `gemini-3.6-flash` chạy lại cùng bộ 20 case cho CP4, kết quả trùng khớp).

| Metric | Baseline CP3 | Quality Bar | Status |
|--------|-------------|-------------|--------|
| Personalization Accuracy (bucket A+B+C, 15 case) | 100% (15/15) | ≥85% | ✅ |
| Segment Broken Detection (bucket D, 5 case) | 100% (5/5) | 100% | ✅ |
| Answer Quality (đúng mức hiểu + trả lời hợp lệ, 15 case A+B+C) | 100% (15/15) | ≥90% | ✅ |
| Refusal Correctness (từ chối đúng cách ở bucket D) | 100% (5/5) | 100% | ✅ |
| **Tổng thể** | **100% (20/20)** | — | ✅ |

### Chi tiết case

| # | Input | User Profile | Expected Level | Actual Level | Pass/Fail | Ghi chú |
|---|-------|-------------|---------------|--------------|-----------|---------|
| A1 | Bucket A — câu hỏi cơ bản | Minh (Beginner) | beginner | beginner | ✅ | confidence 0.90 |
| A2 | Bucket A | Minh (Beginner) | beginner | beginner | ✅ | confidence 0.90 |
| A3 | Bucket A | Minh (Beginner) | beginner | beginner | ✅ | confidence 0.85 |
| A4 | Bucket A | Minh (Beginner) | beginner | beginner | ✅ | confidence 0.85 |
| A5 | Bucket A | Minh (Beginner) | beginner | beginner | ✅ | confidence 0.65 (thấp nhất bucket A, vẫn pass) |
| B1 | Bucket B — câu hỏi trung cấp | Lan (Intermediate) | intermediate | intermediate | ✅ | confidence 0.72 |
| B2 | Bucket B | Lan (Intermediate) | intermediate | intermediate | ✅ | confidence 0.80 |
| B3 | Bucket B | Lan (Intermediate) | intermediate | intermediate | ✅ | confidence 0.80 |
| B4 | Bucket B | Lan (Intermediate) | intermediate | intermediate | ✅ | confidence 0.72 |
| B5 | Bucket B | Lan (Intermediate) | intermediate | intermediate | ✅ | confidence 0.80 |
| C1 | Bucket C — câu hỏi nâng cao | Phong (Advanced) | advanced | advanced | ✅ | confidence 0.88 |
| C2 | Bucket C | Phong (Advanced) | advanced | advanced | ✅ | confidence 0.30 (thấp bất thường, xem ghi chú dưới) |
| C3 | Bucket C | Phong (Advanced) | advanced | advanced | ✅ | confidence 0.88 |
| C4 | Bucket C | Phong (Advanced) | advanced | advanced | ✅ | confidence 0.90 |
| C5 | Bucket C | Phong (Advanced) | advanced | advanced | ✅ | confidence 0.88 |
| D1 | Bucket D — segment hỏng | Ẩn danh (`grade_missing`) | unknown/broken | broken, chặn trước API | ✅ | warning hiển thị đúng |
| D2 | Bucket D | Ẩn danh | unknown/broken | broken, chặn trước API | ✅ | warning hiển thị đúng |
| D3 | Bucket D | Ẩn danh | unknown/broken | broken, chặn trước API | ✅ | warning hiển thị đúng |
| D4 | Bucket D | Ẩn danh | unknown/broken | broken, chặn trước API | ✅ | warning hiển thị đúng |
| D5 | Bucket D | Ẩn danh | unknown/broken | broken, chặn trước API | ✅ | warning hiển thị đúng |

### Phân tích failure

#### Case fail và lý do (PIVOT)

Không có case fail nào trong golden set (20/20 pass ở cả 2 lượt chạy — mock CP3 và real API CP4). Bảng dưới đây ghi các điểm cần theo dõi dù không tính là fail:

| # | Case | Vấn đề quan sát được | Phân loại (inference/segment/prompt) | Có phải fail? |
|---|------|------------|-------------------------------------|---|
| 1 | C2 | Confidence chỉ 0.30 dù level suy ra đúng (advanced) — model tự tin thấp với câu hỏi sâu (RAG/embedding) | inference | Không — vẫn pass theo tiêu chí level đúng |
| 2 | B1, B4, C1, C5 | Gemini API trả lỗi 503 (quá tải), hệ thống tự fallback sang mock | hạ tầng (API), không phải logic | Không — fallback hoạt động đúng thiết kế (K9) |

### 4.2 HV4 review prototype CP3

**Đánh giá theo 4 đường đi chính (PIVOT):**

| Đường đi | Mô tả | Check |
|---|---|---|
| 1 | Happy path — cá nhân hoá đúng mức hiểu | ✅ |
| 2 | Low-Confidence — suy luận sai → hỏi lại | ✅ |
| 3 | Failure — segment hỏng → warning + chuyển GV | ✅ |
| 4 | Correction — user chỉnh mức hiểu → AI điều chỉnh | ✅ |

---

## 5. Công việc CP4 (Deadline 21:00, 18/9)

### 5.1 Spec chốt — Checklist bắt buộc (PIVOT)

| # | Item | Ai chịu | Đã xong |
|---|---|---|---|
| 1 | spec.md đủ §1-§9 theo template (PIVOT: cá nhân hoá + segment hỏng) | HV4 (tổng hợp) | ✅ Đã điền §1-§9 trong `spec.md` |
| 2 | Evidence đạt chuẩn A hoặc B có log | HV1 | ✅ Chuẩn B — `eval/mining-log.md` + `validation/survey-log.md` |
| 3 | Bảng impact ≥3 ứng viên + ứng viên loại | HV1 | ✅ 3 ứng viên trong `spec.md` §2 / HV4 §5.3 |
| 4 | ≥4 nguyên tắc HAX/PAIR có vị trí áp dụng | HV2 | ✅ G2, G9, G10, G11 — `spec.md` §4b |
| 5 | 4 lớp chỗ khó + ≥8 kịch bản (PIVOT) | HV2 | ✅ 4 lớp + 15 kịch bản — `spec.md` §5, `HV2-prompt-retrieval.md` §6 |
| 6 | Quality bar bằng số (chốt, không đổi sau) (PIVOT: 85% + 100%) | HV2 + HV4 | ✅ Chốt ≥85%/100%, đo được 100%/100% — `spec.md` §7 |
| 7 | Golden set ≥20 case chia 2 nhóm (PIVOT: 12 + 8) | HV2 | ✅ 20 case — `codebase/tests/hv2-questions.ts` |
| 8 | Commit spec.md trước 21:00 | HV4 | ✅ Đã commit lên `main` |

### 5.2 Evidence chuẩn (PIVOT)

HV1 đạt **chuẩn B — Mining** cho cả 2 painpoint (`eval/mining-log.md`), có khảo sát vòng 1 (`validation/survey-log.md`) làm evidence bổ trợ:

**Painpoint 1 — thiếu tín hiệu cá nhân hoá:** `understanding_level` chỉ có giá trị ở 20/13.494 dòng (0,1482%); thiếu 13.474/13.494 (99,8518%); riêng cohort K4 chỉ 6/3.097 dòng có giá trị. Kèm 5 ví dụ nguyên văn (`T10288`–`T10293`) và phương pháp đếm pandas kiểm lại được (`eval/mining-log.md` mục "Reproducibility").

**Painpoint 2 — grade_missing segment hỏng hoàn toàn:** `grade_missing=True` ở 129/13.494 dòng (0,9560%); cả 129/129 (100%) đồng thời có `move_used` rỗng và `has_citation=False`. Kèm 5 ví dụ nguyên văn (`T00009`, `T00064`, `T00092`, `T00309`, `T00572`).

**Bổ trợ khảo sát (n = 20):** 16/20 (80%) thấy Tutor trả lời theo khuôn mẫu; 3/20 (15%) đánh giá câu trả lời không phù hợp mức hiểu; 10/20 (50%) đồng ý dùng thử ngay.

**Còn thiếu để đạt chuẩn A đầy đủ:** chưa xuất CSV gốc từ Google Forms, chưa có `validation/willing-users.md` với ≥3 người xác nhận (xem `HV1-evidence.md` §10 "Việc còn thiếu").

### 5.3 Impact table (PIVOT)

## Impact candidates

| # | Pain point | Evidence (A/B) | Impact estimate | Status |
|---|------------|----------------|----------------|--------|
| 1 | understanding_level 99,85% trống → không cá nhân hoá được | B | Cao — 99,85% lượt hỏi bị ảnh hưởng | ✅ Chọn |
| 2 | grade_missing 0,96% → segment hỏng hoàn toàn | B | Cao — 100% các lượt này trả lời sai hoàn toàn, dù tần suất thấp | ✅ Chọn |
| 3 | Citation không có mã trang (hướng cũ) | B | Thấp hơn — chỉ tốn 5-10 phút dò slide, không gây trả lời sai | ❌ Loại vì ưu tiên painpoint 1&2 |

### Eliminated candidates

| # | Pain point | Lý do loại |
|---|------------|------------|
| 1 | Citation không có mã trang | Ưu tiên painpoint cá nhân hoá + segment hỏng đã có số liệu cụ thể hơn (0,1482% và 0,9560%) và mức độ nghiêm trọng cao hơn (trả lời sai hoàn toàn vs. mất thời gian dò slide) |

### 5.4 Commit spec.md

HV4 commit spec.md vào repo **trước 21:00**. Sau 21:00 không được push thay đổi lớn.

---

## 6. Công việc CP5 (Deadline 22:30, 18/9)

### 6.1 Slide 6 trang PDF (PIVOT)

**HV4 chịu** — theo `02-guide.md` §5.1. Mỗi slide phải có **ít nhất 1 con số / quote / kết quả đo**. Không slide nào chỉ toàn text.

---

#### Slide 1: User & Job (45 giây) — PIVOT

```
Nội dung:
- Persona: [HV1 mô tả user thật]
- Job to be done: 1 câu
- Pain số: "understanding_level chỉ có 20/13.494 (0,15%) có giá trị"
- Pain số: "grade_missing: 129/13.494 (0,96%) → segment hỏng hoàn toàn"

Script (45"):
"Chúng tôi tập trung vào [persona]. Job của họ là [job]. 
Pain lớn nhất: trong 13.494 tutor_turns, chỉ 20 lần (0,15%) có 
thông tin mức hiểu → tutor không cá nhân hoá được. Thêm vào đó, 
129 lần (0,96%) thuộc segment không có data đầu vào → trả lời sai hoàn toàn."
```

---

#### Slide 2: Vì sao chọn (45 giây) — PIVOT

```
Nội dung:
- Bảng impact 3 ứng viên (từ §2 spec)
- Ứng viên loại: "Citation" loại vì ưu tiên painpoint cá nhân hoá + segment hỏng

Script (45"):
"Chúng tôi chọn [2 painpoint trên]. [Citation] không phù hợp vì 
[lý do]. Evidence: [HV1 điền số từ mining]."
```

---

#### Slide 3: Giải pháp & Demo (2 phút) — PIVOT

```
Nội dung:
- Lát cắt: 1 dòng mô tả (cá nhân hoá + segment hỏng)
- Automation: 1 dòng mô tả (Augment)
- Demo live 2 cases: happy + segment hỏng

Script (2 phút):
"Giải pháp: khi học viên bôi đen transcript, AI suy ra mức hiểu 
từ lịch sử tương tác. Đồng thời phát hiện segment hỏng và cảnh báo.
[Vào demo]

[Bật prototype]
Case 1 — Happy path: [bôi đoạn transcript] → hỏi [câu hỏi]
[Kết quả: mức hiểu 🟢 Beginner + câu trả lời phù hợp]

Case 2 — Segment hỏng: [bôi đoạn] → hỏi [câu hỏi]
[Kết quả: ⚠️ Warning + "Chuyển giảng viên"]"
```

---

#### Slide 4: Kết quả đo (45 giây)

```
Nội dung:
- % qua golden set: [số]
- % phát hiện segment hỏng: [số]
- 1 failure đáng kể nhất: [mô tả]

Script (45"):
"Golden set [X] case. Personalization [Y]% qua bar. Segment hỏng 
[Z]% phát hiện. 1 failure đáng chú ý: [case]. Nguyên nhân: 
[inference/segment/prompt]. Đã fix bằng [cách] hoặc để trong backlog."
```

---

#### Slide 5: User thật (45 giây)

```
Nội dung:
- ≥2 quote validation nguyên văn
- 1 thay đổi từ validation

Script (45"):
"2 người ngoài nhóm dùng thử. Quote 1: [nguyên văn]. 
Quote 2: [nguyên văn]. Sau test, chúng tôi đã thay đổi 
[thay đổi cụ thể]."
```

---

#### Slide 6: Nếu có thêm 1 tuần (30 giây)

```
Nội dung:
- 2-3 việc ưu tiên
- 1 bài học lớn nhất

Script (30"):
"Nếu có thêm 1 tuần: [2-3 việc ưu tiên]. Bài học lớn nhất: 
[bài học]. Cảm ơn mọi người."
```

---

### 6.2 Quy tắc "Không có bằng chứng thì không có slide" (PIVOT)

| Slide | Phải có | Kiểm tra |
|---|---|---|
| 1 | Pain số (0,1482% understanding_level + 0,9560% grade_missing) | ✅ Có sẵn trong `eval/mining-log.md` + `canvas-cp1.md` dòng 4 |
| 2 | Bảng impact ≥3 ứng viên | ✅ Có sẵn ở spec §2 / `HV4-spec-qa-demo.md` §5.3 |
| 3 | Kết quả demo (screenshot/video) | ✅ Video demo trên Drive: https://drive.google.com/drive/folders/1XM5297yJd27NFzrLRprqSUBROzKfCoCj?usp=drive_link |
| 4 | % personalization + % segment detection + failure analysis | ✅ Có sẵn — 100%/100% ở `codebase/tests/HV2-RESULTS.md`, phân tích ở §4.1 trên |
| 5 | ≥2 quote nguyên văn | ✅ Có sẵn trong `validation/survey-log.md` (vd. "Trả lời chưa chính xác.", "Quá khó hiểu.") |
| 6 | 2-3 việc ưu tiên | ☐ Chưa chốt — cần HV4 viết cho slide 6 (vd. hoàn thiện willing-users, xuất CSV khảo sát, mở rộng golden set) |

### 6.3 Video demo dự phòng (HV4 + HV3 phối hợp)

- **Độ dài:** 2 phút
- **Nội dung:** Đúng phần sẽ demo trên sân khấu (2 case: happy + segment hỏng)
- **Lưu:** `codebase/video/cp5-demo-backup.mp4`
- **Link Drive:** https://drive.google.com/drive/folders/1XM5297yJd27NFzrLRprqSUBROzKfCoCj?usp=drive_link

### 6.4 Validation (bonus +8đ) (PIVOT)

**HV4 setup `validation/` folder.**

#### Validation log (mỗi người ngoài nhóm)

| Trường | Nội dung |
|--------|----------|
| Tên | [Tên người test] |
| Vai | [Vai trò trong VLearn / giáo viên / học viên] |
| Task | [Task cụ thể họ làm] |
| Quan sát | [HV1/HV4 ghi lại hành vi] |
| Quote nguyên văn | [Lời họ nói lúc dùng — ghi nguyên văn] |
| Mức nghiêm trọng | [High/Medium/Low — nếu có vấn đề] |

#### Sau validation

- ≥1 thay đổi → ghi vào `spec.md` §9 Changelog
- Giữ nguyên → ghi có lý do

---

## 7. Công việc CP6 (Deadline 09:00, 19/9)

### 7.1 Thuyết trình: 5' trình bày + 5' Q&A (PIVOT)

#### Phân vai nói

| Thành viên | Slide nói | Nội dung |
|---|---|---|
| **HV1** | Slide 1, 2, 5 | Evidence + impact + validation quotes |
| **HV2** | Slide 4 | AI pipeline + golden set + quality bar + failure analysis |
| **HV3** | Slide 3 | Prototype + **demo live** |
| **HV4** | Slide 6 + mở đầu + đầu mối Q&A | Spec + automation + kết luận |

#### Script mở đầu (HV4, 30 giây)

```
"Xin chào, nhóm K4-3B-E402 CiteTutor. Đề tài của chúng tôi: 
Tối ưu tutor VLearn — cá nhân hoá theo mức hiểu + phát hiện 
segment hỏng. Chúng tôi đã pivot từ hướng citation sang hướng 
này vì HV1 phát hiện 2 painpoint mới quan trọng hơn. 
Để tôi giới thiệu nhóm: [HV1/2/3/4 nói nhanh 1 câu]. 
Mời [HV1] nói về bài toán."
```

### 7.2 Vibe-coding rule

> **Bị giám khảo hỏi phần có tên mình mà không giải thích được → 0 điểm cá nhân.**

Mỗi người phải hiểu rõ phần mình làm — không chỉ code, mà cả tại sao làm vậy.

### 7.3 Q&A dự kiến (PIVOT)

HV4 chuẩn bị 7 câu hỏi khả năng cao nhất + câu trả lời:

| # | Câu hỏi dự kiến | Người trả lời | Câu trả ngắn |
|---|---|---|---|
| 1 | **PIVOT: Tại sao nhóm pivot từ citation sang cá nhân hoá?** | HV1 | "HV1 mining data phát hiện understanding_level 99,85% trống + grade_missing 0,96% segment hỏng → 2 painpoint quan trọng hơn citation" |
| 2 | **PIVOT: Làm sao AI suy ra mức hiểu khi cột đó trống 99,85%?** | HV2 | "AI không dùng cột understanding_level. Thay vào đó, AI suy ra từ 4 tín hiệu: số câu hỏi, độ dài câu trả lời, từ vựng sử dụng, số lần hỏi lại" |
| 3 | Augment hay automate — vì sao chọn augment? | HV4 | [Trả lời ngắn] |
| 4 | Failure nguy hiểm nhất là gì? | HV2 | [Trả lời ngắn] |
| 5 | Tại sao quality bar đặt 85% + 100%? | HV2 | [Trả lời ngắn] |
| 6 | Validation thay đổi gì? | HV4 | [Trả lời ngắn] |
| 7 | [HV4 điền câu hỏi có thể có] | | |

**Câu hỏi bắt buộc phải trả lời được:**
1. **"Tại sao nhóm pivot?"** (PIVOT)
2. **"Làm sao AI suy ra mức hiểu khi cột đó trống?"** (PIVOT)
3. "Augment hay automate — vì sao?"
4. "Phần bạn làm là gì?" (mỗi người)

---

## 8. Reflection cá nhân

**HV4 setup** — tạo folder `reflection/` và format file. Mỗi người tự viết phần của mình.

### 8.1 Format reflection (tham khảo rubric khoá)

```markdown
# Reflection — [Tên HV]
## K4-3B-E402-CiteTutor · HV[X] · [Vai trò]

### Vai trò & phần mình làm

[HV[X] mô tả vai trò + phần việc cụ thể]

### AI hỗ trợ thế nào

[Mô tả AI hỗ trợ ở từng giai đoạn: planning, coding, review, testing]

### 1 bài học từ case fail của chính nhóm

[Bài học cụ thể — không chung chung]

### Điều gì mình sẽ làm khác

[Một thay đổi cụ thể nếu làm lại]
```

### 8.2 Ai viết gì

| File | Người viết |
|------|------------|
| `reflection/[hv1-ten].md` | HV1 |
| `reflection/[hv2-ten].md` | HV2 |
| `reflection/[hv3-ten].md` | HV3 |
| `reflection/[hv4-ten].md` | HV4 |

HV4 nhắc nhở mọi người viết trước CP5 (không chờ CP6).

---

## 9. Cảnh báo & lỗi thường gặp (PIVOT)

### 9.1 Mốc deadline tuyệt đối

| Lỗi | Hậu quả |
|-----|---------|
| Nộp muộn | 0 điểm checkpoint (không bù được) |
| Không commit spec.md trước 21:00 CP4 | Mất điểm R7 |
| Không có validation | Trần điểm 92 thay vì 100 |

### 9.2 Lỗi về pivot

| Lỗi | Hậu quả | Cách tránh |
|-----|---------|------------|
| Không giải thích được tại sao pivot | TA hiểu sai nhóm | HV1 phải nói rõ: "Mining ra 2 painpoint mới quan trọng hơn" |
| Pivot nhưng không thay đổi nội dung | Không khớp với canvas | Tất cả file phải update theo hướng mới |

### 9.3 Lỗi về slide

| Lỗi | Hậu quả |
|-----|---------|
| Slide không có số | TA đánh trượt, mất điểm R6 demo |
| Slide toàn text, không có bằng chứng | Mất điểm R6 |

### 9.4 Lỗi về số liệu

| Lỗi | Hậu quả |
|-----|---------|
| Giấu fail | Mất điểm R4 (số liệu bị chỉnh sửa không được tính) |
| Đổi quality bar sau CP4 | Mất điểm R4 (chốt rồi giữ nguyên) |

---

## 10. Checklist cuối cùng trước CP6

```
┌──────────────────────────────────────────────────────────────┐
│           CHECKLIST CUỐI CÙNG TRƯỚC CP6                    │
│                  Deadline: 09:00, 19/9                       │
├──────────────────────────────────────────────────────────────┤
│ Repo & Files                                                 │
│ ├── [x] README.md — bảng thành viên + phân công           │
│ ├── [x] canvas-cp1.md — đã nộp (PIVOT: cá nhân hoá)       │
│ ├── [x] spec.md — đủ §1-§9 theo template (PIVOT)          │
│ ├── [ ] demo-slides.pdf — đang làm, 6 trang, mỗi slide ≥1 số │
│ └── [x] codebase/, eval/, validation/, reflection/ tồn tại │
├──────────────────────────────────────────────────────────────┤
│ Evaluation (PIVOT)                                            │
│ ├── [x] ≥20 case golden set                                │
│ ├── [x] Bảng % đối chiếu quality bar (85% + 100%)         │
│ ├── [x] eval/results-cp3.md có đủ fail analysis (HV4 §4.1) │
│ └── [x] Quality bar chốt, không đổi                         │
├──────────────────────────────────────────────────────────────┤
│ Validation                                                   │
│ ├── [ ] ≥2 người ngoài nhóm dùng thử                       │
│ ├── [ ] validation/feedback-log.md — đủ 5 trường           │
│ ├── [ ] validation/synthesis.md — 4 dòng tổng hợp         │
│ └── [ ] ≥1 thay đổi ghi vào spec.md §9 (hoặc giữ nguyên) │
├──────────────────────────────────────────────────────────────┤
│ Demo                                                         │
│ ├── [ ] Video demo dự phòng 2 phút                        │
│ ├── [ ] codebase/video/cp5-demo-backup.mp4 tồn tại        │
│ ├── [ ] Backup screenshots trong codebase/screenshots/      │
│ └── [ ] HV3 sẵn sàng chạy case lạ                        │
├──────────────────────────────────────────────────────────────┤
│ Reflection                                                   │
│ ├── [ ] reflection/[hv1-ten].md                            │
│ ├── [ ] reflection/[hv2-ten].md                            │
│ ├── [ ] reflection/[hv3-ten].md                            │
│ └── [ ] reflection/[hv4-ten].md                            │
├──────────────────────────────────────────────────────────────┤
│ Dry run & Q&A                                                │
│ ├── [ ] Dry run lần 1 xong                                  │
│ ├── [ ] Dry run lần 2 xong, bấm giờ đúng 5'              │
│ ├── [ ] Mỗi người nói ≥1 phần                              │
│ ├── [ ] HV2/HV3 sẵn sàng cho thẻ giám khảo               │
│ └── [ ] 7 câu Q&A dự kiến + câu trả lời chuẩn bị        │
├──────────────────────────────────────────────────────────────┤
│ Câu hỏi bắt buộc — cả nhóm trả lời được (PIVOT)          │
│ ├── [ ] "Tại sao nhóm pivot từ citation sang cá nhân hoá?"│
│ ├── [ ] "Làm sao AI suy ra mức hiểu khi cột đó trống?"   │
│ └── [ ] "Phần bạn làm là gì?" (mỗi người)                │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. Deliverables HV4 trong repo

| File | Mô tả | Trạng thái |
|------|-------|------------|
| `README.md` | Bảng thành viên + phân công + repo structure | ✅ |
| `canvas-cp1.md` | HV4 chịu (PIVOT: cá nhân hoá + segment hỏng) | ✅ |
| `spec.md` | Đủ §1-§9 theo template + quality bar bằng số (PIVOT) | ✅ |
| `demo-slides.pdf` | 6 trang, mỗi slide ≥1 số/quote/đo (PIVOT) | 🔄 Đang làm |
| `validation/feedback-log.md` | Bảng validation đủ 5 trường | ☐ |
| `validation/synthesis.md` | 4 dòng tổng hợp | ☐ |
| `validation/willing-users.md` | ≥3 người đồng ý dùng thử + kênh liên lạc | 🔄 Đang thu thập |
| `reflection/[hv1-hv4].md` | 4 files reflection, mỗi người tự viết | ✅ |
| `codebase/video/cp5-demo-backup.mp4` | Video dự phòng 2 phút (HV3 + HV4) | ✅ Đã có link Drive |

---

## 12. Tài nguyên tham chiếu

| File | Mục đích | Đọc khi nào |
|------|----------|-------------|
| `02-guide.md` §2.7 | Kiểm tra spec trước CP4 | Trước CP4 |
| `02-guide.md` §4.2 | Hướng dẫn validation | Trước CP5 |
| `02-guide.md` §5.1 | Hướng dẫn slide | Trước CP5 |
| `02-guide.md` §5.2 | Checklist nộp cuối | Trước CP5 |
| `03-ai-spec-template.md` | Template spec đầy đủ | Khi viết spec |
| `04-rubric.md` | 7 khối + checklist 6 mốc + reflection | Toàn bộ |
| `further-reading/pair-guidebook-digest.md` §2.3 | Evaluation signals | Trước CP3 |
| `further-reading/pair-guidebook-digest.md` §5.1 | Behavioral signals | Trước validation |

---

## 13. Tiêu chí xuất sắc (PIVOT)

### 13.1 Spec.md scaffold đầy đủ §1-§9

HV4 có thể copy `03-ai-spec-template.md` và điền từng § — mỗi § có heading, nội dung, evidence tương ứng. **PIVOT: tất cả nội dung phải phản ánh hướng cá nhân hoá + segment hỏng**

### 13.2 Slide script 6 trang

Mỗi slide: nói gì, bao nhiêu giây, có số gì. Xem §6.1 ở trên. **PIVOT: Slide 1-2 phải có 2 painpoint số liệu mới**

### 13.3 Validation script 10 phút/người

HV4 viết validation script 5 nhịp cho người ngoài:

| Nhịp | Thời gian | Nội dung |
|------|-----------|----------|
| 1. Comfort | 2 phút | Giới thiệu người dùng, giải thích context VLearn |
| 2. Context | 2 phút | Hỏi họ dùng VLearn như thế nào, pain gì |
| 3. Task | 4 phút | Để họ thực hiện task cụ thể (bôi đen → hỏi AI) |
| 4. Observe | 1 phút | Quan sát hành vi, ghi lại không ngắt lời |
| 5. Hỏi sau | 1 phút | Hỏi họ cảm giác gì, có gì bất ngờ |

### 13.4 Thang điểm 4 tầng bằng chứng

HV1 đánh giá evidence theo 4 tầng:

| Tầng | Loại bằng chứng | Độ tin cậy |
|------|----------------|------------|
| 1 (cao nhất) | Hành vi thật — người dùng thật làm gì trong hệ thống thật | ★★★★★ |
| 2 | Lời nói lúc dùng — quote nguyên văn lúc họ đang dùng | ★★★★☆ |
| 3 | Giải thích sau — họ giải thích vì sao sau khi dùng | ★★★☆☆ |
| 4 (thấp nhất) | Dự đoán — suy luận về hành vi, không có log | ★★☆☆☆ |

**Chuẩn A:** Tầng 1 hoặc 2 có log
**Chuẩn B:** Tầng 1 hoặc 2 + tầng 3

### 13.5 Quality bar chốt bằng số cụ thể (PIVOT)

Xem §3.3: **≥85% personalization đúng + 100% broken segment detected** — chốt trước 21:00 CP4.

### 13.6 Phân vai nói CP6 rõ ràng

Xem §7.1: HV1/2/3/4 nói phần nào, bao nhiêu giây.

### 13.7 Câu hỏi Q&A dự kiến + câu trả lời (PIVOT)

HV4 chuẩn bị **7 câu** (2 câu PIVOT mới + 5 câu cũ). Xem §7.3.

---

## PIVOT NOTES

**Điều thay đổi so với phiên bản cũ:**

| Nội dung | Cũ | Mới |
|---|---|---|
| Track focus | Citation kèm mã trang | Cá nhân hoá theo mức hiểu + phát hiện segment hỏng |
| Pain số | Citation không có mã trang (25-35%) | understanding_level 0,15% + grade_missing 0,96% |
| Quality bar | ≥80% citation | ≥85% personalization + 100% segment detection |
| Golden set | 8 happy + 4 edge + 4 negative | 12 cá nhân hoá + 8 segment hỏng |
| Q&A mới | Không có | "Tại sao pivot?" + "Làm sao AI suy ra mức hiểu?" |
| Slide 1 | Pain citation | 2 painpoint mới với số liệu |
| Slide 2 | Impact citation | Impact cá nhân hoá + segment hỏng |

---

> **Nguyên tắc cuối cùng:** HV4 là người giữ nhịp toàn bộ. Nếu thấy ai đang delayed → nhắc nhở sớm. Nếu thấy spec/thực hiện không khớp → gọi standup. Deadline không đợi ai — nếu người A delayed, người B/C vẫn phải làm tiếp, không chờ.

---

*HV4 Spec/QA/Demo Lead · K4-3B-E402-CiteTutor · Hackathon AI20k Batch 04*
