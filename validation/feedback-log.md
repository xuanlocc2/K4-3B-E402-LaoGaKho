# Feedback Log — Validation R6 (≥2 người ngoài nhóm)

> Người ngoài nhóm dùng thử prototype CiteTutor (VLearn Tutor — cá nhân hoá theo mức hiểu + phát hiện segment hỏng). Mỗi dòng ghi đủ 5 trường theo `HV4-spec-qa-demo.md` §6.4. Danh tính được ẩn danh bằng mã, không ghi tên thật/số điện thoại vào repo public.

## Thông tin chung

- Ngày thực hiện: 18/09/2026, trong giờ nghỉ CP4–CP5.
- Người quan sát & ghi log: HV1 + HV4.
- Số người test: **2** (đạt tối thiểu R6: ≥2 người ngoài nhóm).
- Kịch bản: mỗi người bôi đen 1 đoạn transcript chưa hiểu, hỏi tutor 1 lần ở happy path và 1 lần ở path segment hỏng (mô phỏng `grade_missing=True`).

## Bảng validation

| Mã | Vai | Task | Quan sát | Quote nguyên văn | Mức nghiêm trọng |
|---|---|---|---|---|---|
| V01 | Học viên K4, lớp 3B | Bôi đen đoạn "attention mechanism" trong slide buổi 2, hỏi tutor giải thích | Đọc xong badge mức hiểu trước khi đọc câu trả lời; ngừng lại ở nút "Chỉnh mức" khoảng 3 giây rồi mới bấm hỏi tiếp | "À có ghi mình đang ở mức nào luôn, đỡ phải đoán câu trả lời có hợp không." | Low |
| V02 | Học viên K4, lớp 3B (thuộc nhóm `grade_missing`) | Bôi đen đoạn "gradient descent", hỏi tutor trong tình huống mô phỏng chưa có điểm/lịch sử | Đọc cảnh báo segment hỏng, do dự giữa 2 nút "Chuyển giảng viên" và "Trả lời mặc định" khoảng 5 giây trước khi chọn "Trả lời mặc định" | "Mình tưởng bấm chuyển giảng viên là mất luôn câu trả lời ở đây, nên chọn cái kia trước cho chắc." | Medium |

## Ghi chú thu thập

- V01 không gặp vấn đề nghiêm trọng, chỉ mất vài giây làm quen với badge mức hiểu — không cần thay đổi thiết kế.
- V02 cho thấy 1 điểm nhầm lẫn thật: nút "Chuyển giảng viên" chưa nói rõ là hành động không loại trừ việc vẫn có thể xem câu trả lời mặc định sau đó, khiến người dùng ngại bấm. Đây là input cho thay đổi ghi ở `validation/synthesis.md` và `spec.md` §9.
- Cả 2 người đều xác nhận đọc được badge mức hiểu (🟢/🟡/🔴) và hiểu đúng ý nghĩa khi được hỏi lại.
