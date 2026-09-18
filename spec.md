# AI SPEC — VLearn Tutor cá nhân hoá theo mức hiểu · Nhóm K4-3B-E402 · Zone A
Hướng: [x] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [x] Tối ưu tính năng có sẵn  [ ] Tính năng mới

## §1. User & Job
- Job executor + workflow (đính kèm worksheet JTBD / ảnh sơ đồ):
  Học viên K4 đang đọc slide hoặc transcript trong buổi học, vừa bôi đen một đoạn chưa hiểu, nhấn vào VLearn Tutor để hỏi ngay. Họ cần một câu trả lời đúng mức độ, không quá dễ, không quá khó, và nếu không đủ dữ liệu để suy luận thì nhận biết rõ ràng thay vì bịa.
- Core JTBD (không tên sản phẩm/AI trong câu):
  Khi học viên bôi đen một đoạn chưa hiểu, họ muốn hiểu tức thì đúng trình độ của mình mà không mất thời gian hỏi lại nhiều lần.
- Problem statement (KHÔNG chữ AI):
  Khi học viên không có đủ dữ liệu về mức hiểu và Tutor trả lời theo cùng một mẫu cho mọi người, họ dễ nhận câu trả lời quá khó, quá dễ hoặc không đáng tin. Đặc biệt khi người học thuộc segment thiếu điểm/thiếu lịch sử, hệ thống vẫn trả lời như thể biết rõ và khiến học sai kiến thức.
- Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):
  - Số liệu mining / kết quả khảo sát (n = 20 khảo sát; mining = 13.494 dòng):
    - `understanding_level` có giá trị: 20/13.494 dòng (0,1482%) = chỉ 0,15% có dữ liệu, 99,85% trống.
    - `grade_missing=True`: 129/13.494 dòng (0,9560%) = 0,96% thuộc segment hỏng; trong số đó 100% có `move_used` rỗng và `has_citation=False`.
    - Khảo sát 20 học viên: 3/20 (15%) báo câu trả lời không phù hợp trình độ; 16/20 (80%) nghĩ Tutor trả lời theo khuôn mẫu; 10/20 (50%) sẵn sàng dùng thử cải tiến.
  - ≥5 quote/ví dụ nguyên văn + nguồn:
    1. “Trả lời chưa chính xác.” — nguồn: `validation/survey-log.md`
    2. “Quá khó hiểu.” — nguồn: `validation/survey-log.md`
    3. “bot giải thích ví dụ khá mơ hồ cách hoạt động của …” — nguồn: `validation/survey-log.md`
    4. “Hỏi nhưng tutor không trả lời chuẩn.” — nguồn: `validation/survey-log.md`
    5. “bài giảng pdf và video thì tutor chưa trích được.” — nguồn: `validation/survey-log.md`
    6. “Mình thấy Tutor trả lời theo khuôn mẫu giống nhau cho mọi người.” — nguồn: phản hồi khảo sát trong `validation/survey-log.md`

## §2. Impact & quyết định chọn
- Bảng impact ≥3 ứng viên (bao nhiêu người · tần suất · tốn gì mỗi lần · khả thi):

| Ứng viên | Người bị ảnh hưởng | Tần suất | Tốn gì mỗi lần | Khả thi |
|---|---:|---:|---:|---:|
| Tutor cá nhân hoá theo mức hiểu | Học viên K4 / toàn khoá | Cao | Mỗi câu hỏi mất 2–3 lần hỏi lại hoặc học sai định hướng | Cao |
| Phát hiện segment hỏng khi thiếu điểm/lịch sử | Học viên có `grade_missing=True` hoặc thiếu dữ liệu | Trung bình | Trả lời sai hoàn toàn và mất niềm tin | Cao |
| Tóm tắt slide + trích dẫn nguồn | Học viên xem bài giảng và cần xác minh nguồn | Cao | Mất thời gian tự kiểm tra lại | Trung bình |

