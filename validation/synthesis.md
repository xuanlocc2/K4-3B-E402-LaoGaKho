# Synthesis — R6 Validation

## Tổng hợp

- Tổng người test: 2 (V01, V02 — chi tiết trong `validation/feedback-log.md`)
- Số người có quote nguyên văn: 2

## Chủ đề lặp nhiều nhất

"Không rõ bấm 'Chuyển giảng viên' có mất câu trả lời mặc định không" — cả 2 người đều nhìn badge mức hiểu trước tiên, nhưng người thuộc nhóm segment hỏng (V02) do dự trước khi chọn giữa 2 lựa chọn ở màn cảnh báo.

## Thay đổi đã thực hiện (ghi vào spec.md §9)

1. **Làm rõ nhãn 2 nút ở màn cảnh báo segment hỏng** ("Chuyển giảng viên" → đổi mô tả phụ thành "vẫn có thể xem câu trả lời mặc định sau") — vì V02 do dự 5 giây và chọn nhầm hướng an toàn thay vì hướng đúng nhu cầu, do lo sợ mất quyền xem câu trả lời mặc định.
2. **Giữ nguyên vị trí và thời điểm hiển thị badge mức hiểu** (hiển thị trước khi đọc câu trả lời) — vì V01 chủ động dùng badge để tự kiểm chứng trước khi đọc nội dung, đúng như mục tiêu nguyên tắc G2.

## Giữ nguyên (có lý do)

- Badge 🟢/🟡/🔴 giữ nguyên — vì cả 2 người test đều đọc và hiểu đúng ý nghĩa ngay lần đầu, không cần giải thích thêm.
- Luồng `detectSegment()` chặn trước khi gọi AI giữ nguyên — vì hành vi từ chối đúng lúc, đúng lý do; vấn đề chỉ nằm ở cách diễn đạt nút bấm, không phải ở logic phát hiện.

## Để dành sau demo

- Thêm bước xác nhận rõ ràng hơn ("Bạn vẫn xem được câu trả lời mặc định sau khi chuyển giảng viên") cho cả 2 nút ở màn cảnh báo, không chỉ đổi 1 nhãn — cần thời gian thiết kế lại UI nên chưa làm kịp trước CP5.
- Mở rộng validation lên ≥3–5 người ngoài nhóm để đạt tín hiệu chắc hơn ngoài 2 người tối thiểu của R6.

## 4 dòng kết luận

1. Chủ đề lặp nhiều nhất: lo ngại mất quyền xem câu trả lời mặc định khi bấm "Chuyển giảng viên" ở màn cảnh báo segment hỏng.
2. Sẽ sửa gì trước demo: đổi mô tả phụ của nút "Chuyển giảng viên" để nói rõ vẫn xem được câu trả lời mặc định sau đó.
3. Giữ nguyên gì và vì sao: giữ badge mức hiểu và logic `detectSegment()` — cả 2 đều được người test hiểu đúng và phản hồi tích cực, vấn đề chỉ ở câu chữ nút bấm.
4. Để dành sau: thiết kế lại toàn bộ luồng xác nhận ở màn cảnh báo + mở rộng số người validation lên ≥3–5.
