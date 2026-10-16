# thi.ai.vn — Mockup

Clickable prototype nền tảng thi & ôn luyện K12 (Toán, Tiếng Anh). Frontend-only, dữ liệu mẫu, logic mô phỏng chạy thật.

## Chạy
```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit test engine + component
```

Bản build như production: `npm run build && npm run start`.

## Kịch bản demo (~5 phút)
1. `/` Landing → "Học thử miễn phí"
2. `/dashboard` → "Làm bài đánh giá"
3. `/danh-gia` → 12 câu thích ứng → báo cáo → "Vào Learning Zone"
4. `/learning-zone` → "Luyện ngay" → trả lời đúng liên tục để thấy vùng mở rộng
5. `/phong-thi` → bài 15 phút → thử reload / chuyển tab → nộp bài

Nút ↺ trên thanh điều hướng = Reset demo. Bộ chọn "Lớp" đổi khối 6/9/12.

Mẹo khi trình diễn:
- Bấm ↺ "Đặt lại demo" ngay trước khi trình diễn để bắt đầu từ trạng thái mẫu (không còn tiến độ của lần chạy thử).
- Không làm lại bài đánh giá sau khi đã luyện trong Learning Zone: kết quả đánh giá mới sẽ ghi đè bản đồ vùng và điểm tiến bộ.
- Dùng Chrome trên máy tính để trình diễn (giọng đọc, micro và hiệu ứng ổn định nhất).
- Nút bật/tắt âm thanh 🔊/🔇 nằm ở thanh trên cùng của ứng dụng và ở thanh điều hướng trang chủ; tuỳ chọn được ghi nhớ và không bị xoá khi Đặt lại demo.
- Chatbot Bé Cú (nút nổi góc phải) là bot kịch bản, chỉ trả lời các chủ đề có sẵn, không dùng AI thật.
- Ở bài đánh giá, trả lời đúng vài câu dễ và bấm "Bỏ qua câu này" ở câu khó để báo cáo có điểm mạnh / cần tập trung rõ ràng.
- Reload giữa bài thi không bị tính là rời màn hình; chuyển tab thì có.
- Dạng câu "Nói" và "Nghe" dùng micro / giọng đọc của trình duyệt (Chrome cho kết quả tốt nhất).

## Cấu trúc
- `lib/engine/*`: IRT/Rasch, đánh giá thích ứng, Learning Zone, chấm thi (hàm thuần, có test)
- `lib/bank/*`: khung chương trình, câu hỏi mẫu, đề thi
- `components/questions/*`: 11 dạng câu hỏi
- `components/owl/owl.tsx`: Bé Cú (thay bằng Rive sau này mà không đổi interface `state`)