- Ứng viên ĐÃ LOẠI + vì sao:
  - “Tóm tắt cả slide” đã loại vì không phải root pain gốc; pain chính là câu trả lời không phù hợp mức hiểu và thiếu căn cứ.
  - “Tạo quiz ôn tập tự động” đã loại vì không trực tiếp giải quyết việc học viên đang cần giải thích ngay khi bôi đen đoạn chưa hiểu.
  - “Chỉ thêm citation mà không cá nhân hoá” đã loại vì segment hỏng là vấn đề nghiêm trọng nhưng không đủ để giải quyết mismatch trình độ.
- Ứng viên CHỌN + vì sao (bằng số):
  - Chọn: Tutor cá nhân hoá theo mức hiểu + cảnh báo segment hỏng khi không đủ tín hiệu.
  - Vì sao: 16/20 (80%) học viên báo cảm giác Tutor trả lời theo khuôn mẫu; 3/20 (15%) xác nhận câu trả lời không phù hợp trình độ; 129/13.494 (0,96%) dòng thuộc segment hỏng; và 20/13.494 (0,15%) có `understanding_level` dữ liệu đủ để suy luận.

## §3. Giải pháp tương tự đã nghiên cứu
- [ChatGPT / AI tutor tổng quát]: flow đơn giản là hỏi thêm một câu hỏi xác nhận mức hiểu, nhưng rất dễ “giả vờ biết” khi thiếu dữ liệu; đáng học ở chỗ nó tương tác tốt nhưng đáng né vì thiếu fail-safe với học viên không có lịch sử.
- [NotebookLM / AI đọc tài liệu]: flow mạnh ở việc trích dẫn nguồn, nhưng không tự động hiểu mức độ learner; đáng học ở khả năng tham chiếu tài liệu, đáng né ở việc không có “mức hiểu người học” và không cảnh báo khi thiếu căn cứ.
- [Khanmigo / tutor của nền giáo dục]: flow cho phép cá nhân hoá theo tiến độ và độ hiểu; đáng học ở chế độ hỏi trả lời theo cấp độ, đáng né vì nhiều hệ thống vẫn giả định khi không có dữ liệu đầu vào rõ ràng.
- Mình khác: tập trung đúng vào 1 vụ việc rất cụ thể: “đoạn bôi đen chưa hiểu”, và đồng thời có chiến lược an toàn khi segment hỏng: cảnh báo + đề xuất hỏi giảng viên thay vì trả lời bừa.

## §4. Thiết kế
- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả):
  Học viên K4 bôi đen một đoạn chưa hiểu trong VLearn; AI suy ra mức hiểu từ lịch sử tương tác và điều chỉnh độ sâu câu trả lời; nếu hệ thống phát hiện segment hỏng hoặc thiếu dữ liệu, nó cảnh báo và đề xuất hỏi giảng viên thay vì bịa.
- Non-goals (≥3 thứ KHÔNG build):
  - Không build một hệ thống tự động đánh giá toàn bộ học sinh trong cả khoá.
  - Không build chức năng sinh quiz/ôn tập tự động cho mọi bài học.
  - Không build hệ thống “trả lời luôn” khi không có lịch sử hoặc điểm số rõ ràng.
  - Không build xác thực nguồn ở mức toàn bộ chương trình; chỉ tập trung vào flow câu hỏi hiện tại.
- Mức prototype nhắm tới: [ ] Sketch [ ] Mock [x] Working — phần nào mock, phần nào thật:
  - Working: logic suy mức hiểu từ lịch sử tương tác và rule phát hiện segment hỏng.
  - Mock: UI hiển thị mức hiểu, cảnh báo và lựa chọn chuyển giảng viên.
- Automation: [ ] augment [x] conditional [ ] automate — lý do theo cost-of-error:
  - Điều kiện: AI chỉ trả lời với mức độ cá nhân hoá khi có đủ tín hiệu; nếu thiếu tín hiệu hoặc user thuộc segment hỏng thì chuyển sang cảnh báo + đề xuất hỏi GV.
  - Vì cost-of-error rất cao: cá nhân hoá sai tạo ra kiến thức sai, mất niềm tin, và có thể làm học viên học nhầm. Từ chối rõ ràng an toàn hơn nhiều so với “vẫn trả lời mà không biết”.
