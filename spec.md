# Template AI Spec *(spec.md — commit trước hạn chốt spec: 21:00 18/9, tại CP4 · quality bar chốt từ thời điểm nộp)*

> Cấu trúc phủ đúng "SPEC 8 phần" của chương trình: Bằng chứng (§1-§2) · Lát cắt (§4) · Canvas (đính kèm CP1) · Augment/Automate (§4) · 4 đường đi của trải nghiệm (§6) · Kiểu lỗi (§5) · Kiểm thử (§7) · Phân công (§8). Hướng dẫn viết từng mục: `02-guide.md`.

# AI SPEC — Cá nhân hoá Tutor VLearn theo mức hiểu + phát hiện segment hỏng · Nhóm K4-3B-E402 · Zone C1
Hướng: [X] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [X] Tối ưu tính năng có sẵn  [ ] Tính năng mới

## §1. User & Job
- Job executor + workflow: Học viên K4 đang ngồi trong buổi học, đọc slide trên VLearn, vừa bôi đen một đoạn transcript/nội dung chưa hiểu và cần làm rõ ngay để không bị tụt (xem `canvas-cp1.md` §1 dòng 2).
- Core JTBD: Khi đang đọc bài giảng và gặp đoạn chưa hiểu, học viên cần được làm rõ ngay ở đúng mức trình độ của mình, để không bị hiểu sai hoặc mất thời gian hỏi lại nhiều lần.
- Problem statement: Khi học viên hỏi lại một đoạn chưa hiểu, câu trả lời nhận được không phù hợp trình độ (đôi khi quá dễ, đôi khi quá khó) hoặc không có đủ căn cứ để trả lời, dẫn đến học sai kiến thức hoặc phải hỏi lại nhiều lần.
- Evidence (chuẩn B — mining, có khảo sát bổ trợ; log đầy đủ trong repo):
  - Số liệu mining (`eval/mining-log.md`, n = 13.494 lượt hỏi-đáp `tutor_turns.csv`):
    - Painpoint 1 — thiếu tín hiệu cá nhân hoá: `understanding_level` có giá trị chỉ 20/13.494 (0,1482%); thiếu 13.474/13.494 (99,8518%); riêng cohort K4 chỉ 6/3.097 dòng có giá trị.
    - Painpoint 2 — segment hỏng: `grade_missing=True` ở 129/13.494 (0,9560%) dòng; cả 129/129 (100%) đồng thời có `move_used` rỗng và `has_citation=False`.
  - Khảo sát bổ trợ (`validation/survey-log.md`, n = 20 phản hồi Google Forms, vòng 1 ngày 17/9/2026): 16/20 (80%) cảm thấy Tutor trả lời theo khuôn mẫu giống nhau; 3/20 (15%) đánh giá câu trả lời gần nhất không phù hợp mức hiểu (2 quá khó, 1 quá dễ); 10/20 (50%) đồng ý dùng thử ngay.
  - ≥5 quote/ví dụ nguyên văn + nguồn:
    - `T00009`, `T00064`, `T00092`, `T00309`, `T00572` — 5 lượt `grade_missing=True` có `move_used` rỗng và `has_citation=False` (`eval/mining-log.md` bảng "Năm ví dụ grade_missing").
    - `T10288`–`T10293` — 5 lượt thiếu `understanding_level` khiến tutor không thể cá nhân hoá (`eval/mining-log.md` bảng "Năm ví dụ thiếu dữ liệu K4").
    - Quote khảo sát: "Trả lời chưa chính xác.", "Hỏi nhưng tutor không trả lời chuẩn.", "Quá khó hiểu." (`validation/survey-log.md`, tối đa 2 câu/quote, ẩn danh).

## §2. Impact & quyết định chọn
- Bảng impact ≥3 ứng viên (từ `HV1-evidence.md` §4, PIVOT):

  | Ứng viên | Bao nhiêu người | Tần suất | Mỗi lần tốn gì | Build nổi không | Chọn? |
  |---|---|---|---|---|---|
  | 1. Tutor không cá nhân hoá theo mức hiểu | ~13.474/13.494 lượt (99,85%) thiếu tín hiệu | Mỗi lần hỏi tutor | Học sai trình độ (quá dễ → chán / quá khó → nản) + mất thời gian hỏi lại | Có — chỉ cần suy luận mức hiểu từ lịch sử tương tác, không cần trường dữ liệu mới | ✅ Đã chọn |
  | 2. Tutor trả lời khi thuộc segment hỏng (`grade_missing`) | 129/13.494 lượt (0,96%), 100% thiếu `move_used` + `has_citation` | Hiếm khi nhưng tập trung ở nhóm không có điểm | Trả lời sai hoàn toàn, không có căn cứ → mất niềm tin (trust collapse) | Có — chỉ cần rule phát hiện `grade_missing` + lịch sử rỗng | ✅ Đã chọn |
  | 3. Tutor thiếu citation kèm mã trang (hướng cũ) | ~3.000 HV × nhiều lần/tuần | Mỗi lần hỏi | Mất 5–10 phút dò slide tìm nguồn | Khả thi nhưng thứ yếu | ❌ Loại |
