# thi.ai.vn — Mockup Design Spec

- **Ngày:** 2026-10-16
- **Trạng thái:** Chờ duyệt
- **Loại:** Clickable prototype (mockup) — frontend-only, dữ liệu giả, logic mô phỏng chạy thật

## 1. Mục tiêu

Dựng mockup web **thi.ai.vn** — nền tảng thi & ôn luyện trực tuyến K12, tập trung **Toán** và **Tiếng Anh** — để **demo cho nhà đầu tư / nhà trường**. Ưu tiên: đẹp, ấn tượng, animation mượt, cảm giác vui vẻ; mỗi chức năng phải thể hiện được **UI + logic vận hành** qua một luồng bấm được từ đầu đến cuối.

### Thông điệp chủ đạo
1. **Ngân hàng 40.000 câu hỏi được Nhà xuất bản phê duyệt**, chuẩn khung chương trình GDPT 2018 → **tổ chức thi được ngay**, không cần soạn đề.
2. **AI đánh giá năng lực** → **Learning Zone**: luyện tập đúng vùng vừa sức, mở rộng dần.
3. Trải nghiệm học vui như chơi game, đồng hành cùng linh vật **Bé Cú**.

### Tiêu chí thành công
- Một luồng demo ~5 phút chạy trơn tru, không lỗi, không màn hình trống.
- Mỗi màn hình có ít nhất một khoảnh khắc "wow" về animation.
- Logic đánh giá năng lực và Learning Zone phản ứng nhìn thấy được theo câu trả lời thật của người demo.
- Có link Vercel để gửi người xem tự bấm thử.

## 2. Phạm vi

### Trong phạm vi
- Phía **học sinh**: Landing, Dashboard, Ngân hàng đề / Luyện tập, AI đánh giá năng lực, Learning Zone, Phòng thi.
- Teaser cho **nhà trường** trên Landing (demo "Tạo đề trong vài giây").
- Ưu tiên **desktop/laptop** (≥1280px là chuẩn trình chiếu); mobile chỉ cần hiển thị không vỡ.

### Ngoài phạm vi
- Admin / giao diện quản trị cho nhà trường, giáo viên.
- Đăng nhập thật, backend, database, gọi LLM thật.
- Chấm phát âm / chấm viết thật (chỉ mô phỏng).
- Chống gian lận bằng camera.

## 3. Người dùng demo

Hồ sơ mặc định: **"Minh", lớp 9** (năm ôn thi vào 10). Có công tắc đổi khối (lớp 6 / 9 / 12) ở góc màn hình để thấy nội dung thay đổi theo khối. Nút **"Reset demo"** xoá toàn bộ tiến độ để trình bày lại.

## 4. Cấu trúc trang & luồng

| Route | Màn hình | Nội dung chính | Khoảnh khắc "wow" |
|---|---|---|---|
| `/` | Landing | Hero + Bé Cú; số **40.000** đếm lên, huy hiệu "NXB phê duyệt · Chuẩn GDPT 2018"; 3 trụ cột (Ngân hàng & Luyện tập, AI đánh giá, Learning Zone); section nhà trường "Tổ chức thi ngay" với demo tạo đề; CTA | Bé Cú chào + mắt dõi theo con trỏ; scroll-reveal; demo chọn lớp/chương/ma trận mức độ → "Tạo đề" → đề sinh ra có animation |
| `/dashboard` | Trang chủ học sinh (bento) | Streak, XP, radar năng lực Toán/Anh, thẻ Learning Zone (vòng vùng hiện tại), nhiệm vụ hôm nay, lịch thi sắp tới | Số liệu đếm lên, radar vẽ dần, Bé Cú nhắc nhiệm vụ |
| `/luyen-tap` | Ngân hàng đề | Cây **Lớp → Chương → Bài → Kiến thức**, mỗi nút hiển thị số câu; bộ đề Luyện nhanh (10 câu) / Đề tổng hợp; mỗi câu gắn nhãn mức độ + huy hiệu NXB | Thẻ bộ đề nghiêng 3D khi hover; mở cây có animation |
| `/luyen-tap/[id]` | Làm bài luyện tập | Từng câu một, phản hồi ngay, gợi ý từng bước, lời giải "AI giải thích" | Bé Cú phản ứng đúng/sai, combo streak, confetti cuối phiên |
| `/danh-gia` | AI đánh giá năng lực | Intro → test thích ứng ~12 câu (thanh độ khó hiển thị realtime) → màn "AI đang phân tích" → Báo cáo: radar theo kiến thức, mức tổng thể, nhận xét AI, CTA "Vào Learning Zone" | Thanh độ khó nhảy theo câu trả lời; màn phân tích animation; báo cáo reveal từng phần |
| `/learning-zone` | Learning Zone | Sơ đồ 3 vòng (Đã thành thạo · **Vùng học tập** · Quá sức) với các kiến thức là chấm trên vòng; phiên luyện liên tục chọn câu vừa sức; thông báo mở rộng vùng | Vòng xanh **nở rộng** khi năng lực tăng; kiến thức "quá sức" dịch vào "vừa sức"; toast "Vùng của em vừa mở rộng!" |
| `/phong-thi` | Phòng thi | Danh sách bài thi (15 phút / 45 phút / giữa kỳ / cuối kỳ) → phòng chờ (quy chế, đếm ngược vào thi) → làm bài → xác nhận nộp → kết quả | Đồng hồ đếm ngược, bảng điều hướng câu, cảnh báo chuyển tab, hiệu ứng nộp bài |

