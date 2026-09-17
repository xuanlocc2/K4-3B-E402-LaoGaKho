# Canvas CP1 — K4-3B-E402-CiteTutor

> **Track:** A1c — VLearn Tutor · **Lớp/Phòng:** 3B · E402  
> **Nhóm:** Hackathon AI20k Batch 04 · **Cụm:** K4-3B-E402  
> **Repo:** `K4-3B-E402-CiteTutor` *(tên tạm — nhóm có thể đổi)*  
> **Ngày:** 17/09/2026

---

## §1 · Canvas 7 Dòng (theo scaffold `02-guide.md` §1.5)

1. **Track + Đề:** A1c — VLearn Tutor: cá nhân hoá câu trả lời theo mức hiểu + phát hiện segment hỏng hoàn toàn, không bịa khi thiếu căn cứ. *(PIVOT: từ "citation kèm mã trang")*

2. **Job Executor:** Học viên K4 đang ngồi trong buổi học, đọc slide trên VLearn, vừa bôi đen một đoạn transcript hoặc nội dung chưa hiểu và cần làm rõ ngay để không bị tụt. *(Giữ nguyên)*

3. **Pain 1 câu:** Học viên K4 hỏi tutor để làm rõ đoạn vừa bôi đen · nhận câu trả lời không phù hợp trình độ (đôi khi quá dễ, đôi khi quá khó) hoặc không có căn cứ để trả lời · học sai kiến thức hoặc mất thời gian hỏi lại nhiều lần. *(PIVOT: 2 pain gộp 1)*

4. **Evidence đầu:** **HV1 mining (17/9):** Painpoint 1 — Cột `understanding_level` chỉ có 20/13.494 dòng (0,15%) có giá trị → tutor không cá nhân hoá được. Painpoint 2 — Cột `grade_missing`: 129/13.494 dòng (0,96%) → TOÀN BỘ 129 dòng có `move_used` rỗng VÀ `has_citation=False` 100% → segment "hỏng hoàn toàn". Chi tiết: `HV1-evidence.md` §2.2. *(PIVOT: 2 painpoint mới + số liệu cụ thể)*

5. **Lát cắt 1 câu:** Học viên K4 hỏi tutor · AI suy ra mức hiểu của học viên từ lịch sử tương tác (không dựa vào cột `understanding_level` đang trống 99,85%) → điều chỉnh độ sâu/độ khó câu trả lời · ĐỒNG THỜI nếu phát hiện thuộc nhóm không có điểm / không có dữ liệu đầu vào rõ ràng → nói rõ giới hạn và đề xuất hỏi giảng viên thay vì bịa. *(PIVOT: slice mới — cá nhân hoá + phát hiện segment hỏng)*

6. **AI tự làm đến đâu:** **TỰ LÀM:** suy ra mức hiểu từ lịch sử câu hỏi / độ dài câu trả lời user / số lần hỏi lại → điều chỉnh câu trả lời phù hợp · phát hiện segment thiếu data (`grade_missing`) và cảnh báo user. **KHÔNG TỰ:** giả vờ biết mức hiểu khi không đủ tín hiệu · trả lời khi user thuộc segment thiếu data mà không cảnh báo. **Cost-of-error:** cá nhân hoá sai → học viên học sai trình độ (quá dễ → chán / quá khó → nản) + segment hỏng → tutor trả sai hoàn toàn → trust collapse. Sai này đắt hơn việc từ chối nói rõ giới hạn. *(PIVOT: AI tự/không tự mới)*

7. **Phân công:** **[HV1]** — Evidence: mining `understanding_level` + `grade_missing` + trích ≥5 ví dụ mỗi painpoint + khảo sát mới · **[HV2]** — Prompt: infer understanding logic + detect broken segment + system prompt + ≥8 kịch bản rủi ro · **[HV3]** — Prototype: 4 paths (Happy/Low-Conf/Failure/Correction) + hiển thị mức hiểu + warning segment hỏng · **[HV4]** — Spec/QA/Demo: spec §1-§9 + golden set ≥20 case + quality bar ≥85% personalization + 100% broken detection. *(PIVOT: phân công mới)*

