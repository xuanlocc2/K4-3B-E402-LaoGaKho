# HV1 — Evidence Lead · Hướng Dẫn Chi Tiết Công Việc

> **Nhóm:** K4-3B-E402-CiteTutor · **Track:** A1c — Cá nhân hoá Tutor VLearn theo mức hiểu + phát hiện segment hỏng
> **Vai trò:** HV1 — Evidence Lead · **Deadline CP1:** 19:30 · 17/9/2026

---

## 1. Vai Trò & Trách Nhiệm HV1 (Evidence Lead)

### Mục tiêu cuối cùng
Bằng chứng đạt chuẩn **A hoặc B** theo rubric R1 (15đ), phục vụ cho `spec.md §1-§2` và `canvas-cp1.md` dòng 4.

### Tiêu chí nghiệm thu #2 (bắt buộc)

| Đường | Điều kiện đạt |
|---|---|
| **A — Khảo sát** | ≥20 người ngoài nhóm · ≥50% xác nhận pain · log đầy đủ: mỗi người ghi cả câu hỏi đã hỏi + từng câu trả lời nguyên văn |
| **B — Mining** | Số đếm được + ≥5 ví dụ nguyên văn (tối đa 2 câu/mỗi ví dụ) + phương pháp đếm người khác kiểm lại được |

### Trách nhiệm chính (PIVOT)
- Đọc data pack, nhận diện 2 painpoint mới:
  - **Painpoint 1:** `understanding_level` trống 99,85%
  - **Painpoint 2:** `grade_missing` segment "hỏng hoàn toàn"
- Đếm số `understanding_level` có/không giá trị
- Đếm `grade_missing` và kiểm tra đặc điểm kèm theo
- Trích ví dụ nguyên văn cho cả 2 painpoint
- Khảo sát học viên với câu hỏi mới
- Viết `eval/mining-log.md`, `validation/survey-log.md`, `validation/willing-users.md`
- Update `canvas-cp1.md` dòng 4 sau mỗi lượt đo

---

## 2. Công Việc CP1 *(Deadline 19:30 · 17/9/2026)*

### Mục tiêu CP1
Có **"1-2 bằng chứng đầu"** cho `canvas-cp1.md` dòng 4 — không cần đầy đủ, chỉ cần đủ để TA thấy nhóm đã bắt đầu.

### Bước 1 (20 phút) — Đọc Data Pack

**File cần đọc:**
```
data/vlearn-pack/chatlog/tutor_turns.csv
data/vlearn-pack/chatlog/DATA_DICTIONARY.md
```

**Cách đọc:** Mở `tutor_turns.csv` bằng pandas hoặc Excel/Google Sheets.

**Ghi nhận các pattern mới:**

| Pattern | Ví dụ gì | Có liên quan pain A1c mới? |
|---|---|---|
| `understanding_level` trống hoặc null | — | ✅ Trực tiếp — không có data để cá nhân hoá |
| `grade_missing = True` | — | ✅ Trực tiếp — segment hỏng hoàn toàn |
| Tutor trả lời mà không cá nhân hoá (cùng câu trả lời cho mọi user) | — | ✅ Trực tiếp |
| Dòng có `move_used` rỗng + `has_citation=False` | — | ✅ Trực tiếp — segment hỏng |
| Câu hỏi logistics (không liên quan nội dung bài giảng) | "buổi sau học ngày nào?" | ❌ Không |

---

### Bước 2 (15 phút) — Đếm Số Understanding Level & Grade Missing

**Mục tiêu:** Có hai con số cụ thể cho dòng 4 canvas.

#### Lệnh pandas cho Painpoint 1 — Understanding Level

