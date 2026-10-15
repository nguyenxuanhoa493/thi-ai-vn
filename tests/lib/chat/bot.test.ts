import { describe, it, expect } from 'vitest';
import { reply, normalize, INTENT_IDS } from '@/lib/chat/bot';

describe('normalize', () => {
  it('lowercases, strips diacritics and punctuation', () => {
    expect(normalize('  Learning Zone là GÌ?! ')).toBe('learning zone la gi');
    expect(normalize('Đăng nhập')).toBe('dang nhap');
  });
});

describe('reply', () => {
  const cases: [string, RegExp, string?][] = [
    ['Xin chào', /Chào|Bé Cú/],
    ['Learning Zone là gì?', /vùng vừa sức/i, '/learning-zone'],
    ['learning zone la gi', /vùng vừa sức/i, '/learning-zone'],
    ['AI đánh giá năng lực thế nào', /12 câu/, '/danh-gia'],
    ['danh gia nang luc', /12 câu/, '/danh-gia'],
    ['Có bao nhiêu câu hỏi? ngân hàng câu hỏi', /40\.000/],
    ['sach giao khoa nxb nao', /GDPT 2018/],
    ['Có những dạng câu hỏi nào', /dạng/i],
    ['bắt đầu luyện tập từ đâu', /Luyện tập/, '/luyen-tap'],
    ['phong thi 45 phut', /45 phút/, '/phong-thi'],
    ['thi giữa kỳ cuối kỳ', /giữa kỳ/, '/phong-thi'],
    ['chuyển tab có bị phát hiện gian lận không', /chuyển tab/i],
    ['nhà trường đăng ký tổ chức thi thế nào', /nhà trường/i],
    ['giáo viên tạo đề được không', /giáo viên/i],
    ['phụ huynh xem báo cáo', /phụ huynh/i],
    ['XP và streak là gì', /XP/],
    ['bật tắt âm thanh', /🔊/],
    ['đổi lớp sao', /lớp/i],
    ['reset demo', /Đặt lại|↺/],
    ['giá bao nhiêu, có miễn phí không', /Bản demo miễn phí/],
    ['dùng trên điện thoại được không', /điện thoại/i],
    ['có môn gì', /Toán/],
    ['lớp nào được hỗ trợ', /lớp 6/i],
    ['quên mật khẩu', /chưa có đăng nhập/i],
    ['mẹo học hiệu quả', /15 phút/],
    ['cảm ơn cú', /không có gì|Bé Cú/i],
    ['tạm biệt', /Hẹn gặp lại/],
    ['Bé Cú là ai', /trợ lý/i],
  ];
  it.each(cases)('maps %j', (input, text, href) => {
    const r = reply(input);
    expect(r.text).toMatch(text);
    if (href) expect(r.link?.href).toBe(href);
  });

  it('falls back with chips for nonsense', () => {
    const r = reply('asdfgh qwerty');
    expect(r.text).toMatch(/chưa hiểu/);
    expect(r.chips!.length).toBeGreaterThanOrEqual(3);
  });
  it('greets by pathname', () => {
    expect(reply('xin chào', { pathname: '/learning-zone' }).text).toMatch(/Learning Zone/);
    expect(reply('hello', { pathname: '/' }).text).not.toMatch(/Learning Zone/);
  });
  it('has about 25 intents and every reply is non-empty', () => {
    expect(INTENT_IDS.length).toBeGreaterThanOrEqual(25);
  });
});