### Luồng demo chính (~5 phút)
Landing → Dashboard → AI đánh giá năng lực → báo cáo chỉ ra điểm yếu (vd. "Hàm số bậc nhất") → Learning Zone đặt kiến thức đó vào vùng học tập → luyện một phiên → vùng mở rộng, năng lực tăng trên Dashboard → ghé Phòng thi trải nghiệm bài 45 phút.

## 5. Learning Zone — định nghĩa

Learning Zone là **vùng vừa sức** theo mô hình 3 vòng:
- **Vòng trong — Đã thành thạo:** quá dễ, không luyện thêm (chỉ ôn lại thỉnh thoảng).
- **Vòng giữa — Learning Zone:** câu có xác suất làm đúng **~70–85%**. Hệ thống luôn chọn câu ở đây.
- **Vòng ngoài — Quá sức:** xác suất đúng < 50%, chưa mở.

Vùng **mở rộng dần**: khi năng lực một kiến thức vượt ngưỡng, hệ thống nâng mức độ (Nhận biết → Thông hiểu → Vận dụng → Vận dụng cao) hoặc mở kiến thức kế tiếp theo khung chương trình (quan hệ tiên quyết).

## 6. Dạng câu hỏi

Mỗi dạng là một component độc lập, có đủ trạng thái: chưa trả lời · đã chọn · đúng · sai · hiện lời giải.

| Nhóm | Dạng |
|---|---|
| Chung | Trắc nghiệm 4 lựa chọn; **Đúng/Sai 4 ý** (cấu trúc thi mới); Chọn nhiều đáp án; Sắp xếp thứ tự |
| Toán | Trắc nghiệm có công thức (KaTeX); **Trả lời ngắn** nhập số/biểu thức (MathLive); Kéo thả sắp xếp các bước giải; Đồ thị tương tác (kéo điểm vẽ đường thẳng) |
| Tiếng Anh | Chọn từ/ngữ pháp; **Nghe** (TTS trình duyệt) → chọn đáp án; **Điền từ** kéo thả; **Ghép cặp** từ–nghĩa/hình; **Nói** (ghi âm, mô phỏng chấm phát âm); **Viết** đoạn ngắn (mô phỏng AI chấm theo tiêu chí) |

Interface chung: `QuestionView({ question, state, onAnswer })` — dùng lại ở Luyện tập, Đánh giá, Learning Zone, Phòng thi (Phòng thi tắt phản hồi tức thì).

## 7. Logic mô phỏng (frontend, hàm thuần)

### 7.1 Dữ liệu ngân hàng
- ~150–200 câu mẫu thật (Toán & Anh, ưu tiên lớp 9; một ít lớp 6, 12 cho công tắc khối). Hiển thị tổng **40.000** (số marketing; số câu theo từng nút cây được sinh giả lập nhất quán).
- Schema câu: `{ id, subject, grade, chapter, lesson, skill, level: 'NB'|'TH'|'VD'|'VDC', b (độ khó, -3..3), type, content, options?, answer, explanation, hints[], source: 'NXB' }`.
- Cây chương trình: `Subject → Grade → Chapter → Lesson → Skill`, mỗi skill có `prerequisites[]`.

### 7.2 Mô hình năng lực (`lib/engine/irt.ts`)
- IRT 1 tham số (Rasch): `P(đúng) = 1 / (1 + e^-(θ - b))`.
- Cập nhật θ theo từng skill sau mỗi câu (ước lượng EAP/MAP đơn giản trên lưới θ, hoặc cập nhật gradient có bước giảm dần). θ hiển thị quy đổi sang thang 0–100.

### 7.3 AI đánh giá năng lực (`assessment.ts`)
- ~12 câu, bắt đầu ở b ≈ 0; mỗi bước chọn câu chưa dùng có **thông tin Fisher lớn nhất** tại θ hiện tại, xoay vòng phủ các skill chính.
- Kết quả: θ theo skill, mức tổng thể (Cần cố gắng / Trung bình / Khá / Giỏi), top 2 điểm mạnh / 2 điểm yếu.
- **Nhận xét AI**: văn bản ghép từ template theo kết quả (không gọi LLM), hiển thị kiểu gõ chữ dần.

