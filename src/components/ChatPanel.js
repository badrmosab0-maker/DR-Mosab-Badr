"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatPanel({ isPro }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    meds: "",
    diseases: "",
    surgeries: "",
    allergies: ""
  });
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function send() {
    if (!input.trim() || busy) return;
    
    const userMsg = { role: "user", text: input };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, patientInfo, isPro })
      });
      const data = await res.json();
      setMessages(m => [...m, { 
        role: "ai", 
        text: data.reply, 
        isEmergency: data.isEmergency 
      }]);
    } catch {
      setMessages(m => [...m, { role: "ai", text: "خطأ في الاتصال" }]);
    }
    setBusy(false);
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-10">
            <div className="text-6xl mb-4">{isPro ? "🩺" : "💬"}</div>
            <h2 className="text-2xl font-bold mb-2">
              {isPro ? "مساعد طبي للمحترفين" : "مساعدك الصحي"}
            </h2>
            <p className="text-sm max-w-md mx-auto">
              {isPro 
                ? "اسأل عن تشخيصات، خطط علاجية، تداخلات دوائية، وأحدث الأبحاث"
                : "اكتب ما تشعر به، وسأقدم لك تقييماً مبدئياً مع خطة علاجية شاملة"}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-md mx-auto">
              <button onClick={() => setInput("عندي صداع نصفي")} className="bg-white border-2 border-slate-200 rounded-xl p-3 text-sm hover:border-blue-500 transition">
                🤕 صداع نصفي
              </button>
              <button onClick={() => setInput("عندي ألم في الصدر")} className="bg-white border-2 border-slate-200 rounded-xl p-3 text-sm hover:border-red-500 transition">
                💔 ألم صدر
              </button>
              <button onClick={() => setInput("عندي سكري وضغط")} className="bg-white border-2 border-slate-200 rounded-xl p-3 text-sm hover:border-green-500 transition">
                💊 سكري وضغط
              </button>
              <button onClick={() => setInput("عندي ربو")} className="bg-white border-2 border-slate-200 rounded-xl p-3 text-sm hover:border-purple-500 transition">
                🫁 ربو
              </button>
            </div>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-md ${
              m.role === "user" 
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white" 
                : m.isEmergency 
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white animate-pulse" 
                  : "bg-white border border-slate-200"
            }`}>
              {m.role === "user" ? (
                <p className="text-sm leading-relaxed">{m.text}</p>
              ) : (
                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {m.text}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-end">
            <div className="bg-white border rounded-2xl px-5 py-4 shadow-md">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                <span className="mr-2">جاري التحليل...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showInfo && (
        <div className="bg-yellow-50 border-t-2 border-yellow-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-yellow-800">📋 معلومات المريض (مهم للخطة العلاجية)</p>
            <button onClick={() => setShowInfo(false)} className="text-yellow-600 hover:text-yellow-800">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={patientInfo.meds} onChange={e => setPatientInfo({...patientInfo, meds: e.target.value})}
              placeholder="الأدوية الحالية" className="border-2 border-yellow-200 rounded-xl p-3 text-sm focus:border-yellow-500 focus:outline-none" />
            <input value={patientInfo.diseases} onChange={e => setPatientInfo({...patientInfo, diseases: e.target.value})}
              placeholder="الأمراض المزمنة" className="border-2 border-yellow-200 rounded-xl p-3 text-sm focus:border-yellow-500 focus:outline-none" />
            <input value={patientInfo.surgeries} onChange={e => setPatientInfo({...patientInfo, surgeries: e.target.value})}
              placeholder="العمليات السابقة" className="border-2 border-yellow-200 rounded-xl p-3 text-sm focus:border-yellow-500 focus:outline-none" />
            <input value={patientInfo.allergies} onChange={e => setPatientInfo({...patientInfo, allergies: e.target.value})}
              placeholder="الحساسية" className="border-2 border-yellow-200 rounded-xl p-3 text-sm focus:border-yellow-500 focus:outline-none" />
          </div>
          <button onClick={() => setShowInfo(false)} className="w-full bg-yellow-600 text-white py-2.5 rounded-xl font-bold hover:bg-yellow-700 transition">
            حفظ المعلومات
          </button>
        </div>
      )}

      <div className="border-t-2 border-slate-200 bg-white p-4">
        <div className="flex gap-3 items-end">
          <button onClick={() => setShowInfo(!showInfo)} 
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition ${showInfo ? "bg-yellow-500 text-white" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"}`}>
            📋
          </button>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1} placeholder={isPro ? "اكتب سؤالك الطبي..." : "اكتب ما تشعر به..."}
            className="flex-1 border-2 border-slate-200 rounded-2xl px-5 py-3 text-sm resize-none max-h-32 focus:border-blue-500 focus:outline-none" />
          <button onClick={send} disabled={busy || !input.trim()}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg transition ${busy || !input.trim() ? "bg-slate-300" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"}`}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
