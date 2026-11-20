"use client";
import { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const KINDS = [["lab","🔬 مختبر"],["imaging","🩻 أشعة"],["report","📄 تقرير"],["other","📁 آخر"]];
const MAX_ROUNDS = 2;

export default function ChatPanel({ audience }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [kind, setKind] = useState("lab");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("ask");
  const [round, setRound] = useState(0);
  const fileRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, busy]);

  async function send(textOverride, forceStage) {
    const text = (textOverride ?? input).trim();
    if (!text || busy) return;
    setBusy(true);
    const useStage = forceStage || stage;
    const history = messages.slice(-10).map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, { role: "user", text, file: file ? file.name : null }]);
    setInput("");
    const sentFile = file; setFile(null);
    try {
      const fd = new FormData();
      fd.append("message", text);
      fd.append("audience", audience);
      fd.append("stage", useStage);
      fd.append("round", String(round));
      fd.append("history", JSON.stringify(history));
      if (sentFile) { fd.append("file", sentFile); fd.append("kind", kind); }
      const r = await fetch("/api/chat", { method: "POST", body: fd });
      const j = await r.json();
      setMessages((m) => [...m, { role: "model", text: j.reply, redFlags: j.red_flags || [], sources: j.sources || [] }]);
      if (j.stage) setStage(j.stage);
      if (typeof j.round === "number") setRound(j.round);
    } catch {
      setMessages((m) => [...m, { role: "model", text: "تعذّر الاتصال بالخادم. تأكد أن السيرفر يعمل.", sources: [] }]);
    }
    setBusy(false);
  }

  const askForPlan = () => send("أعتقد أنني ذكرت ما يكفي. أرجو الآن، بالرجوع إلى المصادر الرسمية الموثوقة، أن تعطيني ملخصاً وتقييماً مبدئياً (الاحتمالات التشخيصية) والخطة/التدبير المقترح مع المصادر.", "plan");

  const isPatient = audience === "patient";
  const hasModelMsg = messages.some((m) => m.role === "model");
  const showPlanBtn = stage === "ask" && hasModelMsg;

  return (
    <div className="flex flex-col h-[calc(100dvh-220px)] max-w-2xl mx-auto w-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-10 px-6">
            <p className="text-4xl mb-3">{isPatient ? "💬" : "🩺"}</p>
            <p className="text-sm leading-7">{isPatient
              ? "اكتب ما تشعر به. لن أعطيك تشخيصاً فوراً - سأسمع شكواك أولاً ثم أسألك أسئلة بسيطة، وبعدها أستنتج معتمداً على مصادر موثوقة."
              : "اسأل عن دواء أو حالة. نجمع التاريخ أولاً بطرح أسئلة، ثم ننتج تقييماً مبنياً على FDA/PubMed/RxNorm."}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-start" : "flex justify-end"}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white text-slate-800 border"}`}>
              {m.file && <p className="text-xs opacity-75 mb-1">📎 {m.file}</p>}
              {m.role === "user" ? m.text : <ReactMarkdown>{m.text}</ReactMarkdown>}
              {m.redFlags?.length > 0 && (
                <div className="mt-2 bg-red-600 text-white rounded-xl p-3">
                  <p className="font-bold mb-1">🚨 تنبيه طوارئ</p>
                  <ul className="list-disc pr-4 space-y-1 text-xs">{m.redFlags.map((f, k) => <li key={k}>{f}</li>)}</ul>
                </div>
              )}
              {m.sources?.length > 0 && (
                <div className="mt-2 border-t pt-2">
                  <p className="text-xs font-bold text-slate-500 mb-1">المصادر:</p>
                  <ul className="space-y-1">{m.sources.map((s, k) => (
                    <li key={k} className="text-xs"><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-teal-700 underline break-all">{s.title} ↗</a></li>))}</ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="flex justify-end"><div className="bg-white border rounded-2xl px-4 py-3 text-sm text-slate-400 animate-pulse">{stage === "ask" ? "جاري صياغة أسئلة توضيحية..." : "جاري الرجوع إلى FDA و PubMed وتحليل إجاباتك..."}</div></div>}
      </div>

      <div className="border-t bg-white p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>{stage === "ask" ? "🔎 مرحلة جمع التاريخ — جولة " + Math.min(round, MAX_ROUNDS) + "/" + MAX_ROUNDS : "🩺 مرحلة التقييم النهائي (مبنية على المصادر)"}</span>
          {showPlanBtn && <button onClick={askForPlan} disabled={busy} className="bg-teal-700 text-white px-3 py-1 rounded-full font-bold disabled:opacity-50">🩺 أعطني التشخيص والخطة</button>}
        </div>
        {file && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs">
            <span className="flex-1 truncate">📎 {file.name}</span>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="border rounded-lg px-1 py-1 bg-white">{KINDS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
            <button onClick={() => setFile(null)} className="text-red-600 font-bold px-1">✕</button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/*,.pdf,.dcm,.txt" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] || null); e.target.value = ""; }} />
          <button onClick={() => fileRef.current?.click()} className={`shrink-0 w-11 h-11 rounded-full text-white text-lg ${isPatient ? "bg-blue-600" : "bg-teal-700"}`}>📎</button>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1}
            placeholder={isPatient ? "اكتب ما تشعر به..." : "اكتب سؤالك الطبي..."} className="flex-1 border rounded-2xl px-4 py-3 text-sm resize-none max-h-32" />
          <button onClick={() => send()} disabled={busy || !input.trim()} className={`shrink-0 w-11 h-11 rounded-full text-white disabled:opacity-40 ${isPatient ? "bg-blue-600" : "bg-teal-700"}`}>{busy ? "..." : "➤"}</button>
        </div>
      </div>
    </div>
  );
}