```python
import pandas as pd

df = pd.read_csv('data/vlearn-pack/chatlog/tutor_turns.csv')

# Đếm understanding_level có/không giá trị
total = len(df)
has_understanding = df['understanding_level'].notna() & (df['understanding_level'] != '')
no_understanding = df['understanding_level'].isna() | (df['understanding_level'] == '')

print(f"Tổng số dòng: {total}")
print(f"Có giá trị understanding_level: {has_understanding.sum()} ({has_understanding.sum()/total*100:.2f}%)")
print(f"Không có giá trị understanding_level: {no_understanding.sum()} ({no_understanding.sum()/total*100:.2f}%)")

# Lọc K4 (khoá hiện tại)
df_k4 = df[df['cohort_hint'] == 'K4']
has_understand_k4 = df_k4['understanding_level'].notna() & (df_k4['understanding_level'] != '')
print(f"\nK4 only — có understanding_level: {has_understand_k4.sum()}/{len(df_k4)}")
```

**Kết quả kỳ vọng:** ~20/13.494 (0,15%) có giá trị → 99,85% TRỐNG

---

#### Lệnh pandas cho Painpoint 2 — Grade Missing

```python
import pandas as pd

df = pd.read_csv('data/vlearn-pack/chatlog/tutor_turns.csv')

# Đếm grade_missing
total = len(df)
grade_missing = df['grade_missing'] == True
print(f"Tổng số dòng: {total}")
print(f"grade_missing=True: {grade_missing.sum()} ({grade_missing.sum()/total*100:.2f}%)")

# Kiểm tra đặc điểm kèm theo của grade_missing
df_gm = df[grade_missing]
print(f"\nĐặc điểm của {len(df_gm)} dòng grade_missing=True:")
print(f"- move_used rỗng: {(df_gm['move_used'].isna() | (df_gm['move_used'] == '')).sum()}/{len(df_gm)}")
print(f"- has_citation=False: {(df_gm['has_citation'] == False).sum()}/{len(df_gm)}")

# Xác nhận: TOÀN BỘ có cả 2 đặc điểm
broken_both = df_gm[
    (df_gm['move_used'].isna() | (df_gm['move_used'] == '')) &
    (df_gm['has_citation'] == False)
]
print(f"\nDòng có BOTH: move_used rỗng VÀ has_citation=False: {len(broken_both)}/{len(df_gm)} ({len(broken_both)/len(df_gm)*100:.1f}%)")
```

**Kết quả kỳ vọng:** 129/13.494 (0,96%) → 100% có `move_used` rỗng VÀ `has_citation=False` → segment "hỏng hoàn toàn"

**Ghi ra giấy:**
- Painpoint 1: XX/13.494 (X.XX%) có `understanding_level`
- Painpoint 2: XX/13.494 (X.XX%) có `grade_missing=True`
- Trong đó: X% có cả `move_used` rỗng và `has_citation=False`

---

### Bước 3 (15 phút) — Trích ≥5 Ví Dụ Nguyên Văn cho Mỗi Painpoint

**Quy tắc bảo mật: tối đa 2 câu mỗi ví dụ.**

#### 3a. Trích ví dụ Painpoint 2 — Grade Missing (Segment hỏng)

**Cách làm:**
1. Chạy lệnh ở Bước 2 (phần grade_missing) → lấy danh sách `turn_id` có `grade_missing=True`
2. Mở CSV, lọc theo các `turn_id` đó
3. Với mỗi ví dụ, ghi:

| # | Mã lượt | grade_missing | move_used | has_citation | Ghi chú |
|---|---|---|---|---|---|
| 1 | T00XXX | True | (rỗng) | False | Hỏng hoàn toàn |
| 2 | T00XXX | True | (rỗng) | False | Hỏng hoàn toàn |

---

#### 3b. Trích ví dụ cho thấy Tutor không cá nhân hoá

**Cách làm:**
1. Tìm các câu hỏi tương tự từ các học viên khác nhau
2. So sánh câu trả lời — nếu giống nhau → không cá nhân hoá

