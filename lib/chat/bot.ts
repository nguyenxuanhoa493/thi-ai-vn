/**
 * Bé Cú — bot hỏi đáp KỊCH BẢN (scripted) cho bản demo, không dùng AI thật.
 * Có thể thay bằng LLM (vd. Vercel AI Gateway) sau này mà giữ nguyên giao diện `reply`:
 * UI luôn `await` kết quả nên chỉ cần đổi sang hàm async.
 */
export interface BotReply { text: string; chips?: string[]; link?: { href: string; label: string } }
export interface BotContext { pathname?: string }

export function normalize(s: string): string {
  return s.toLowerCase().replace(/đ/g, 'd').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

interface Intent { id: string; kw: string[]; answer: BotReply }

const MAIN_CHIPS = ['Learning Zone là gì?', 'Phòng thi hoạt động sao?', 'Bắt đầu từ đâu?', 'Giá bao nhiêu?'];

const INTENTS: Intent[] = [
  { id: 'greeting', kw: ['xin chao', 'chao', 'hello', 'hi', 'alo', 'hey'], answer: { text: 'Chào em! Bé Cú đây. Em muốn biết gì về thi.ai.vn nào?', chips: MAIN_CHIPS } },
  { id: 'learning-zone', kw: ['learning zone', 'vung vua suc', 'vung hoc', 'zone', 'vua suc'], answer: { text: 'Learning Zone là vùng vừa sức: câu hỏi khó vừa đủ để em làm đúng khoảng 70–85%. Khi em làm tốt, vùng này mở rộng dần.', link: { href: '/learning-zone', label: 'Vào Learning Zone →' }, chips: ['AI đánh giá năng lực', 'Mẹo học hiệu quả'] } },
  { id: 'assessment', kw: ['danh gia', 'nang luc', 'ai danh gia', 'kiem tra dau vao', '12 cau', 'thich ung'], answer: { text: 'AI đánh giá năng lực gồm 12 câu thích ứng: câu sau dễ hay khó hơn tuỳ vào câu em vừa làm. Xong là em có Learning Zone riêng.', link: { href: '/danh-gia', label: 'Làm bài đánh giá →' }, chips: ['Learning Zone là gì?'] } },
  { id: 'bank', kw: ['40000', '40 000', 'bao nhieu cau', 'ngan hang', 'nxb', 'nha xuat ban', 'sach giao khoa', 'gdpt', 'gdpt 2018', 'chuong trinh'], answer: { text: 'Ngân hàng có hơn 40.000 câu hỏi, bám sách giáo khoa được NXB phê duyệt theo chương trình GDPT 2018.', chips: ['Các dạng câu hỏi', 'Có những môn nào?'] } },
  { id: 'question-types', kw: ['dang cau hoi', 'dang cau', 'loai cau hoi', 'trac nghiem', 'dien khuyet', 'tu luan', 'kieu cau'], answer: { text: 'Có nhiều dạng: trắc nghiệm, điền đáp án, nhập công thức toán và nhiều kiểu khác. Em sẽ gặp thử khi luyện tập nhé!', link: { href: '/luyen-tap', label: 'Thử luyện tập →' } } },
  { id: 'practice', kw: ['luyen tap', 'bat dau', 'tu dau', 'on tap', 'hoc the nao', 'bat dau tu dau', 'lam bai'], answer: { text: 'Em vào Luyện tập, chọn môn rồi làm theo gợi ý của Bé Cú. Nên làm bài đánh giá trước để có Learning Zone riêng.', link: { href: '/luyen-tap', label: 'Vào Luyện tập →' }, chips: ['AI đánh giá năng lực'] } },
  { id: 'exam-room', kw: ['phong thi', 'thi 45', '45 phut', '15 phut thi', 'giua ky', 'cuoi ky', 'bai thi', 'tu luu', 'thi thu', 'de thi'], answer: { text: 'Phòng thi có các đề 15 phút, 45 phút, giữa kỳ và cuối kỳ. Bài được tự lưu trong lúc làm, nên em đừng lo mất bài.', link: { href: '/phong-thi', label: 'Vào Phòng thi →' }, chips: ['Có chống gian lận không?'] } },
  { id: 'anticheat', kw: ['gian lan', 'chuyen tab', 'chong gian lan', 'canh bao', 'copy', 'quay cop'], answer: { text: 'Trong phòng thi, nếu em chuyển tab hệ thống sẽ cảnh báo để giữ bài thi công bằng. Đây là bản demo nên chỉ nhắc nhở thôi.' } },
  { id: 'school', kw: ['nha truong', 'truong hoc', 'dang ky', 'to chuc thi', 'tao de', 'nha truong dang ky', 'doanh nghiep'], answer: { text: 'Nhà trường có thể tổ chức thi và tạo đề từ ngân hàng câu hỏi. Em xem thử trình dựng đề minh hoạ ở trang chủ nhé; đăng ký chính thức sẽ mở sau.', link: { href: '/', label: 'Về trang chủ →' } } },
  { id: 'teacher', kw: ['giao vien', 'thay co', 'co giao', 'giang vien'], answer: { text: 'Giáo viên có thể chọn câu hỏi, dựng đề và theo dõi kết quả của học sinh. Hiện tại là bản minh hoạ để xem giao diện.' } },
  { id: 'parent', kw: ['phu huynh', 'bao cao', 'bo me', 'ba me', 'cha me', 'theo doi con'], answer: { text: 'Phụ huynh sẽ nhận báo cáo tiến bộ rõ ràng: con mạnh phần nào, cần ôn thêm phần nào. Bản demo có báo cáo mẫu ở trang chủ.', link: { href: '/', label: 'Xem báo cáo mẫu →' } } },
  { id: 'gamification', kw: ['xp', 'streak', 'huy hieu', 'diem kinh nghiem', 'chuoi ngay', 'phan thuong'], answer: { text: 'Mỗi câu đúng em nhận XP, học đều mỗi ngày giữ streak, và còn nhiều huy hiệu để sưu tầm nữa!', link: { href: '/dashboard', label: 'Xem tiến độ →' } } },
  { id: 'sound', kw: ['am thanh', 'bat tat', 'loa', 'mute', 'nhac'], answer: { text: 'Em bấm nút loa ở góc trên để bật hoặc tắt âm thanh nhé. Loa gạch chéo nghĩa là đang tắt.' } },
  { id: 'grade', kw: ['doi lop', 'chon lop', 'chuyen lop', 'lop may'], answer: { text: 'Em chọn lớp ở ô "Lớp" trên thanh trên cùng. Câu hỏi và Learning Zone sẽ đổi theo lớp em chọn.' } },
  { id: 'reset', kw: ['reset', 'dat lai', 'lam lai tu dau', 'xoa tien do', 'xoa du lieu'], answer: { text: 'Em bấm nút Đặt lại demo ở góc trên để xoá tiến độ và bắt đầu lại từ đầu nhé.' } },
  { id: 'price', kw: ['gia', 'bao nhieu tien', 'mien phi', 'phi', 'tra tien', 'thanh toan', 'hoc phi', 'free'], answer: { text: 'Bản demo miễn phí cho em trải nghiệm; gói cho nhà trường sẽ công bố sau.', chips: ['Nhà trường đăng ký thế nào?'] } },
  { id: 'mobile', kw: ['dien thoai', 'may tinh bang', 'mobile', 'ipad', 'ung dung'], answer: { text: 'Em dùng được trên điện thoại, máy tính bảng lẫn máy tính; giao diện tự co giãn cho vừa màn hình.' } },
  { id: 'subjects', kw: ['mon gi', 'mon hoc', 'nhung mon', 'mon nao', 'toan', 'tieng anh'], answer: { text: 'Hiện demo hỗ trợ hai môn: Toán và Tiếng Anh. Các môn khác sẽ bổ sung sau.', chips: ['Lớp nào được hỗ trợ?'] } },
  { id: 'grades', kw: ['lop nao', 'lop 6', 'lop 9', 'lop 12', 'khoi'], answer: { text: 'Bản demo có lớp 6, lớp 9 và lớp 12. Em đổi lớp bất cứ lúc nào ở thanh trên cùng.' } },
  { id: 'login', kw: ['mat khau', 'dang nhap', 'tai khoan', 'quen mat', 'login', 'dang ky tai khoan'], answer: { text: 'Bản demo chưa có đăng nhập, nên em không cần tài khoản hay mật khẩu. Cứ vào học thôi!' } },
  { id: 'tips', kw: ['meo', 'hoc hieu qua', 'hoc tot', 'cach hoc', 'phuong phap', 'loi khuyen', 'tips'], answer: { text: 'Mẹo của Bé Cú: học vừa sức, mỗi ngày khoảng 15 phút, đều đặn còn hơn học dồn. Câu sai thì xem lại giải thích nhé!', link: { href: '/learning-zone', label: 'Vào Learning Zone →' } } },
  { id: 'thanks', kw: ['cam on', 'thanks', 'thank', 'cảm ơn', 'gioi qua', 'tuyet'], answer: { text: 'Không có gì đâu! Bé Cú luôn sẵn sàng giúp em' } },
  { id: 'bye', kw: ['tam biet', 'bye', 'goodbye', 'hen gap lai', 'di day', 'thoat'], answer: { text: 'Hẹn gặp lại em nhé! Học vui, đều mỗi ngày' } },
  { id: 'who', kw: ['be cu la ai', 'cu la ai', 'ban la ai', 'ai vay', 'ten gi', 'con cu', 'be cu', 'tro ly'], answer: { text: 'Bé Cú là trợ lý của thi.ai.vn, luôn đồng hành cùng em khi học. Lưu ý: đây là bot kịch bản của bản demo, trả lời theo các chủ đề có sẵn.', chips: MAIN_CHIPS } },
  { id: 'encourage', kw: ['buon', 'chan', 'met', 'nan', 'chan qua', 'met qua', 'khong muon hoc', 'hoc khong noi'], answer: { text: 'Bé Cú hiểu mà. Mình nghỉ 5 phút rồi luyện vài câu vừa sức nhé — làm đúng sẽ vui hơn đó!', link: { href: '/learning-zone', label: 'Vào Learning Zone →' } } },
  { id: 'smalltalk', kw: ['khoe khong', 'the nao roi', 'vui', 'dang lam gi', 'yeu', 'dep'], answer: { text: 'Bé Cú khoẻ lắm, cảm ơn em! Mình cùng học một chút cho vui nhé', chips: ['Bắt đầu từ đâu?', 'Mẹo học hiệu quả'] } },
];

export const INTENT_IDS = INTENTS.map((i) => i.id);

const FALLBACK: BotReply = {
  text: 'Bé Cú chưa hiểu lắm. Em thử hỏi về: Learning Zone, phòng thi, ngân hàng câu hỏi hay giá nhé.',
  chips: ['Learning Zone là gì?', 'Phòng thi hoạt động sao?', 'Ngân hàng câu hỏi', 'Giá bao nhiêu?'],
};

function score(padded: string, kws: string[]): number {
  let s = 0;
  for (const raw of kws) {
    const kw = normalize(raw);
    if (!kw) continue;
    if (padded.includes(` ${kw} `)) s += 1 + kw.length / 10;
  }
  return s;
}

function greeting(pathname?: string): BotReply {
  const p = pathname ?? '';
  const base = INTENTS[0].answer;
  if (p.startsWith('/learning-zone')) return { ...base, text: 'Chào em! Đây là Learning Zone. Mẹo: thử làm các câu ở vùng vừa sức trước, làm tốt thì vùng sẽ mở rộng dần.' };
  if (p.startsWith('/phong-thi')) return { ...base, text: 'Chào em! Em đang ở Phòng thi. Bài được tự lưu, em cứ bình tĩnh làm nhé.' };
  if (p.startsWith('/luyen-tap')) return { ...base, text: 'Chào em! Em đang ở Luyện tập. Chọn môn rồi làm vài câu cho vui nhé.' };
  if (p.startsWith('/danh-gia')) return { ...base, text: 'Chào em! Bài đánh giá có 12 câu thích ứng, em cứ làm hết sức nhé' };
  return base;
}

/** Đồng bộ nay; giao diện vẫn `await` để sau này đổi sang LLM mà không sửa UI. */
export function reply(input: string, ctx: BotContext = {}): BotReply {
  const padded = ` ${normalize(input)} `;
  if (padded.trim() === '') return FALLBACK;
  let best: Intent | null = null;
  let bestScore = 0;
  for (const it of INTENTS) {
    const s = score(padded, it.kw);
    if (s > bestScore) { best = it; bestScore = s; }
  }
  if (!best) return FALLBACK;
  return best.id === 'greeting' ? greeting(ctx.pathname) : best.answer;
}