- Ứng viên ĐÃ LOẠI + vì sao: "Citation kèm mã trang" bị loại vì 2 painpoint mới (cá nhân hoá + segment hỏng) có số liệu cụ thể hơn (0,1482% và 0,9560%) và mức độ nghiêm trọng cao hơn — trả lời sai hoàn toàn nguy hiểm hơn thiếu citation.
- Ứng viên CHỌN + vì sao (bằng số): Chọn gộp 2 painpoint 1 & 2 vì cùng một lát cắt (một câu hỏi của học viên) có thể giải quyết cả hai bằng 2 quyết định AI nối tiếp nhau: (a) suy luận mức hiểu khi có đủ tín hiệu, và (b) từ chối + cảnh báo khi phát hiện thuộc segment hỏng (99,85% thiếu tín hiệu trực tiếp + 0,96% segment không có căn cứ trả lời).

## §3. Giải pháp tương tự đã nghiên cứu
- ChatGPT/Gemini dạng chat thường: flow hỏi-đáp tự do, không có bước suy luận trình độ hay phát hiện thiếu dữ liệu đầu vào — đáng học ở văn phong đàm thoại tự nhiên, đáng né ở việc luôn cố trả lời kể cả khi không đủ căn cứ (hallucination); CiteTutor khác ở chỗ chủ động từ chối khi phát hiện segment hỏng thay vì bịa.
- Adaptive learning hint trong các LMS phổ biến (gợi ý độ khó theo điểm số/quiz): đáng học ở việc cá nhân hoá theo dữ liệu định lượng có sẵn, đáng né ở việc phụ thuộc hoàn toàn vào trường điểm số/quiz — khi trường đó trống (như `understanding_level` 99,85% thiếu ở đây) hệ thống mất khả năng cá nhân hoá; CiteTutor khác ở chỗ suy luận mức hiểu từ tín hiệu hành vi (số câu hỏi, độ dài câu trả lời, mật độ thuật ngữ, số lần hỏi lại) thay vì chỉ dựa vào 1 trường dữ liệu có sẵn.

## §4. Thiết kế
- Lát cắt MỘT CÂU: Học viên K4 bôi đen đoạn transcript chưa hiểu và hỏi tutor · AI suy ra mức hiểu từ lịch sử tương tác (không dựa vào cột `understanding_level` đang trống 99,85%) hoặc phát hiện thuộc segment hỏng (`grade_missing` + lịch sử rỗng / không có căn cứ) · trả về câu trả lời đúng độ sâu phù hợp hoặc lời từ chối rõ ràng kèm đề xuất hỏi giảng viên.
- Non-goals (≥3 thứ KHÔNG build):
  - Không build tính năng citation kèm mã trang (đã loại ở §2).
  - Không lưu lịch sử chat lâu dài hay đăng nhập/auth thật — dùng persona giả trong phiên demo (`reflection/HV3-prototype.md` bảng "Cam kết mức prototype").
  - Không build jump-to-page trong slide viewer.
  - Không tự động sửa/ghi đè dữ liệu `understanding_level`/`grade_missing` gốc trong data pack.
- Mức prototype nhắm tới: [ ] Sketch [X] Mock [ ] Working — phần thật: hiển thị slide + bôi đen, understanding inference (`codebase/src/lib/inference.ts`), gọi Gemini API thật (`codebase/src/lib/gemini.ts`), badge mức hiểu; phần mock: warning segment hỏng (`grade_missing` giả lập), jump-to-page, lưu lịch sử, đăng nhập (1 user giả) — chi tiết `reflection/HV3-prototype.md` §1.
- Automation: [X] augment [ ] conditional [ ] automate — chọn AUGMENT vì cost-of-error cao trong giáo dục: nếu AI đoán sai mức hiểu → học viên học sai trình độ (quá dễ/chán, quá khó/nản); nếu AI bịa đặt ở segment hỏng → trust collapse. AI chỉ gợi ý mức độ, học viên luôn kiểm chứng qua badge và có thể tự điều chỉnh (`reflection/HV2-prompt-retrieval.md` §8).
- §4b. Nguyên tắc đã áp dụng (HAX/PAIR):

  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | G2 — Làm rõ hệ thống làm tốt đến đâu | Badge mức hiểu (🟢/🟡/🔴) kèm % confidence hiển thị cuối mỗi câu trả lời |
  | G9 — Sửa lỗi dễ dàng | Nút "Chỉnh mức" cạnh badge, 1 click chọn lại trình độ → AI trả lời lại ngay |
  | G10 — Thu hẹp phạm vi khi nghi ngờ | `detectSegment()` chặn trước khi gọi AI khi `grade_missing` hoặc câu hỏi không có căn cứ (Jaccard < 0.05); hiển thị cảnh báo + nút "Chuyển giảng viên" |
  | G11 — Giải thích vì sao | Metadata suy luận (số câu hỏi, độ dài câu trả lời, mật độ thuật ngữ, số lần hỏi lại) đi kèm kết quả mức hiểu |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8)