| # | Mã lượt | Câu hỏi HV (≤2 câu) | Câu trả lời tutor (≤2 câu) | Ghi chú |
|---|---|---|---|---|
| 1 | T00XXX | "attention mechanism là gì?" | "[Câu trả lời giống hệt T00YYY]" | Không cá nhân hoá |
| 2 | T00YYY | "attention mechanism là gì?" | "[Câu trả lời giống hệt T00XXX]" | Không cá nhân hoá |

---

### Bước 4 (30 phút) — Khảo Sát Nhanh 10–20 HV Trong Giờ Nghỉ

**Phương pháp:** Mom Test — hỏi về **hành vi đã xảy ra**, không hỏi ý kiến.

**Script câu hỏi mới (PIVOT):**

```
1. "Câu trả lời tutor gần đây có phù hợp với trình độ của bạn không?"
   → Ghi: Có / Không / Không chắc

2. "Bạn có gặp câu trả lời nào vô lý hoặc hiểu sai không?"
   → Ghi: Có / Không (kèm ví dụ nếu có)

3. "Bạn có thấy tutor trả lời theo 'khuôn mẫu' giống nhau cho mọi người không?"
   → Ghi: Có / Không / Không chắc

4. "Nếu tutor có thể điều chỉnh câu trả lời theo trình độ của bạn, bạn có muốn dùng thử không?"
   → Ghi: Có muốn / Thử thôi / Không

5. "[Willing user] Bạn đồng ý dùng thử bản demo không?"
   → Ghi: Tên + mã HV + kênh liên lạc (Facebook/Zalo)
```

**Log mẫu (ghi ngay khi phỏng vấn):**

```
| Người trả lời | Mã HV/Vai | Câu hỏi 1 | Câu hỏi 2 | Câu hỏi 3 | Muốn cá nhân hoá? | Cam kết |
|---|---|---|---|---|---|---|
| HV01 | K4, lớp 3B | Không | Có (trả lời quá khó) | Có | Có muốn | Đồng ý thử ✓ |
```

**Tổng kết sau khảo sát:**
- Tổng số người hỏi
- Số người nói "không phù hợp trình độ" / "vô lý"
- % xác nhận pain cá nhân hoá

---

### Bước 5 (10 phút) — Update Canvas CP1 Dòng 4

**Mẫu nội dung dòng 4 canvas:**

```
4. Bằng chứng đầu:
   - Mining data Painpoint 1: XX/13.494 dòng (X.XX%) có understanding_level có giá trị → XX.XX% TRỐNG.
     Cách đếm: lọc understanding_level notna() và != ''.
   - Mining data Painpoint 2: XX/13.494 dòng (X.XX%) có grade_missing=True.
     Trong đó: XXXX% có move_used rỗng VÀ has_citation=False → segment "hỏng hoàn toàn".
   - Khảo sát nhanh XX học viên: XX/XX nói "câu trả lời không phù hợp trình độ" / "vô lý".
```

---

## 3. Công Việc Sau CP1 *(Đến CP4 — Hạn Chốt Spec 21:00 · 18/9/2026)*

### Mục tiêu
Bằng chứng đạt chuẩn **A hoặc B đầy đủ** cho rubric R1.

---

### Đường A — Khảo Sát (đạt chuẩn A)

**Yêu cầu:**
- ≥20 người ngoài nhóm
- ≥50% xác nhận pain
- Log đầy đủ: mỗi người ghi cả câu hỏi đã hỏi + từng câu trả lời nguyên văn

**Cách thực hiện:**

1. **Tiếp tục khảo sát** trong giờ nghỉ, giờ tan trường, nhắn tin
2. **Ghi log** theo format ở Bước 4 — mỗi người một dòng đầy đủ
3. **Viết file:** `validation/survey-log.md`

**Nội dung `validation/survey-log.md`:**