> **Comment chuẩn đạt:**
> - Dòng 1: đúng track A1c, đề cụ thể (cá nhân hoá + segment hỏng)
> - Dòng 2: một vai đang làm một việc cụ thể (bôi đen đoạn chưa hiểu)
> - Dòng 3: pain gộp 2 vấn đề (không cá nhân hoá + segment hỏng) với số liệu cụ thể
> - Dòng 4: CÓ evidence với số cụ thể (0,15%, 129/13.494)
> - Dòng 5: đúng 1 user · 1 việc · 2 quyết định AI (cá nhân hoá + phát hiện segment) · 1 kết quả
> - Dòng 6: nói rõ AI *không* làm gì (giả vờ hiểu / trả khi thiếu data)
> - Dòng 7: mỗi việc một tên placeholder với scope mới

---

## §2 · Acceptance Criteria (Gherkin Format)

> Mỗi AC có ≥3 bước Given/When/Then cụ thể. Đủ happy / edge / negative.

### AC1 — Happy Path: Cá nhân hoá đúng mức hiểu

```
Feature: Tutor cá nhân hoá câu trả lời theo mức hiểu

  AC1: Tutor điều chỉnh độ sâu câu trả lời đúng với mức hiểu được suy ra từ lịch sử
  =========================================================================================
  Given học viên K4 đã hỏi 3 câu về cùng một chủ đề trong buổi học
  And lịch sử câu hỏi cho thấy user đang ở mức "mới bắt đầu" (câu hỏi ngắn, từ vựng đơn giản)
  When học viên bôi đen đoạn "backpropagation algorithm" và hỏi "giải thích"
  Then hệ thống suy ra mức hiểu: beginner (dựa trên lịch sử 3 câu ngắn)
  And trả lời với độ sâu phù hợp: giải thích từ gốc (backprop = lan truyền ngược)
  And kèm ví dụ đơn giản (analogy với đời thường)
  And hiển thị: "Mình thấy bạn đang ở mức mới bắt đầu, nên mình giải thích chi tiết nhé 🟢"
```

> **Đạt tiêu chí:** Given cụ thể (lịch sử 3 câu) · When 1 hành động · Then có message text + mức hiểu được hiển thị

---

### AC2 — Edge Case: Suy luận sai mức hiểu → user phản hồi → AI điều chỉnh

```
Feature: Tutor xử lý khi suy luận sai mức hiểu

  AC2: Tutor nhận ra suy luận sai từ phản hồi user và điều chỉnh câu trả lời
  ===================================================================================
  Given học viên K4 đã hỏi 2 câu đơn giản
  And hệ thống suy ra mức hiểu: beginner
  When học viên trả lời một câu hỏi của tutor bằng thuật ngữ chuyên môn ("gradient descent sử dụng chain rule")
  Then hệ thống nhận ra tín hiệu: user có kiến thức nền tảng (dùng thuật ngữ đúng)
  And điều chỉnh: hỏi lại "Bạn có kiến thức nền tảng rồi, mình tăng độ khó nhé?"
  And user xác nhận hoặc điều chỉnh mức hiểu
```

> **Đạt tiêu chí:** Edge case về suy luận sai mức hiểu · có hành vi rõ (hỏi lại + điều chỉnh) · user có quyền phản hồi

---

### AC3 — Negative Path: Phát hiện segment hỏng → từ chối + chuyển GV

```
Feature: Tutor phát hiện segment hỏng (thiếu data đầu vào)

  AC3: Tutor từ chối và chuyển hướng khi phát hiện user thuộc segment không có điểm/grade
  ===========================================================================================
  Given học viên K4 thuộc nhóm `grade_missing=True` (không có điểm trong hệ thống)
  And không có lịch sử tương tác trước đó
  When học viên hỏi "câu hỏi cụ thể về bài giảng"
  Then hệ thống kiểm tra: grade_missing = True AND lịch sử = rỗng
  And hiển thị: "Mình nhận thấy bạn chưa có điểm trong hệ thống và mình không có lịch sử tương tác với bạn. Mình không thể suy ra mức hiểu của bạn một cách chính xác."
  And hiển thị: "Để trả lời đúng cho bạn, mình đề xuất bạn hỏi giảng viên trực tiếp nhé. Giảng viên sẽ biết bạn đang ở mức nào."
  And hiển thị 2 lựa chọn: "[1] Chuyển câu hỏi cho giảng viên" · "[2] Trả lời với mức mặc định (không cá nhân hoá)"
  And KHÔNG trả lời với giả định về mức hiểu
```