| Lớp | Mô tả | Kịch bản rủi ro tiêu biểu | Hành vi mong đợi | Nguyên tắc |
|---|---|---|---|---|
| ① Cá nhân hoá sai | AI suy luận nhầm mức hiểu do ít tương tác hoặc tín hiệu lẫn lộn | K3: học viên mới vô tình gõ 1 thuật ngữ chuyên sâu · K4: học viên thấy giải thích sai trình độ · K7/K8: Lan/Phong hỏi đúng tầm hiểu | Gắn confidence score; cho phép bấm "Chỉnh mức" để chọn lại ngay | G9, G11 |
| ② Segment hỏng | Cố trả lời khi thiếu dữ liệu đầu vào → có nguy cơ bịa đặt | K2: `grade_missing=true` + lịch sử rỗng · K5: câu hỏi lạc đề hoàn toàn · K6: bôi đen < 5 ký tự · K14/K15: xử lý sau khi cảnh báo | `detectSegment()` chặn trước khi gọi AI; hiển thị lý do rõ ràng + đề xuất chuyển giảng viên, không bịa | G10 |
| ③ Tín hiệu mơ hồ | Học viên mới hoàn toàn, lịch sử trống, tín hiệu mâu thuẫn | K1: câu hỏi đầu tiên của học viên mới · K10: hỏi lại nhiều lần liên tiếp (rephrase) | Gán confidence thấp (<0.40), fallback về mức Beginner an toàn | G2 |
| ④ Mức hiểu thay đổi nhanh | Học viên có nền tảng nhưng đang hỏi lại kiến thức cơ bản (đang ôn tập) | K11: dùng nhiều từ khoá chuyên môn liên tiếp · K13: đổi qua lại giữa nhiều persona | Cho phép override mức hiểu thủ công, reset state sạch khi đổi persona | G1, G9 |

Ngoài ra hệ thống còn xử lý các kịch bản hạ tầng: K9 (Gemini API lỗi 503 → fallback mock, không sập UI) và K12 (chưa cấu hình API key → chạy mock, báo banner rõ ràng). Chi tiết đầy đủ 15 kịch bản: `reflection/HV2-prompt-retrieval.md` §6.

## §6. Bốn đường đi của trải nghiệm
- Happy path: Học viên bôi đen đoạn chưa hiểu → AI suy ra mức hiểu từ lịch sử (vd. beginner) → trả lời đúng độ sâu kèm badge "🟢 Mức hiểu của bạn: Beginner".
- Low-confidence (②→ K3/K4): AI suy luận sai mức hiểu (vd. cho là beginner) → học viên phản hồi bằng thuật ngữ chuyên môn hoặc bấm "Chỉnh mức" → AI hỏi lại xác nhận và điều chỉnh câu trả lời ở mức mới.
- Failure/không căn cứ (① segment hỏng, K2/K5/K6): học viên thuộc `grade_missing=True` và không có lịch sử, hoặc câu hỏi không liên quan bài giảng (Jaccard < 0.05) → hệ thống từ chối trả lời, giải thích lý do, đưa 2 lựa chọn "Chuyển giảng viên" / "Trả lời mặc định không cá nhân hoá".
- Correction (user sửa, K4/K15): học viên thấy mức hiểu hiển thị không đúng → bấm "Chỉnh mức" → chọn lại trình độ → AI xác nhận cập nhật và trả lời lại ngay ở mức mới.
- Khi bị đòi ngoài phạm vi (③ tín hiệu mơ hồ, K1/K10): học viên hoàn toàn mới hoặc hỏi lại liên tục cùng vấn đề → AI gán confidence thấp, mặc định về mức Beginner an toàn thay vì đoán bừa.
- Case đặc thù domain (④, K11/K13): học viên có nền tảng nhưng hỏi lại kiến thức cơ bản để ôn tập, hoặc đổi qua lại giữa nhiều persona → cho phép override mức hiểu thủ công, reset sạch state khi đổi persona.