```markdown
# Survey Log — Pain: Tutor không cá nhân hoá theo mức hiểu + segment hỏng

## Thông tin chung
- Ngày khảo sát: XX/9/2026
- Người khảo sát: HV1 — Evidence Lead
- Tổng số người: XX

## Script câu hỏi đã dùng
1. "Câu trả lời tutor gần đây có phù hợp với trình độ của bạn không?"
2. "Bạn có gặp câu trả lời nào vô lý hoặc hiểu sai không?"
3. "Bạn có thấy tutor trả lời theo 'khuôn mẫu' giống nhau cho mọi người không?"
4. "Nếu tutor có thể điều chỉnh câu trả lời theo trình độ của bạn, bạn có muốn dùng thử không?"

## Kết quả chi tiết

| # | Người trả lời | Mã HV/Vai | Câu hỏi 1 | Câu hỏi 2 | Muốn cá nhân hoá? |
|---|---|---|---|---|---|
| 1 | HV01 | K4, 3B | Không | Có (quá khó) | Có muốn |

## Tổng kết
- Tổng người: XX
- Không phù hợp trình độ / vô lý: XX/XX (XX%)
- Muốn cá nhân hoá: XX/XX (XX%)
- Kết luận: ✅ đạt / ❌ chưa đạt tiêu chí A (≥50% xác nhận)
```

---

### Đường B — Mining (đạt chuẩn B)

**Yêu cầu:**
- Số đếm được (cụ thể, có cách đếm)
- ≥5 ví dụ nguyên văn cho MỖI painpoint (tối đa 2 câu/mỗi ví dụ)
- Phương pháp đếm người khác kiểm lại được

**Cách thực hiện:**

1. Chạy lại lệnh pandas với các filter khác nhau
2. Trích thêm ví dụ nếu cần
3. Viết file: `eval/mining-log.md`

**Nội dung `eval/mining-log.md`:**

```markdown
# Mining Log — Pain: Tutor không cá nhân hoá + segment hỏng

## Phương pháp đếm

### Cách đếm 1: Painpoint 1 — understanding_level trống
- Lọc: tất cả dòng
- Đếm: dòng có `understanding_level` notna() và != ''
- Kết quả: XX/13.494 (X.XX%) có giá trị → XX.XX% TRỐNG

### Cách đếm 2: Painpoint 2 — grade_missing
- Lọc: tất cả dòng
- Đếm: dòng có `grade_missing == True`
- Kết quả: XX/13.494 (X.XX%)

### Cách đếm 3: Đặc điểm grade_missing
- Lọc: grade_missing == True
- Đếm: dòng có `move_used` rỗng VÀ `has_citation == False`
- Kết quả: XX/XX (XX%) → segment "hỏng hoàn toàn"

## Ví dụ nguyên văn Painpoint 2 — Grade Missing (segment hỏng)

| # | Mã lượt | grade_missing | move_used | has_citation | Ghi chú |
|---|---|---|---|---|---|
| 1 | T00XXX | True | (rỗng) | False | Hỏng hoàn toàn |
| 2 | T00XXX | True | (rỗng) | False | Hỏng hoàn toàn |
| 3 | T00XXX | True | (rỗng) | False | Hỏng hoàn toàn |
| 4 | T00XXX | True | (rỗng) | False | Hỏng hoàn toàn |
| 5 | T00XXX | True | (rỗng) | False | Hỏng hoàn toàn |

## Ví dụ nguyên văn — Tutor không cá nhân hoá

| # | Mã lượt | Câu hỏi HV (≤2 câu) | Câu trả lời tutor (≤2 câu) | Ghi chú |
|---|---|---|---|---|
| 1 | T00XXX | "attention là gì?" | "[Câu trả lời A]" | Giống T00YYY |
| 2 | T00YYY | "attention mechanism?" | "[Câu trả lời A]" | Giống T00XXX |

## Kết luận
- Painpoint 1 tồn tại: ✅ Có (XX.XX% understanding_level trống)
- Painpoint 2 tồn tại: ✅ Có (XX dòng grade_missing = hỏng hoàn toàn)
- Đủ ví dụ: ✅ Có (5 ví dụ mỗi painpoint)
- Phương pháp kiểm lại được: ✅ Có
```

---

### R6 Bonus — Willing Users (tối đa +8 điểm)