> **Đạt tiêu chí:** Negative path rõ ràng · message text cụ thể · 2 lựa chọn cho user · không giả vờ biết

---

## §3 · INVEST Self-Check cho dòng "Lát cắt"

| Tiêu chí INVEST | Đạt? | Ghi chú |
|---|---|---|
| **Independent** | ✅ Có | Lát cắt này độc lập với các feature khác của VLearn (quiz AI, learning trace). Test được riêng với mock history + grade_missing flag. |
| **Negotiable** | ✅ Có | Tiêu chí "suy ra mức hiểu" và "phát hiện segment hỏng" còn để HV2/HV3 refine. Prompt có thể điều chỉnh sau khi có evidence. |
| **Valuable** | ✅ Có | Giải quyết pain thật: HV không được cá nhân hoá (99,85% missing) + segment hỏng (0,96%). Kết quả đo được: % cá nhân hoá đúng + % phát hiện segment hỏng. |
| **Estimable** | ✅ Có | HV3 ước lượng: infer logic (1 ngày) + detect segment (0.5 ngày) + UI + test (1 ngày) = ~2.5 ngày. Có data pack để mock. |
| **Small** | ✅ Có | Một câu hỏi · hai quyết định AI (cá nhân hoá + segment hỏng) · một kết quả. Không gộp thêm "gom nhóm hỏi bài" hay "sinh quiz". |
| **Testable** | ✅ Có | 3 AC Gherkin đủ coverage happy/edge/negative. Golden set ≥20 case (HV4 chuẩn bị). Quality bar: ≥85% personalization đúng + 100% broken segment detected. |

> **Comment:** Không có ⚠️ nào. Lát cắt đạt đủ 6/6 tiêu chí INVEST.

---

## §4 · Anti-Patterns đã tránh trong Canvas này

| Anti-Pattern | Cách tránh trong canvas này |
|---|---|
| ❌ "User nói chung" thay vì vai cụ thể | ✅ Dòng 2: "học viên K4 đang ngồi trong buổi học, đọc slide, vừa bôi đen đoạn chưa hiểu" — có hành động, có bối cảnh |
| ❌ Pain không đo được | ✅ Dòng 3: "quá dễ / quá khó / mất thời gian hỏi lại" — có thể đo bằng % cá nhân hoá |
| ❌ AI "luôn cá nhân hoá" mà không nói gì khi không đủ tín hiệu | ✅ Dòng 6: "KHÔNG TỰ: giả vờ biết mức hiểu khi không đủ tín hiệu" — rõ ràng |
| ❌ Canvas gộp nhiều việc vào 1 dòng | ✅ Dòng 5: chỉ 1 việc (làm rõ đoạn bôi đen) · 2 quyết định AI (cá nhân hoá + phát hiện segment) · 1 kết quả (câu trả lời phù hợp hoặc từ chối) |
| ❌ Evidence chỉ có "cảm giác" | ✅ Dòng 4: có số liệu cụ thể (0,15%, 129/13.494) từ HV1 mining |
| ❌ AC dùng từ mơ hồ ("nhanh", "đẹp", "tốt") | ✅ 3 AC dùng Given/When/Then cụ thể, có mức hiểu, có message text |
| ❌ "AI luôn làm được" mà không nói sẽ từ chối thế nào | ✅ AC3: message text cụ thể + 2 lựa chọn cho user |
| ❌ Phân công chung chung | ✅ Dòng 7: mỗi việc một tên placeholder [HV1/2/3/4] — biết ai làm gì với scope mới |

---

## §5 · Sanity Check 5 câu (theo BA Zone quality-checklist.md)

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | **Stakeholder hiểu được không?** | ✅ PO / TA đọc canvas hiểu: job executor là ai, pain là gì, AI làm gì và không làm gì, evidence đã có với số cụ thể. Không cần kỹ thuật cũng hiểu được. |
| 2 | **Dev estimate được không?** | ✅ HV3 ước lượng được: infer logic (1 ngày) + detect segment (0.5) + UI (0.5) + test (0.5) = ~2.5 ngày. HV2 đã có tiêu chí "suy ra mức hiểu" và "phát hiện segment hỏng". |
| 3 | **QA test được không?** | ✅ HV4 viết được ≥20 test case từ 3 AC Gherkin. Mỗi AC có Given/When/Then cụ thể, có mức hiểu, có message text. |
| 4 | **Có bị trùng story khác không?** | ✅ Không trùng. Track A1c khác A1a (tutor giải thích từ mới), A1b (tutor tóm tắt slide), A1d (tutor đặt câu hỏi ôn). Lát cắt này là về cá nhân hoá + phát hiện segment hỏng — không có nhóm nào cùng. |
| 5 | **"So that" có thật sự valuable không?** | ✅ Pain: không cá nhân hoá (99,85% trống) + segment hỏng (0,96%). Outcome: học viên nhận câu trả lời đúng trình độ → tiết kiệm thời gian → tin vào câu trả lời → không học sai. Đo được bằng % cá nhân hoá đúng + % phát hiện segment hỏng. |