### 7.4 Learning Zone (`learning-zone.ts`)
- Phân loại mỗi (skill, level) theo P tại θ hiện tại: ≥ 85% → Thành thạo; 50–85% → Vùng học tập (mục tiêu 70–85%); < 50% → Quá sức.
- Chọn câu tiếp theo: trong Vùng học tập, ưu tiên P gần 0.78, ưu tiên skill yếu, tránh lặp.
- Mở rộng: khi skill đạt ngưỡng thành thạo ở một level → mở level kế tiếp; khi đạt ở VD → mở skill có tiên quyết đã thoả. Phát sự kiện `zoneExpanded` để UI animation.

### 7.5 Gamification
XP theo độ khó (+ thưởng combo), streak ngày, combo đúng liên tiếp, huy hiệu (Lần đầu đánh giá, Combo 5, Mở rộng vùng…).

### 7.6 Phòng thi (`exam.ts`)
- Đồng hồ đếm ngược (dựa trên timestamp bắt đầu, không phụ thuộc tab active); tự nộp khi hết giờ.
- Bảng điều hướng câu: đã làm / chưa làm / đánh dấu xem lại.
- Tự lưu bài vào localStorage mỗi lần trả lời; reload trang khôi phục bài đang làm.
- `visibilitychange` / `blur` → modal cảnh báo + đếm số lần vi phạm (hiển thị trong kết quả).
- Xác nhận trước khi nộp (cảnh báo câu chưa làm).
- Kết quả: điểm thang 10, đúng/sai theo mức độ, xem lại từng câu với lời giải.

### 7.7 Trạng thái
Zustand store (hồ sơ, θ theo skill, XP/streak, lịch sử, bài thi đang làm) persist vào localStorage. Nút Reset demo xoá store. Lần đầu vào có dữ liệu seed hợp lý (streak 6 ngày, vài lịch sử) để Dashboard không trống.

## 8. Hệ thống hình ảnh — Pastel Clay 3D

- **Font:** Lexend (tiêu đề), Be Vietnam Pro (nội dung).
- **Màu:** nền kem `#FFF4EC` → xanh nhạt `#EEF3FF`; chính cam san hô `#FF8A65`; phụ lavender `#A8B5FF`; đúng = mint; sai = hồng đào nhạt (không đỏ gắt). Toán = lavender, Tiếng Anh = cam đào.
- **Khối:** bo góc 20–24px, bóng mềm, nút có "độ dày" đất sét (bóng đáy, lún khi nhấn).
- **Bé Cú:** cú robot (thân lavender, mặt trắng, mắt to, ăng-ten đầu cam). Component SVG, prop `state`: `idle` (thở, chớp mắt) · `thinking` (ăng-ten nhấp nháy) · `correct` (nhảy) · `wrong` (nghiêng đầu động viên) · `celebrate` (xoay + confetti) · `cheer` (vẫy cánh). Thiết kế để sau thay bằng file Rive mà không đổi interface.

### Nguyên tắc animation
- Motion spring, 200–400ms; chuyển route bằng slide + fade (AnimatePresence).
- Số đếm lên, chart vẽ dần, thẻ tilt 3D khi hover, nút lún khi nhấn, canvas-confetti cho ăn mừng.
- Tôn trọng `prefers-reduced-motion`.

## 9. Kỹ thuật

- **Stack:** Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui (tuỳ biến theo phong cách clay), Motion, Zustand, KaTeX, MathLive, canvas-confetti, Recharts (radar).
- **Cấu trúc:**
  ```
  app/                  # routes ở mục 4
  components/owl/       # Bé Cú + trạng thái
  components/questions/ # mỗi dạng câu = 1 component
  components/ui/        # button, clay card, progress, radar, zone-rings...
  lib/bank/             # câu hỏi mẫu + cây chương trình
  lib/engine/           # irt.ts, assessment.ts, learning-zone.ts, exam.ts
  lib/store/            # Zustand + persist
  ```
- **Kiểm thử:** unit test (Vitest) cho `lib/engine/*` (xác suất, cập nhật θ, chọn câu, phân vùng/mở rộng, timer & tự nộp). Kiểm tra thủ công luồng demo trên desktop.
- **Deploy:** Vercel (preview link để chia sẻ).

## 10. Rủi ro & lưu ý
- Câu hỏi mẫu cần đúng chuyên môn — soạn cẩn thận, ưu tiên ít mà chuẩn.
- Con số 40.000 và "NXB phê duyệt" là thông điệp sản phẩm; mockup chỉ chứa câu mẫu.
- MathLive và ghi âm phụ thuộc trình duyệt — demo trên Chrome desktop.