**Yêu cầu:** ≥3 người ngoài nhóm đã hỏi và đồng ý thử.

**Ghi vào file:** `validation/willing-users.md`

```markdown
# Willing Users — Người đồng ý dùng thử prototype

## Tiêu chí
- Người thật, ngoài nhóm
- Đã hỏi và đồng ý thử
- Ghi: tên + vai + kênh liên lạc

## Danh sách

| # | Tên | Vai | Kênh liên lạc | Ngày hỏi | Cam kết |
|---|---|---|---|---|---|
| 1 | [HV01] | K4, 3B | Zalo: 0xxx | 17/9 | Đồng ý thử |
| 2 | [HV02] | K4, 3B | Zalo: 0xxx | 17/9 | Đồng ý thử |
| 3 | [HV03] | K4, 3B | Facebook | 17/9 | Đồng ý thử |
```

> **Lưu ý:** Nếu không đủ 3 willing users đến CP5 → mất 8 điểm R6. Ưu tiên hỏi trong giờ nghỉ CP1.

---

## 4. Bảng Impact — ≥3 Ứng Viên (PIVOT)

### Hướng dẫn điền

Với mỗi ứng viên, điền:
- **Bao nhiêu người:** ước lượng từ data + khảo sát
- **Tần suất:** mỗi khi hỏi / hàng tuần / hiếm khi
- **Mỗi lần tốn gì:** phút hỏi lại + rủi ro học sai
- **Build nổi không:** có / không (trong thời gian hackathon)
- **Chọn:** ✅ hoặc ❌ (kèm lý do)

### Mẫu bảng (PIVOT)

| Ứng viên | Bao nhiêu người | Tần suất | Mỗi lần tốn gì | Build nổi không | Chọn? |
|---|---|---|---|---|---|
| **1. Tutor không cá nhân hoá (A1c)** | ~1.000 HV × n lần/tuần | Mỗi lần hỏi tutor | Học sai trình độ (quá dễ/chá) + mất thời gian hỏi lại | Có — chỉ cần infer understanding từ lịch sử | ✅ **Đã chọn** |
| **2. Tutor trả lời segment hỏng (A1c)** | ~129 HV × n lần | Hiếm khi (0,96%) | Trả sai hoàn toàn → trust collapse | Có — chỉ cần detect grade_missing | ✅ **Đã chọn** |
| **3. Tutor không citation (A1c cũ)** | ~3.000 HV × n lần | Mỗi lần hỏi | Mất 5-10 phút dò slide tìm nguồn | Thứ yếu so với 2 painpoint trên | ❌ **Loại — vì:** ưu tiên painpoint 1 & 2 đã có số liệu cụ thể hơn |
| **4. [Thêm nếu có]** | ? | ? | ? | ? | ❌ / ✅ |

> **Lưu ý:** Ứng viên bị loại **PHẢI ghi lại lý do** — người chấm cần thấy nhóm đã cân nhắc kỹ.

---

## 5. Checklist Tự Đánh Giá

### Sau CP1 (19:30 · 17/9)

- [ ] Đã đọc ≥30 mẫu tutor_turns
- [ ] Đã chạy pandas đếm understanding_level (có số cụ thể)
- [ ] Đã chạy pandas đếm grade_missing (có số cụ thể)
- [ ] Đã trích ≥5 ví dụ grade_missing (segment hỏng)
- [ ] Đã trích ≥5 ví dụ tutor không cá nhân hoá
- [ ] Đã khảo sát ≥10 người (CP1)
- [ ] Đã ghi log đầy đủ: câu hỏi + câu trả lời nguyên văn
- [ ] Đã hỏi và có ≥3 willing users đồng ý thử
- [ ] Đã update `canvas-cp1.md` dòng 4 với số mới nhất

### Sau CP4 (21:00 · 18/9) — Trước Hạn Chốt Spec