---

## §6 · Checklist đối chiếu 5 tiêu chí nghiệm thu CP1

| # | Tiêu chí nghiệm thu CP1 | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | **Track + đề đã chọn** | ✅ Đạt | A1c — VLearn Tutor: cá nhân hoá + segment hỏng |
| 2 | **Evidence ban đầu (mầm)** | ✅ Có | CÓ — HV1 đã mining ra 2 painpoint mới với số cụ thể (0,15%, 129/13.494) |
| 3 | **Lát cắt 1 câu đúng format** | ✅ Đạt | 1 user · 1 việc · 2 quyết định AI (cá nhân hoá + segment hỏng) · 1 kết quả — đúng scaffold §1.5 |
| 4 | **AI tự làm / không tự làm + cost-of-error** | ✅ Đạt | TỰ LÀM (suy ra mức hiểu + phát hiện segment). KHÔNG TỰ (giả vờ hiểu khi thiếu tín hiệu). Lý do: cá nhân hoá sai = học sai trình độ + segment hỏng = trả sai hoàn toàn. |
| 5 | **Phân công có tên** | ✅ Đạt | HV1 (Evidence) · HV2 (Prompt) · HV3 (Prototype) · HV4 (Spec/QA/Demo) — placeholder, nhóm điền tên thật sau. |

> **Tổng kết:** 5/5 đạt ✅ — Canvas đã được pivot theo hướng mới

---

## §7 · Ví dụ Tutor Turn cụ thể (minh hoạ)

> Dưới đây là ví dụ minh hoạ để HV2/HV3 hiểu flow và HV4 viết golden set. Mã `T004/T005/T006` là mã mới theo hướng pivot.

### Tutor Turn T004 — Happy Path (cá nhân hoá đúng)

```
Session: K4-3B-E402
Transcript: transcript-03
User history: Đã hỏi 3 câu về "machine learning" (câu hỏi ngắn, từ đơn giản)

[USER] Bôi đen đoạn: "backpropagation"
Gõ: "backpropagation là gì vậy?"

[AI]
🔍 Mình suy ra: bạn đang ở mức **mới bắt đầu** (mình nhận thấy bạn hay hỏi những khái niệm cơ bản)

Mình giải thích chi tiết nhé:

**Backpropagation = lan truyền ngược**

Nghĩa là: khi model dự đoán sai, nó sẽ "đi ngược lại" từ đầu ra về đầu vào để 
sửa các trọng số. Giống như khi bạn đi sai đường, bạn quay lại tìm chỗ rẽ sai 
để lần sau đi đúng vậy.

Ví dụ đời thường: Bạn nấu ăn, món ăn mặn quá → bạn sẽ cho thêm nước (điều chỉnh) 
và giảm muối lần sau (học từ sai sót). Model cũng làm vậy!

🟢 Mức hiểu của bạn: Beginner
```

---

### Tutor Turn T005 — Edge Case (suy luận sai → user phản hồi → điều chỉnh)

