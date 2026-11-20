"use client";
import { useState } from "react";
import { COMPLAINTS } from "../../lib/triageRules";
import TriageFlow from "../../components/TriageFlow";
import VoiceInput from "../../components/VoiceInput";
import BottomNav from "../../components/BottomNav";

export default function PatientPage() {
  const [stage, setStage] = useState("select"); // select | triage | result
  const [complaint, setComplaint] = useState(null);
  const [emergency, setEmergency] = useState(null);
  const [result, setResult] = useState(null);
  const [freeInput, setFreeInput] = useState("");

  const startTriage = (id) => {
    setComplaint(id);
    setStage("triage");
    setEmergency(null);
  };

  const handleEmergency = (msg) => {
    setEmergency(msg);
  };

  const handleComplete = async (data) => {
    setStage("result");
    // هنا نرسل البيانات للـ API للحصول على التقييم
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `تقييم حالة: ${data.complaint}. الإجابات: ${JSON.stringify(data.answers)}. ملاحظات: ${data.freeText || ""}`,
          audience: "patient",
          stage: "plan"
        })
      });
      const j = await r.json();
      setResult(j);
    } catch { setResult({ reply: "تعذر الاتصال. حاول مرة أخرى." }); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* الهيدر */}
      <header className="bg-gradient-to-br from-teal-700 to-teal-900 text-white px-5 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">م ب</div>
            <div>
              <h1 className="text-xl font-bold">د. مصعب بدر</h1>
              <p className="text-teal-100 text-xs">مساعدك الطبي، كل معلومة بمصدر يمكنك فتحه</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 -mt-4">
        {/* تنبيه الطوارئ */}
        {emergency && (
          <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-5 mb-4">
            <p className="text-red-700 font-bold text-lg mb-2">🚨 حالة طارئة؟ اتصل فوراً</p>
            <p className="text-red-600 text-sm mb-3">{emergency}</p>
            <div className="text-sm text-slate-700 space-y-1">
              <p>🇪🇬 مصر: إسعاف 123</p>
              <p>🇸🇦 السعودية: 997</p>
              <p>🇦🇪 الإمارات: 998</p>
            </div>
          </div>
        )}

        {/* المرحلة 1: اختيار الشكوى */}
        {stage === "select" && (
          <>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 mb-4">
              <h2 className="text-lg font-bold text-slate-800 mb-1">ما الذي تشعر به؟</h2>
              <p className="text-sm text-slate-500 mb-4">اختر شكواك أو اكتبها</p>

              {/* الإدخال الحر + الصوتي */}
              <div className="flex gap-2 mb-4">
                <textarea value={freeInput} onChange={(e) => setFreeInput(e.target.value)}
                  rows={2} placeholder="مثال: زوري بيوجعني من امبارح وعندي سخونية"
                  className="flex-1 border-2 border-slate-200 rounded-2xl p-3 text-sm focus:border-teal-500 focus:outline-none resize-none" />
                <VoiceInput onResult={(t) => setFreeInput(t)} />
              </div>
              {freeInput.trim() && (
                <button onClick={() => handleComplete({ complaint: "other", answers: {}, freeText: freeInput })}
                  className="w-full bg-teal-700 text-white py-3.5 rounded-2xl font-bold mb-2">
                  ابدأ الفرز
                </button>
              )}

              <p className="text-sm text-slate-500 mb-3 mt-4">أو اختر مباشرة:</p>
              <div className="grid grid-cols-2 gap-2.5">
                {COMPLAINTS.map((c) => (
                  <button key={c.id} onClick={() => startTriage(c.id)}
                    className="bg-white border-2 border-slate-200 hover:border-teal-500 rounded-2xl p-4 text-center transition">
                    <span className="text-3xl block mb-1">{c.icon}</span>
                    <span className="text-sm font-semibold text-slate-700">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* المصادر */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
              <p className="text-sm font-bold text-slate-700 mb-3">المصادر المعتمدة</p>
              <div className="flex flex-wrap gap-2">
                {["RxNorm", "openFDA", "DailyMed", "PubMed", "MedlinePlus"].map((s) => (
                  <span key={s} className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">{s}</span>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">أداة دعم قرار، لا تُغني عن الطبيب.</p>
            </div>
          </>
        )}

        {/* المرحلة 2: أسئلة الفرز */}
        {stage === "triage" && complaint && (
          <TriageFlow complaintId={complaint} onComplete={handleComplete} onEmergency={handleEmergency} />
        )}

        {/* المرحلة 3: النتيجة */}
        {stage === "result" && result && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-lg font-bold text-slate-800 mb-3">التقييم المبدئي</h3>
            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
              {result.reply}
            </div>
            {result.sources?.length > 0 && (
              <div className="mt-4 pt-3 border-t">
                <p className="text-xs font-bold text-slate-500 mb-2">المصادر:</p>
                <ul className="space-y-1">
                  {result.sources.map((s, i) => (
                    <li key={i}><a href={s.url} target="_blank" className="text-teal-700 text-xs underline">{s.title} ↗</a></li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={() => { setStage("select"); setComplaint(null); setEmergency(null); setResult(null); setFreeInput(""); }}
              className="mt-4 w-full bg-slate-100 text-slate-700 py-3 rounded-2xl font-bold">
              استفسار جديد
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