- [ ] Đã đọc ≥50 mẫu tutor_turns
- [ ] Đã chạy pandas đếm cả 2 painpoint (≥2 cách đếm khác nhau)
- [ ] Đã trích ≥5 ví dụ mỗi painpoint (tối đa 2 câu mỗi cái)
- [ ] Đã khảo sát ≥20 người (CP4)
- [ ] Đã ghi log đầy đủ câu hỏi + câu trả lời cho mọi người
- [ ] Đã có ≥3 willing users (tên + vai + kênh liên lạc)
- [ ] Đã viết xong `mining-log.md` hoặc `survey-log.md`
- [ ] Đã viết xong `willing-users.md`
- [ ] Đã update `canvas-cp1.md` dòng 4 với số mới nhất
- [ ] Đã điền bảng impact ≥3 ứng viên (có lý do loại)

---

## 6. Cảnh Báo & Lỗi Thường Gặp (PIVOT)

### Nghiêm trọng (mất điểm trực tiếp)

| Lỗi | Hậu quả | Cách tránh |
|---|---|---|
| **Không đếm được số** | 0 điểm R1 — "cảm tính không phải bằng chứng" | Luôn chạy pandas, ghi kết quả ra giấy |
| **Không có log** | TA không xác minh được → bằng chứng không được tính | Ghi ngay khi phỏng vấn, không nhớ lại sau |
| **Quote dài quá 2 câu** | Vi phạm bảo mật, không được tính | Tập trích ngắn ngay trong CSV |

### Thường gặp (giảm điểm)

| Lỗi | Vấn đề | Cách tránh |
|---|---|---|
| **"Nhiều bạn thấy vậy"** | Không cụ thể, không đếm được | Thay bằng "11/18 người nói..." |
| **Cách đếm không mô tả** | Người khác không kiểm lại được | Ghi rõ: lọc gì, đếm gì, trên bao nhiêu dòng |
| **Thiếu willing users đến CP5** | Mất 8 điểm R6 bonus | Hỏi ngay từ CP1, không đợi |
| **Không cập nhật canvas sau mỗi lượt đo** | Dòng 4 canvas không có số mới nhất | Sau mỗi lần chạy đếm → cập nhật ngay |

### Lỗi phỏng vấn (thu bằng chứng vô giá trị)

| Sai | Đúng (PIVOT) |
|---|---|
| "Bạn có thích tính năng gắn mã trang không?" | "Câu trả lời tutor gần đây có phù hợp với trình độ của bạn không?" |
| "Bạn sẽ dùng chứ?" | "Bạn đồng ý dùng thử bản demo hôm nay/thứ Năm chứ?" |
| Hỏi chung "bạn thấy tutor thế nào?" | Hỏi cụ thể: "Bạn có gặp câu trả lời nào vô lý hoặc hiểu sai không?" |

---

## 7. Deliverables — File HV1 Phải Tạo Trong Repo

### Bắt buộc

| File | Nội dung | Deadline |
|---|---|---|
| `HV1-evidence.md` | File hướng dẫn này (đã tạo) | CP1 |
| `eval/mining-log.md` | Số đếm được cho 2 painpoint + ≥5 ví dụ mỗi painpoint + phương pháp đếm | CP4 |
| `validation/survey-log.md` | Log khảo sát ≥20 người (câu hỏi + từng câu trả lời) | CP4 |
| `validation/willing-users.md` | Tên + vai + kênh liên lạc + đồng ý thử | CP1 (≥3) |
| `canvas-cp1.md` (update dòng 4) | Số đếm mới nhất cho 2 painpoint | Sau mỗi lượt đo |

### Cấu trúc thư mục đề xuất

```
K4-3B-E402-CiteTutor/
├── HV1-evidence.md          ← File này
├── canvas-cp1.md            ← Canvas nhóm (update dòng 4)
├── spec.md                  ← Spec nhóm (HV1 cung cấp §1-§2)
├── eval/
│   └── mining-log.md       ← Số đếm 2 painpoint + ví dụ + phương pháp
└── validation/
    ├── survey-log.md       ← Log khảo sát ≥20 người
    └── willing-users.md    ← Danh sách ≥3 willing users
```