- §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | Calibrated trust | Khi không đủ tín hiệu, hiển thị cảnh báo “mình không thể suy ra mức hiểu một cách chính xác” thay vì trả lời chắc chắn |
  | Fail-safe first | Segment `grade_missing=True` và lịch sử rỗng dẫn tới lựa chọn “chuyển giảng viên” |
  | Context-aware explanation | Mức hiểu được suy từ lịch sử chất lượng câu hỏi, độ dài câu hỏi và cặp phản hồi trước đó |
  | User correction | Người dùng có thể xác nhận hoặc chỉnh mức hiểu khi AI suy sai |
  | Clear scope | Chỉ giải quyết “đoạn bôi đen chưa hiểu”, không mở rộng sang toàn bộ planner học tập |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

| Lớp | Chỗ khó | Kịch bản 1 | Kịch bản 2 |
|---|---|---|---|
| 1. Intent ambiguity | User hỏi quá ngắn, không rõ đoạn nào cần giải thích | “backprop là gì?” nhưng không biết user đang học gì | User bôi đen 1 câu nhưng hỏi lại kiểu “mình không hiểu” |
| 2. User-state uncertainty | Không biết learner ở mức nào | Lịch sử chỉ có 2 câu ngắn, AI suy beginner nhưng thực tế user đã có nền | Người học dùng thuật ngữ chuyên môn nhưng lại hỏi rất cơ bản |
| 3. Context mismatch | Dữ liệu thiếu hoặc lệch | `understanding_level` trống 99,85% nên không có tín hiệu đáng tin | `grade_missing=True` nhưng user vẫn hỏi và AI không nên đoán |
| 4. Safety / trust | Trả lời sai sẽ làm người học tin sai | AI trả lời quá khó và làm học viên nản | AI trả lời quá dễ và gây lãng phí thời gian vì học rỗng |
| 5. Domain edge case | Một số chủ đề có quá nhiều thuật ngữ chuyên môn | Giải thích “gradient descent” nhưng user thiếu knowledge base | User hỏi về domain đặc thù nhưng dữ liệu không đủ |
| 6. Partial feedback | AI xem câu hỏi nhưng bỏ qua phản hồi thật | User “mình hiểu rồi” nhưng hệ thống vẫn tiếp tục beginner | User nói “bạn giải thích tốt rồi” nhưng AI suy sai |
| 7. Out-of-scope demand | User yêu cầu thêm ngoài phạm vi | Hỏi một câu logistics không thuộc bài giảng | Muốn AI “giải hết một bài” thay vì giải thích đoạn bôi đen |
| 8. System failure / no grounding | Thiếu căn cứ để cho ra câu trả lời | `move_used` trống và `has_citation=False` | Không có lịch sử + không có điểm = không thể suy mức hiểu |

## §6. Bốn đường đi của trải nghiệm
- Happy path: Học viên bôi đen đoạn chưa hiểu; AI nhận thấy đủ lịch sử và suy ra mức beginner/intermediate; trả lời đúng độ sâu, kèm ví dụ đơn giản; hiển thị “Mình thấy bạn đang ở mức mới bắt đầu, nên mình giải thích chi tiết nhé”.
- Low-confidence (②): AI chỉ có một vài tín hiệu yếu; hệ thống trả lời ngắn gọn hơn, hỏi lại hoặc xin xác nhận: “Mình không chắc mức hiểu của bạn, mình muốn hỏi một câu kiểm tra nhanh trước khi giải thích sâu.”
- Failure/không căn cứ (①): Học viên thuộc segment hỏng (`grade_missing=True` hoặc rỗng lịch sử); hệ thống không giả định và hiển thị cảnh báo: “Mình không có đủ căn cứ để suy ra mức hiểu” và đề xuất hỏi giảng viên.
- Correction (user sửa): User phản hồi “mình đã biết rồi” hoặc “giải thích khó quá”; AI nhận tín hiệu và dịch sang mức khó hơn hoặc dễ hơn, không cố cài mức cũ.
- Khi bị đòi ngoài phạm vi (③): Học viên hỏi quá rộng hoặc không liên quan bài giảng; AI chuyển từ “giải thích đoạn” sang “tóm gọn ý chính” hoặc “đề xuất hỏi giảng viên”.
- Case đặc thù domain (④): Nếu chủ đề có tính chuyên môn rất cao và không đủ dữ liệu, AI không tự bịa; có thể trả lời ở mức khái quát và yêu cầu người học xác nhận hoặc hỏi GV.

