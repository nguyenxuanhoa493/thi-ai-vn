'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Owl } from '@/components/owl/owl';
import { reply as botReply, type BotReply } from '@/lib/chat/bot';
import { useSfx } from '@/lib/ui/use-sfx';

interface Msg { id: number; from: 'bot' | 'user'; text: string; link?: BotReply['link'] }

const SEEN_KEY = 'thiai-chat-seen';
const WELCOME_CHIPS = ['Learning Zone là gì?', 'Phòng thi hoạt động sao?', 'Bắt đầu từ đâu?', 'Giá bao nhiêu?'];
const WELCOME: Msg = { id: 0, from: 'bot', text: 'Chào em, Bé Cú đây 🦉 Em cần Bé Cú giúp gì về thi.ai.vn?' };

const typingMs = (text: string) => Math.min(900, 500 + text.length * 4);

function readSeen(): boolean { try { return sessionStorage.getItem(SEEN_KEY) === '1'; } catch { return false; } }
function writeSeen() { try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* bỏ qua */ } }

/** Widget chat nổi góc phải, gắn một lần ở root layout nên giữ hội thoại khi chuyển trang. */
export function ChatWidget() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const play = useSfx();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([WELCOME]);
  const [chips, setChips] = useState<string[]>(WELCOME_CHIPS);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const idRef = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathRef = useRef(pathname);
  useEffect(() => { pathRef.current = pathname; }, [pathname]);

  useEffect(() => { const t = setTimeout(() => setUnread(!readSeen()), 0); return () => clearTimeout(t); }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing, open]);

  const send = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    play('select');
    setMsgs((m) => [...m, { id: idRef.current++, from: 'user', text }]);
    setChips([]);
    setDraft('');
    setTyping(true);
    // UI luôn await: sau này có thể thay `reply` bằng lời gọi LLM bất đồng bộ.
    const pending = Promise.resolve(botReply(text, { pathname: pathRef.current }));
    const started = Date.now();
    void pending.then((r) => {
      const wait = Math.max(0, typingMs(r.text) - (Date.now() - started));
      timer.current = setTimeout(() => {
        setMsgs((m) => [...m, { id: idRef.current++, from: 'bot', text: r.text, link: r.link }]);
        setChips(r.chips ?? []);
        setTyping(false);
      }, wait);
    });
  }, [play, typing]);

  const toggle = () => {
    setOpen((o) => !o);
    setUnread(false);
    writeSeen();
  };

  if (/^\/phong-thi\/.+/.test(pathname)) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6" data-testid="chat-widget">
      {open && (
        <motion.section
          role="dialog" aria-label="Trò chuyện với Bé Cú"
          initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          style={{ transformOrigin: 'bottom right' }}
          className="fixed inset-x-2 bottom-2 top-16 z-50 flex flex-col overflow-hidden rounded-3xl bg-cream shadow-clay-lg ring-1 ring-black/5 sm:absolute sm:inset-auto sm:bottom-[4.5rem] sm:right-0 sm:h-[32rem] sm:max-h-[calc(100dvh-7rem)] sm:w-96"
        >
          <header className="flex items-center gap-3 bg-coral px-4 py-3 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white"><Owl size={32} /></span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-extrabold leading-tight">Bé Cú</p>
              <p className="truncate text-xs opacity-90">Trợ lý thi.ai.vn</p>
            </div>
            <button type="button" aria-label="Đóng trò chuyện" onClick={toggle}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-lg hover:bg-white/30">✕</button>
          </header>
          <div ref={listRef} role="log" aria-live="polite" aria-label="Tin nhắn" className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm font-medium ${m.from === 'user' ? 'bg-coral text-white' : 'bg-white shadow-clay'}`}>
                  <p>{m.text}</p>
                  {m.link && (
                    <button type="button" onClick={() => { router.push(m.link!.href); if (window.innerWidth < 640) setOpen(false); }}
                      className="mt-1.5 font-bold text-coral underline-offset-2 hover:underline">{m.link.label}</button>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start" data-testid="typing">
                <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 text-sm font-medium text-muted shadow-clay">
                  <span>Bé Cú đang gõ…</span>
                  <span aria-hidden className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="block h-1.5 w-1.5 rounded-full bg-coral"
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>
          {chips.length > 0 && !typing && (
            <div className="flex flex-wrap gap-1.5 px-3 pb-2">
              {chips.map((c) => (
                <button key={c} type="button" onClick={() => send(c)}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-coral shadow-clay hover:bg-coral hover:text-white">{c}</button>
              ))}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); send(draft); }} className="flex items-center gap-2 border-t border-black/5 bg-white/70 p-3">
            <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={200}
              aria-label="Nhập câu hỏi" placeholder="Hỏi Bé Cú điều gì đó…"
              className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2.5 text-base shadow-inner outline-none ring-1 ring-black/10 focus:ring-coral sm:text-sm" />
            <button type="submit" disabled={!draft.trim() || typing}
              className="rounded-xl bg-coral px-4 py-2.5 text-sm font-extrabold text-white shadow-clay disabled:opacity-50">Gửi</button>
          </form>
        </motion.section>
      )}
      <div className="group relative">
        {!open && (
          <span className="pointer-events-none absolute bottom-1/2 right-full mr-3 hidden translate-y-1/2 whitespace-nowrap rounded-xl bg-white px-3 py-1.5 text-sm font-bold shadow-clay group-hover:block group-focus-within:block">Hỏi Bé Cú</span>
        )}
        <button type="button" onClick={toggle} aria-label={open ? 'Đóng trò chuyện với Bé Cú' : 'Hỏi Bé Cú'} aria-expanded={open}
          className="relative grid h-14 w-14 place-items-center rounded-full bg-white shadow-clay-lg ring-2 ring-coral/30 transition-transform hover:scale-105 sm:h-16 sm:w-16">
          <Owl size={40} />
          {unread && !open && <span data-testid="unread-dot" className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-coral ring-2 ring-white" />}
        </button>
      </div>
    </div>
  );
}
