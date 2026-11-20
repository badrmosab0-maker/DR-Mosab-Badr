"use client";
import { useState } from "react";
import BottomNav from "../../components/BottomNav";

export default function CalculatorsPage() {
  const [calc, setCalc] = useState(null);
  const [vals, setVals] = useState({});
  const [result, setResult] = useState(null);

  const calcs = [
    { id: "bmi", name: "BMI — مؤشر كتلة الجسم", inputs: [["weight", "الوزن (كجم)", "number"], ["height", "الطول (سم)", "number"]] },
    { id: "egfr", name: "eGFR 2021 — وظائف الكلى", inputs: [["age", "العمر", "number"], ["scr", "الكرياتينين (mg/dL)", "number"], ["sex", "الجنس", "select", [["male","ذكر"],["female","أنثى"]]]] },
    { id: "crcl", name: "CrCl — كوكروفت-غولت", inputs: [["age", "العمر", "number"], ["weight", "الوزن (كجم)", "number"], ["scr", "الكرياتينين (mg/dL)", "number"], ["sex", "الجنس", "select", [["male","ذكر"],["female","أنثى"]]]] },
  ];

  const calculate = () => {
    if (calc === "bmi") {
      const h = vals.height / 100;
      const bmi = (vals.weight / (h * h)).toFixed(1);
      let cat = bmi < 18.5 ? "نقص وزن" : bmi < 25 ? "طبيعي" : bmi < 30 ? "زيادة وزن" : "سمنة";
      setResult(`BMI = ${bmi} — ${cat}`);
    } else if (calc === "egfr") {
      const k = vals.sex === "female" ? 0.9938 : 1;
      const egfr = Math.round(142 * Math.pow(vals.scr, -1.2) * Math.pow(0.9938, vals.age) * k);
      setResult(`eGFR ≈ ${egfr} mL/min/1.73m²`);
    } else if (calc === "crcl") {
      const num = (140 - vals.age) * vals.weight;
      const den = 72 * vals.scr;
      const crcl = vals.sex === "female" ? (num / den) * 0.85 : num / den;
      setResult(`CrCl ≈ ${crcl.toFixed(1)} mL/min`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-gradient-to-br from-teal-700 to-teal-900 text-white px-5 pt-6 pb-8 rounded-b-3xl">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold">الحاسبات السريرية</h1>
          <p className="text-teal-100 text-sm mt-1">أدوات مساعدة للقرار السريري</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 -mt-4 space-y-3">
        {!calc && calcs.map((c) => (
          <button key={c.id} onClick={() => { setCalc(c.id); setVals({}); setResult(null); }}
            className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-right hover:border-teal-500 transition">
            <p className="font-bold text-slate-800">{c.name}</p>
          </button>
        ))}

        {calc && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <button onClick={() => setCalc(null)} className="text-sm text-teal-700 underline mb-3">← رجوع</button>
            <h2 className="text-lg font-bold mb-4">{calcs.find((c) => c.id === calc)?.name}</h2>
            <div className="space-y-3">
              {calcs.find((c) => c.id === calc)?.inputs.map(([key, label, type, opts]) => (
                <div key={key}>
                  <label className="text-sm text-slate-600 mb-1 block">{label}</label>
                  {type === "select" ? (
                    <select value={vals[key] || ""} onChange={(e) => setVals({ ...vals, [key]: e.target.value })}
                      className="w-full border-2 border-slate-200 rounded-2xl p-3 focus:border-teal-500 focus:outline-none">
                      <option value="">اختر...</option>
                      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  ) : (
                    <input type={type} value={vals[key] || ""} onChange={(e) => setVals({ ...vals, [key]: e.target.value })}
                      className="w-full border-2 border-slate-200 rounded-2xl p-3 focus:border-teal-500 focus:outline-none" />
                  )}
                </div>
              ))}
              <button onClick={calculate} className="w-full bg-teal-700 text-white py-3.5 rounded-2xl font-bold mt-2">احسب</button>
              {result && <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-center font-bold text-teal-800">{result}</div>}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
