"use client";
import { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatPanel({ audience }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("message", text);
      fd.append("audience", audience);
      const r = await fetch("/api/chat", { method: "POST", body: fd });
      const j = await r.json();
      setMessages((m) => [...m, { role: "model", text: j.reply, sources: j.sources || [], id: Date.now() }]);
    } catch {
      setMessages((m) => [...m, { role: "model", text: "تعذر الاتصال بالخادم.", id: Date.now() }]);
    }
    setBusy(false);
  }

  // دالة تسجيل التغذية الراجعة (التعلم من الأخطاء)
  const handleFeedback = (msgId, isPositive, reason = "") => {
    const msg = messages.find(m => m.id === msgId);
    const feedbackData = {
      timestamp: new Date().toISOString(),
      audience,
      userQuery: messages.find(m => m.role === "user" && messages.indexOf(m) === messages.indexOf(msg) - 1)?.text,
      aiResponse: msg?.text,
      rating: isPositive ? "positive" : "negative",
      reason: reason
    };
    
    // هنا نرسل البيانات للخادم لحفظها في قاعدة بيانات "التحسين"
    console.log("🧠 FEEDBACK LOGGED FOR LEARNING:", feedbackData);
    alert(isPositive ? "شكراً لتقييمك! يساعدنا هذا على التحسن." : "شكراً، سنراجع هذه الإجابة لتحسين الدقة مستقبلاً.");
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-140px)] max-w-2xl mx-auto">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={m.id || i} className={m.role === "user" ? "flex justify-start" : "flex justify-end"}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white text-slate-800 border"}`}>
              {m.role === "user" ? m.text : <ReactMarkdown>{m.text}</ReactMarkdown>}
              
              {m.sources?.length > 0 && (
                <div className="mt-2 border-t pt-2">
                  <p className="text-xs font-bold text-slate-500 mb-1">المصادر الموثوقة:</p>
                  <ul className="space-y-1">{m.sources.map((s, k) => (
                    <li key={k} className="text-xs"><a href={s.url} target="_blank" className="text-teal-700 underline break-all">{s.title} ↗</a></li>))}</ul>
                </div>
              )}

              {/* أزرار التعلم والتغذية الراجعة */}
              {m.role === "model" && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">هل كانت هذه الإجابة مفيدة ودقيقة؟</span>
                  <button onClick={() => handleFeedback(m.id, true)} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">👍 نعم</button>
                  <button onClick={() => {
                    const reason = prompt("ساعدنا على التحسن: ما الخطأ في هذه الإجابة؟ (مثال: الدواء غير متوفر، الجرعة غير دقيقة)");
                    if (reason) handleFeedback(m.id, false, reason);
                  }} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100">👎 لا، بها خطأ</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="flex justify-end"><div className="bg-white border rounded-2xl px-4 py-3 text-sm text-slate-400 animate-pulse">جاري البحث في المصادر الموثوقة...</div></div>}
      </div>

      <div className="border-t bg-white p-3">
        <div className="flex items-end gap-2">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder="اكتب شكواك أو سؤالك الطبي..." className="flex-1 border rounded-2xl px-4 py-3 text-sm resize-none max-h-32" />
          <button onClick={send} disabled={busy || !input.trim()} className="shrink-0 w-11 h-11 rounded-full text-white bg-teal-700 disabled:opacity-40">{busy ? "..." : "➤"}</button>
        </div>
      </div>
    </div>
  );
}