```
Session: K4-3B-E402
Transcript: transcript-03
User history: Đã hỏi 2 câu đơn giản → AI suy ra: beginner

[USER] Bôi đen đoạn: "gradient descent"
Gõ: "gradient descent hoạt động kiểu gì?"

[AI - SUY LUẬN BEGINNER]
🔍 Mình suy ra: bạn đang ở mức **mới bắt đầu**

[AI trả lời với giả định beginner]

[USER - PHẢN HỒI BẰNG THUẬT NGỮ CHUYÊN MÔN]
"Bạn ơi, mình hiểu rồi, gradient descent dùng chain rule để tính gradient mà"

[AI - NHẬN RA TÍN HIỆU VÀ HỎI LẠI]
Hmm, mình nhận thấy bạn dùng thuật ngữ "chain rule" khá chính xác! 
Có phải bạn đã có kiến thức nền tảng về calculus rồi không?

Nếu có, mình sẽ tăng độ khó, giải thích sâu hơn nhé:
- Gradient descent = tìm điểm thấp nhất trên loss surface
- Sử dụng gradient để cập nhật weights theo hướng ngược lại

[USER] "Đúng rồi, cho mình mức khó hơn đi"

[AI - ĐIỀU CHỈNH MỨC]
✅ Đã cập nhật: Mức hiểu của bạn = Intermediate
Mình sẽ trả lời ở mức sâu hơn nhé!
```

---

### Tutor Turn T006 — Negative Path (segment hỏng → chuyển GV)

```
Session: K4-3B-E402
Transcript: transcript-03
User profile: grade_missing = True, lịch sử tương tác = rỗng

[USER] Bôi đen đoạn: "neural network architecture"
Gõ: "neural network architecture khác traditional programming chỗ nào?"

[AI - PHÁT HIỆN SEGMENT HỎNG]
🔍 Mình kiểm tra dữ liệu của bạn...

⚠️ Mình nhận thấy:
• Bạn chưa có điểm trong hệ thống VLearn
• Mình không có lịch sử tương tác trước đó với bạn

Mình không thể suy ra mức hiểu của bạn một cách chính xác. 
Nếu mình trả lời với giả định sai, bạn có thể nhận được câu trả lời 
quá dễ (bạn đã biết) hoặc quá khó (bạn chưa biết).

💡 Đề xuất: Bạn nên hỏi giảng viên trực tiếp. Giảng viên sẽ biết bạn 
đang ở mức nào và trả lời phù hợp nhất.

Bạn muốn:
  [1] Chuyển câu hỏi này cho giảng viên
  [2] Mình trả lời với mức mặc định (không cá nhân hoá)

📊 Trạng thái: Segment hỏng được phát hiện ✓
```

---

## §8 · Notes cho từng thành viên

### 📋 HV1 — Evidence (thu bằng chứng)

> **HV1 cần làm ngay trong giờ:**

- [ ] Đọc `data/vlearn-pack/chatlog/DATA_DICTIONARY.md` để hiểu cấu trúc data
- [ ] Đếm `understanding_level` có/không giá trị trong `tutor_turns.csv`
- [ ] Đếm `grade_missing` và kiểm tra đặc điểm kèm theo (move_used, has_citation)
- [ ] Trích ≥5 ví dụ dòng `grade_missing` (để chỉ ra "hỏng hoàn toàn")
- [ ] Trích ≥5 ví dụ cho thấy tutor không cá nhân hoá
- [ ] Khảo sát nhanh ≥15 học viên trong lớp:
  - Câu hỏi 1: "Câu trả lời tutor gần đây có phù hợp với trình độ của bạn không?"
  - Câu hỏi 2: "Bạn có gặp câu trả lời nào vô lý hoặc hiểu sai không?"
  - Ghi log: tên người trả lời + câu trả lời nguyên văn
- [ ] Cập nhật bảng đếm vào canvas dòng 4
- [ ] Báo cáo lại cho nhóm kết quả mining

---

### 📋 HV2 — Prompt & Retrieval

> **HV2 cần chuẩn bị sau khi HV1 thu xong evidence:**

- [ ] Thiết kế logic **suy ra mức hiểu** từ:
  - Lịch sử câu hỏi (số lần hỏi, độ dài câu hỏi, từ vựng sử dụng)
  - Độ dài câu trả lời user (dài = hiểu sâu)
  - Số lần hỏi lại cùng vấn đề
- [ ] Thiết kế logic **phát hiện segment hỏng**:
  - `grade_missing = True` + lịch sử = rỗng → segment hỏng
  - Không có căn cứ để trả lời (ngoài transcript)
- [ ] Viết system prompt:
  - Role: tutor cá nhân hoá theo mức hiểu
  - Rule 1: KHÔNG giả vờ biết mức hiểu khi không đủ tín hiệu
  - Rule 2: Phát hiện segment hỏng → từ chối + chuyển GV
- [ ] Chuẩn bị ≥8 kịch bản rủi ro (mới)
- [ ] Chuẩn bị 4 nguyên tắc HAX/PAIR với vị trí áp dụng cụ thể