---

## 8. Tài Nguyên Tham Chiếu

| File | Mục | Dùng khi nào |
|---|---|---|
| `01-challenge-brief.md` | "5 tiêu chí nghiệm thu" (§5) | Hiểu rõ tiêu chí 2 |
| `02-guide.md` | §1.3 (mining) · §1.4 (impact table) · §4.2 (validation) | Cách mining + khảo sát |
| `04-rubric.md` | R1 (15đ) · R6 (+8 bonus) | Biết điểm được/tổn |
| `data/vlearn-pack/chatlog/DATA_DICTIONARY.md` | Giải thích tất cả trường | Hiểu cấu trúc CSV |
| `further-reading/mom-test-summary.md` | Câu nên hỏi / nên tránh | Chạy phỏng vấn |
| `examples/canvas-cp1.md` | 3 mẫu canvas đạt | Viết dòng 4 canvas |
| `tracks/track-a-vlearn-tutor.md` | Chi tiết track A1c | Hiểu bài toán |

---

## 9. Tiêu Chí Xuất Sắc — Checklist HV1 Hoàn Hảo

- [x] Mỗi bước có con số cụ thể (20', ≥30 mẫu, ≥5 ví dụ mỗi painpoint, ≥20 người)
- [x] Có lệnh code sẵn (pandas) để HV1 copy chạy ngay — cho cả 2 painpoint
- [x] Có script câu hỏi phỏng vấn sẵn (Mom Test, 5 câu) — câu hỏi PIVOT mới
- [x] Có bảng impact 3+ ứng viên với lý do loại bằng số
- [x] Có checklist tự đánh giá sau CP1 và sau CP4
- [x] Có deliverables file rõ ràng với cấu trúc thư mục
- [x] Cảnh báo lỗi thường gặp với cách tránh cụ thể

---

## Ghi Chú Khi Làm Việc (PIVOT)

### Thứ tự ưu tiên
1. **Chạy pandas đếm understanding_level** (Bước 2) — có số → painpoint 1
2. **Chạy pandas đếm grade_missing** (Bước 2) — có số → painpoint 2
3. **Trích 5 ví dụ grade_missing** (Bước 3a) — chỉ ra "hỏng hoàn toàn"
4. **Trích 5 ví dụ không cá nhân hoá** (Bước 3b) — chỉ ra painpoint 1
5. **Khảo sát 10 người** (Bước 4) — có quote → pain là thật
6. **Hỏi 3 willing users** — có cam kết → được +8 bonus
7. **Viết log** — có log → bằng chứng được xác minh

### Khi gặp khó khăn
- **Không đọc được CSV:** Dùng Google Sheets import file → lọc bằng filter
- **Không biết cách hỏi:** Quay lại script 5 câu ở Bước 4 — hỏi y chang
- **Không đủ người để khảo sát:** Nhắn tin riêng cho bạn cùng lớp, hoặc hỏi trong nhóm chat
- **Willing user nói "thử thôi":** Vẫn ghi là đồng ý — miễn là có tên + kênh liên lạc

---

## PIVOT NOTES

**Điều thay đổi so với phiên bản cũ:**

| Nội dung | Cũ | Mới |
|---|---|---|
| Mining focus | Đếm citation rỗng | Đếm understanding_level + grade_missing |
| Painpoint 1 | Citation không có mã trang | Understanding level 99,85% trống |
| Painpoint 2 | Không có | Grade missing: 129 dòng hỏng hoàn toàn |
| Khảo sát | "Biết trang nào không?" | "Phù hợp trình độ không?" + "Vô lý không?" |
| Impact table | Citation là ưu tiên | Cá nhân hoá + segment hỏng là ưu tiên |

---

*HV1 Evidence Lead · K4-3B-E402-CiteTutor · Hackathon AI20k Batch 04*