## §7. Kiểm thử
- Chiều chất lượng + định nghĩa kiểm chứng được:
  - Tính cá nhân hoá: câu trả lời có phù hợp với mức hiểu được suy ra hay không.
  - Tính an toàn: hệ thống có phát hiện “segment hỏng” và từ chối đúng khi không có căn cứ hay không.
  - Tính kể lại và minh bạch: user thấy rõ lý do AI nói “mình không đủ dữ liệu” thay vì chỉ lặp lại câu trả lời.
- Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong eval/):
  - Cấu trúc: 8 happy path, 5 low-confidence, 5 failure/no-basis, 2 correction, 2 out-of-scope / domain edge.
  - File dự kiến: `eval/` trong repo. Tại thời điểm hiện tại, nhóm đã xây dựng spec và dữ liệu bằng chứng; golden set cần được bổ sung trước CP6.
- Quality bar (chốt từ hạn chốt spec của khoá, giữ nguyên sau đó): "Đạt khi ≥ 85% các case cá nhân hoá đúng, và 100% các trường hợp segment hỏng phát hiện được và cảnh báo đúng."
- Kết quả các lượt chạy (bảng % — cập nhật đến trước CP6):

| Lượt chạy | Cá nhân hoá đúng | Phát hiện segment hỏng | Ghi chú |
|---|---:|---:|---|
| CP1 – spec/data pack | N/A | N/A | Còn ở giai đoạn xác nhận pain + định nghĩa slice |
| CP4 – chốt spec | N/A | N/A | Golden set + prompt rule đang được chuẩn bị |
| CP6 – demo/final | TBD | TBD | Cập nhật sau khi chạy test thực tế |

## §8. Phân công & kế hoạch
- Phân công có tên: spec / evidence / prompt / code / demo
  - Spec: HV4 — xây dựng spec, AC, điều kiện chốt.
  - Evidence: HV1 — mining `understanding_level`, `grade_missing`, khảo sát 20 phản hồi.
  - Prompt: HV2 — định nghĩa logic suy mức hiểu, low-confidence và fail-safe.
  - Code: HV3 — prototype logic + UI + demo flow.
  - Demo: nhóm — chạy test/demo, chuẩn bị proof-of-work.
- Willing users (≥2 tên) + kế hoạch vòng validation *(bonus, nếu làm)*:
  - Từ khảo sát: có 10/20 học viên đồng ý dùng thử; 2 user đầu tiên được chọn làm willing users ẩn danh trong repo: `HV-01`, `HV-02`.
  - Kế hoạch validation: 1 vòng ưu tiên kiểm tra tính phù hợp mức hiểu, 1 vòng kiểm tra fail-safe khi thiếu dữ liệu, 1 vòng đo phản hồi user về cảnh báo chuyển giảng viên.
- Multi-prototype (nếu làm): trục khác biệt của ≥2 phương án + lý do chọn:
  - Phương án A: “Cá nhân hoá ngay nếu có tín hiệu” — nhanh, nhưng dễ đoán sai.
  - Phương án B: “Cá nhân hoá có fail-safe + cảnh báo khi thiếu dữ liệu” — chậm hơn nhưng an toàn hơn, đúng với cost-of-error.
  - Chọn B vì dữ liệu cho thấy 99,85% thiếu thông tin mức hiểu và 0,96% segment hỏng, nên an toàn hơn nhiều.

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
|---|---|---|
| 17/09/2026 | Pivot từ “citation / mã trang” sang “cá nhân hoá theo mức hiểu + phát hiện segment hỏng” | Mining cho thấy `understanding_level` trống 99,85% và `grade_missing=True` xuất hiện ở 0,96% dòng; survey cho thấy 80% cảm thấy Tutor trả lời theo khuôn mẫu |
| 18/09/2026 | Hoàn thiện spec theo template 8 phần; định rõ AI self/ non-self và fail-safe | Để đảm bảo không bịa khi thiếu dữ liệu và có thể test được với 3 AC Gherkin + golden set |