---

### 📋 HV3 — Build/Prototype

> **HV3 cần build flow bấm được + ≥1 AI call thật:**

- [ ] Dựng 4 đường đi (Sketch hoặc Mock):
  - Happy: user đủ data → cá nhân hoá đúng
  - Low-Confidence: user phản hồi → AI điều chỉnh mức hiểu
  - Failure: segment hỏng → từ chối + chuyển GV
  - Correction: user chỉnh mức hiểu → AI điều chỉnh
- [ ] Thêm UI hiển thị "Mức hiểu của bạn: 🟢/🟡/🔴"
- [ ] Thêm warning UI khi thuộc segment hỏng
- [ ] Kết nối ≥1 AI call thật (Gemini API / API key khoá học):
  - Input: đoạn bôi đen + user history + grade status
  - Output: câu trả lời có/mức hiểu + message text theo AC
- [ ] Log trace: để HV4 đo quality bar
- [ ] Chuẩn bị mock data cho phần chưa kết nối

---

### 📋 HV4 — Spec/QA/Demo

> **HV4 cần chuẩn bị spec + golden set + demo:**

- [ ] Đọc `03-ai-spec-template.md` — chuẩn bị spec §1-§9 (PIVOT theo hướng mới)
- [ ] Viết golden set ≥20 case:
  - ≥12 case cá nhân hoá (đủ trình độ / quá dễ / quá khó / không rõ)
  - ≥8 case segment hỏng (ngoài phạm vi / thiếu data / yêu cầu chuyển GV)
- [ ] Đặt quality bar mới: "≥85% cá nhân hoá đúng + 100% segment hỏng được phát hiện"
- [ ] Chuẩn bị demo script:
  - Case 1: Happy path (cá nhân hoá đúng mức)
  - Case 2: Low-Confidence (suy luận sai → điều chỉnh)
  - Case 3: Failure path (segment hỏng → chuyển GV)
- [ ] Viết AC Gherkin đầy đủ (≥3 AC — đã có sẵn ở §2)

---

## §9 · Liên kết đến các file của thành viên khác

> **Nhóm điền đường dẫn thật sau khi tạo các file:**

| Thành viên | File | Đường dẫn (tạm) |
|---|---|---|
| [HV1] | Evidence report | `HV1-evidence.md` |
| [HV2] | Prompt & Retrieval spec | `HV2-prompt-retrieval.md` |
| [HV3] | Prototype / Build | `HV3-prototype.md` |
| [HV4] | Spec & Golden Set | `HV4-spec-qa-demo.md` |

---

## §10 · 4 Lớp Chỗ Khó (PIVOT - dự kiến sau mining)

| Lớp | Mô tả | Kịch bản rủi ro | Hành vi mong đợi | Nguyên tắc áp dụng |
|---|---|---|---|---|
| **1. Cá nhân hoá sai** | AI suy luận sai mức hiểu từ tín hiệu không đủ | User beginner nhưng AI trả ở mức expert | Hỏi lại user để xác nhận + cho user chỉnh mức | G9 — sửa dễ dàng |
| **2. Segment hỏng không phát hiện** | AI cố trả lời khi user thuộc segment thiếu data | User grade_missing=True nhưng AI vẫn "cá nhân hoá" | Phát hiện → từ chối + chuyển GV | G10 — thu hẹp phạm vi |
| **3. Tín hiệu mơ hồ** | Không đủ thông tin để suy ra mức hiểu | User mới hoàn toàn, không có lịch sử | Hỏi 1 câu để xác định mức hiểu | G2 — làm rõ mức độ |
| **4. Mức hiểu thay đổi nhanh** | User có kiến thức nền nhưng hỏi câu cơ bản (đang ôn tập) | User expert nhưng hỏi "lại từ đầu" | Cho phép user chỉnh mức hoặc hỏi lại | G1 — làm rõ hệ thống làm được gì |

---

> **Footer:**
> *Canvas CP1 — K4-3B-E402-CiteTutor · Hackathon AI20k Batch 04 · 17/09/2026*  
> *Placeholder: [HV1] [HV2] [HV3] [HV4] — nhóm điền tên thật sau khi chốt nhân sự*  
> **PIVOT NOTE:** Từ "tối ưu citation" → "cá nhân hoá theo mức hiểu + phát hiện segment hỏng"