## §7. Kiểm thử
- Chiều chất lượng + định nghĩa kiểm chứng được: (1) Personalization Accuracy — mức hiểu AI trả về khớp mức hiểu kỳ vọng của persona; (2) Segment Broken Detection — mọi case `grade_missing`/không căn cứ đều bị chặn trước khi gọi AI, không trả lời bịa.
- Golden set: 20 case chia 4 bucket (`codebase/tests/hv2-questions.ts`, kết quả trong `codebase/tests/HV2-RESULTS.md`): A — Beginner (5), B — Intermediate (5), C — Advanced (5), D — Broken segment (5).
- Quality bar (chốt tại CP4, không đổi sau 21:00 18/9/2026): "Đạt khi ≥85% case cá nhân hoá (bucket A/B/C) được suy đúng mức hiểu, và 100% case segment hỏng (bucket D) được phát hiện và từ chối trả lời đúng cách trước khi gọi AI."
- Kết quả các lượt chạy (`codebase/tests/HV2-RESULTS.md`):

  | Bucket | Pass/Total | Tỷ lệ | Bar | Trạng thái |
  |---|---|---|---|---|
  | A — Beginner | 5/5 | 100% | ≥85% | ✅ |
  | B — Intermediate | 5/5 | 100% | ≥85% | ✅ |
  | C — Advanced | 5/5 | 100% | ≥85% | ✅ |
  | D — Broken segment | 5/5 | 100% | 100% | ✅ |
  | Tổng thể (Round 3, real API `gemini-3.6-flash`, 18/9/2026) | 20/20 | 100% | — | 11/20 lời gọi API thật, 9/20 fallback mock (503 high-demand) do phía API, không do logic |

## §8. Phân công & kế hoạch
- Phân công có tên (`canvas-cp1.md` §1 dòng 7, `README.md`):
  - HV1 — Evidence: mining `understanding_level` + `grade_missing`, khảo sát 20 người, viết `eval/mining-log.md` + `validation/survey-log.md`.
  - HV2 — Prompt/Retrieval: logic suy luận mức hiểu (`inference.ts`) + phát hiện segment hỏng (`segment-detect.ts`) + prompt Gemini + golden set 20 case + 15 kịch bản rủi ro.
  - HV3 — Prototype: build 4 đường đi (Happy/Low-Confidence/Failure/Correction), UI badge mức hiểu + warning segment hỏng, video demo.
  - HV4 — Spec/QA/Demo: spec.md §1-§9, tổng hợp quality bar, slide, validation, reflection.
- Willing users + kế hoạch vòng validation *(bonus)*: khảo sát vòng 1 ghi nhận 10/20 người đồng ý dùng thử ngay và 7/20 muốn biết thêm (`validation/survey-log.md`); đã chốt đủ 3 willing users chính thức (tên + vai + kênh liên lạc) trong `validation/willing-users.md`, đạt tối thiểu R6 (+8đ).
- Multi-prototype: không làm — nhóm tập trung 1 phương án duy nhất (augment, mock UI + AI thật ở lõi suy luận/generation).

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
|---|---|---|
| 17/9/2026 (CP1) | Pivot từ "citation kèm mã trang" sang "cá nhân hoá theo mức hiểu + phát hiện segment hỏng" | HV1 mining phát hiện 2 painpoint mới nghiêm trọng hơn: `understanding_level` trống 99,85% và `grade_missing` segment hỏng 0,96% (`canvas-cp1.md` §1 dòng 1, 4) |
| 18/9/2026 (CP4) | Cập nhật lại số liệu mining và khảo sát (bản 18/9 thay bản 17/9), bổ sung `eval/mining-log.md` và `validation/survey-log.md` | Số liệu chạy lại chính xác hơn, kèm phương pháp đếm có thể kiểm lại (`eval/mining-log.md`) |
| 18/9/2026 (CP4) | Chốt quality bar ≥85% personalization + 100% segment detection, đo được 100/100% trên golden set 20 case | Kết quả thật từ `codebase/tests/HV2-RESULTS.md`, giữ nguyên theo quy tắc không đổi bar sau CP4 |
| 18/9/2026 (CP5) | Đổi mô tả phụ của nút "Chuyển giảng viên" ở màn cảnh báo segment hỏng để nói rõ vẫn xem được câu trả lời mặc định sau đó | Validation với 2 người ngoài nhóm (V01, V02): V02 do dự 5 giây và suýt chọn nhầm vì lo mất quyền xem câu trả lời mặc định (`validation/feedback-log.md`, `validation/synthesis.md`) |