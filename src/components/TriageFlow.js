"use client";
import { useState } from "react";
import { TRIAGE_FLOWS } from "../lib/triageRules";

export default function TriageFlow({ complaintId, onComplete, onEmergency }) {
  const flow = TRIAGE_FLOWS[complaintId];
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [freeText, setFreeText] = useState("");
  const [showFree, setShowFree] = useState(false);

  if (!flow) return <p className="text-center text-slate-500 py-10">لا توجد أسئلة لهذه الشكوى بعد.</p>;

  const q = flow.questions[qIndex];
  const progress = ((qIndex) / flow.questions.length) * 100;

  const choose = (opt) => {
    const newAnswers = { ...answers, [q.id]: opt.value };
    setAnswers(newAnswers);

    // علامة خطر → طوارئ فورًا
    if (opt.danger) {
      onEmergency(opt.message);
      return;
    }
    // نهاية التدفق → أرسل النتائج
    if (opt.result === "final" || !opt.next) {
      onComplete({ complaint: complaintId, answers: newAnswers, freeText });
      return;
    }
    // الانتقال للسؤال التالي
    const nextIdx = flow.questions.findIndex((x) => x.id === opt.next);
    if (nextIdx > -1) setQIndex(nextIdx);
  };

  const submitFree = () => {
    if (freeText.trim()) onComplete({ complaint: complaintId, answers, freeText: freeText.trim() });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* شريط التقدم */}
      <div className="h-1.5 bg-slate-100">
        <div className="h-full bg-teal-600 transition-all" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="p-5">
        <p className="text-xs text-slate-500 mb-2">سؤال أمان {qIndex + 1} من {flow.questions.length}</p>
        <h3 className="text-lg font-bold text-slate-800 mb-5 leading-relaxed">{q.text}</h3>

        {/* الخيارات */}
        <div className="space-y-2.5">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => choose(opt)}
              className={`w-full text-right p-4 rounded-2xl border-2 transition font-medium text-base ${
                opt.danger
                  ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-500 hover:bg-teal-50"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* مساحة الكتابة الحرة */}
        <button onClick={() => setShowFree(!showFree)}
          className="mt-4 text-sm text-teal-700 underline">
          {showFree ? "إخفاء الكتابة" : "لا تنطبق الخيارات — اكتب بنفسك"}
        </button>
        {showFree && (
          <div className="mt-3">
            <textarea value={freeText} onChange={(e) => setFreeText(e.target.value)}
              rows={3} placeholder="اكتب ما تشعر به بالتفصيل..."
              className="w-full border-2 border-slate-200 rounded-2xl p-3 text-sm focus:border-teal-500 focus:outline-none" />
            <button onClick={submitFree}
              className="mt-2 w-full bg-teal-700 text-white py-3 rounded-2xl font-bold">
              إرسال
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
