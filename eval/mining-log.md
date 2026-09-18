# Mining Log — VLearn Tutor A1c

## Phạm vi và nguồn dữ liệu

- Người thực hiện: HV1 — Evidence Lead
- Ngày chạy: 18/09/2026
- Nguồn: `data/vlearn-pack/chatlog/tutor_turns.csv`
- Dictionary: `data/vlearn-pack/chatlog/DATA_DICTIONARY.md`
- Kích thước: **13.494 lượt hỏi-đáp**, 19 cột.
- Dữ liệu đã được ẩn danh. Chỉ lưu `turn_id` và trích dẫn ngắn, không sao chép data pack vào repo public.

## Phương pháp đếm

### Painpoint 1 — thiếu tín hiệu `understanding_level`

Quy tắc một dòng được xem là thiếu nếu `understanding_level` là null hoặc chuỗi rỗng sau khi trim.

- Có giá trị: **20/13.494 (0,1482%)**.
- Thiếu giá trị: **13.474/13.494 (99,8518%)**.
- Riêng cohort K4: **6/3.097** lượt có giá trị `understanding_level`.
- Các giá trị có trong 20 lượt: mức 1 = 7, mức 2 = 1, mức 3 = 1, mức 4 = 10, mức 5 = 1.

Kết luận đúng phạm vi: hệ thống hầu như không có trường dữ liệu trực tiếp để cá nhân hoá theo mức hiểu. Con số này **chưa tự chứng minh** rằng mọi câu trả lời đều không phù hợp; khảo sát được dùng để kiểm chứng tác động với người học.

### Painpoint 2 — segment `grade_missing`

- `grade_missing == True`: **129/13.494 (0,9560%)**.
- Trong 129 lượt này, `move_used` rỗng: **129/129 (100%)**.
- Trong 129 lượt này, `has_citation == False`: **129/129 (100%)**.
- Đồng thời thỏa cả hai điều kiện: **129/129 (100%)**.
- Phân bố cohort của 129 lượt: K3 = 109, K4 = 20.

Kết luận: đây là một segment có tín hiệu kỹ thuật nhất quán: tutor không chọn được pedagogical move và không có citation. Không nên gọi mọi lượt là “trả lời sai” nếu chưa đọc nội dung; cách gọi kiểm chứng được là **segment thiếu grade có dấu hiệu hỏng/thiếu đầu ra cần xử lý riêng**.

## Năm ví dụ `grade_missing` có đủ ba dấu hiệu

Mỗi trích đoạn tối đa hai câu, dùng mã lượt thay cho danh tính.

| # | `turn_id` | Cohort | Câu hỏi / ngữ cảnh ngắn | Câu trả lời / tín hiệu | Kết luận |
|---:|---|---|---|---|---|
| 1 | `T00009` | K3 | “Hãy giải thích ngắn gọn LLM là gì và trích dẫn slide.” | Tutor giải thích LLM và thêm `[trang 11]`; `move_used` rỗng, `has_citation=False`. | Segment bị đánh dấu thiếu grade nhưng vẫn có đầu ra nội dung; cần kiểm tra citation thực tế. |
| 2 | `T00064` | K3 | “buổi 1 học về kiến thức gì” | Tutor tóm tắt kiến thức nền tảng và quy trình tạo LLM; `move_used` rỗng, `has_citation=False`. | Có câu trả lời nhưng thiếu move/citation theo log. |
| 3 | `T00092` | K3 | “Attention, đây là gì?” | Tutor giải thích Attention và thêm `[trang 32]`; `move_used` rỗng, `has_citation=False`. | Citation xuất hiện trong text nhưng cờ dữ liệu là False, cần kiểm tra quy tắc đánh dấu. |
| 4 | `T00309` | K3 | “why can you not answer my question?” | “Xin lỗi, mình không thể hiển thị câu trả lời vừa rồi vì nó vi phạm quy tắc an toàn nội dung.” `move_used` rỗng, `has_citation=False`. | Case failure rõ, cần đường lui an toàn. |
| 5 | `T00572` | K3 | “do the wrong thing right so với do the right thing wrong” | Tutor giải thích sự khác biệt giữa hiệu quả thực thi và tính đúng đắn của mục tiêu; `move_used` rỗng, `has_citation=False`. | Có đầu ra nhưng không có metadata điều khiển/căn cứ. |

## Năm ví dụ thiếu dữ liệu để cá nhân hoá trong K4

Đây là các ví dụ **thiếu `understanding_level`**, không được diễn giải quá mức thành bằng chứng rằng câu trả lời chắc chắn sai.

| # | `turn_id` | Câu hỏi ngắn | Đầu ra ngắn | `move_used` | Citation | Ý nghĩa evidence |
|---:|---|---|---|---|---|---|
| 1 | `T10288` | “phần lab này dùng để làm gì?” | Tutor giải thích mục đích của baseline ở mức tổng quan. | `review_concept` | False | Không có mức hiểu để biết giải thích này có quá dễ/khó không. |
| 2 | `T10289` | “tôi phải làm gì? ở đây” | Tutor đưa quy trình thiết lập hạ tầng, bắt đầu bằng “Thông thường…”. | `review_concept` | False | Câu hỏi cần hướng dẫn thao tác nhưng không có tín hiệu trình độ. |
| 3 | `T10291` | “Dựa trên tiến độ của mình, mình nên ôn phần nào trước?” | Tutor khuyên bắt đầu từ khái niệm nền tảng của Day01. | `review_concept` | False | Tutor không có trường mức hiểu để cá nhân hoá khuyến nghị. |
| 4 | `T10292` | “tôi cần link các nhóm” | Tutor chỉ dẫn tham gia Discord và đưa link. | `give_direct_answer` | True | Cùng một hệ thống thiếu mức hiểu ngay cả ở câu hỏi không cần cá nhân hoá. |
| 5 | `T10293` | “tôi đang có bài tập gì phải hoàn thành, và hạn là bao giờ” | Tutor nói mình hỗ trợ nội dung chuyên môn và hướng tới LMS để xem deadline. | `review_concept` | False | Không có tín hiệu để phân biệt người mới, người đã học hay người cần hướng dẫn cụ thể. |

## Kiểm tra trực tiếp giả thuyết “trả lời giống nhau”

Đã chuẩn hoá `student_question` và `tutor_reply`, sau đó tìm nhóm có cùng câu hỏi và cùng câu trả lời ở nhiều student. Không tìm thấy 5 nhóm hợp lệ để kết luận tutor trả lời giống nhau; nhóm trùng duy nhất được tìm thấy là hai câu trả lời từ chối nội dung an toàn, không phải bằng chứng về cá nhân hoá theo trình độ.

Vì vậy, bằng chứng mining hiện hỗ trợ kết luận **thiếu dữ liệu đầu vào để cá nhân hoá**, còn kết luận **người học thực sự nhận câu trả lời không phù hợp** được kiểm chứng bằng survey log bên dưới.

## Reproducibility

Các phép đếm được chạy bằng pandas trên toàn bộ CSV:

```python
import pandas as pd

df = pd.read_csv("tutor_turns.csv")
blank = df["understanding_level"].isna() | df["understanding_level"].astype(str).str.strip().eq("")
grade = df["grade_missing"].astype(str).str.lower().isin(["true", "1", "yes"])
move_blank = df["move_used"].isna() | df["move_used"].astype(str).str.strip().eq("")
no_citation = df["has_citation"].astype(str).str.lower().isin(["false", "0", "no"])

print((~blank).sum(), blank.sum(), len(df))
print(grade.sum(), (grade & move_blank & no_citation).sum())
```