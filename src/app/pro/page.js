"use client";
import { useState } from "react";
import BottomNav from "../../components/BottomNav";

export default function ProPage() {
  const [tab, setTab] = useState("drug");
  const [q, setQ] = useState("");
  const [d1, setD1] = useState("");
  const [d2, setD2] = useState("");
  const [res, setRes] = useState(null);
  const [inter, setInter] = useState(null);
  const [busy, setBusy] = useState(false);

  async function searchDrug() {
    if (!q.trim()) return;
    setBusy(true); setRes(null); setInter(null);
    try { const r = await fetch(`/api/drug?q=${encodeURIComponent(q)}`); setRes(await r.json()); }
    catch { setRes({ error: "خطأ" }); }
    setBusy(false);
  }
  async function checkInteractions() {
    if (!d1.trim() || !d2.trim()) return;
    setBusy(true); setInter(null); setRes(null);
    try { const r = await fetch(`/api/interactions?drug1=${encodeURIComponent(d1)}&drug2=${encodeURIComponent(d2)}`); setInter(await r.json()); }
    catch { setInter({ error: "خطأ" }); }
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-gradient-to-br from-teal-700 to-teal-900 text-white px-5 pt-6 pb-8 rounded-b-3xl">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold">وضع المحترف</h1>
          <p className="text-teal-100 text-sm mt-1">بيانات من النشرات الرسمية، بدون ترجمة آلية</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-2 flex">
          <button onClick={() => { setTab("drug"); setRes(null); setInter(null); }} className={`flex-1 py-3 rounded-2xl font-bold text-sm ${tab === "drug" ? "bg-teal-700 text-white" : "text-slate-600"}`}>بحث دوائي</button>
          <button onClick={() => { setTab("inter"); setRes(null); setInter(null); }} className={`flex-1 py-3 rounded-2xl font-bold text-sm ${tab === "inter" ? "bg-teal-700 text-white" : "text-slate-600"}`}>التداخلات</button>
        </div>

        {tab === "drug" && (
          <>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
              <label className="text-sm text-slate-600 mb-2 block">اسم الدواء (تجاري أو مادة فعّالة، بالإنجليزية)</label>
              <div className="flex gap-2">
                <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchDrug()}
                  placeholder="metformin" className="flex-1 border-2 border-slate-200 rounded-2xl p-3 focus:border-teal-500 focus:outline-none" />
                <button onClick={searchDrug} disabled={busy} className="bg-teal-700 text-white px-5 rounded-2xl font-bold disabled:opacity-50">{busy ? "..." : "ابحث"}</button>
              </div>
            </div>
            {res?.rxnorm?.rxcui && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                <p className="text-xs text-slate-500 mb-1">الاسم القياسي (RxNorm)</p>
                <p className="font-bold text-slate-800">{res.rxnorm.name}</p>
                <a href={res.rxnorm.url} target="_blank" className="text-teal-700 text-xs underline mt-2 block">المصدر ↗</a>
              </div>
            )}
            {res?.label && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                <p className="text-xs text-slate-500 mb-1">النشرة الرسمية — {res.label.brand}</p>
                {Object.entries(res.label.sections).map(([k, v]) => v && (
                  <details key={k} className="border-b border-slate-100 py-2 last:border-0">
                    <summary className="font-semibold text-sm cursor-pointer text-slate-700">◀ {k}</summary>
                    <p className="text-xs leading-6 text-slate-600 mt-2 whitespace-pre-line">{v}</p>
                  </details>
                ))}
                <a href={res.label.url} target="_blank" className="text-teal-700 text-xs underline mt-2 block">DailyMed ↗</a>
              </div>
            )}
            {res?.papers?.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                <p className="font-bold text-sm mb-3">أبحاث PubMed</p>
                <ul className="space-y-2">{res.papers.map((p) => (
                  <li key={p.id}><a href={p.url} target="_blank" className="text-teal-800 text-sm font-medium hover:underline">{p.title}</a>
                    <p className="text-xs text-slate-500">{p.journal} — {p.date}</p></li>))}</ul>
              </div>
            )}
          </>
        )}

        {tab === "inter" && (
          <>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 space-y-3">
              <label className="text-sm text-slate-600 block">الدواء الأول (بالإنجليزية)</label>
              <input value={d1} onChange={(e) => setD1(e.target.value)} placeholder="warfarin" className="w-full border-2 border-slate-200 rounded-2xl p-3 focus:border-teal-500 focus:outline-none" />
              <label className="text-sm text-slate-600 block">الدواء الثاني</label>
              <input value={d2} onChange={(e) => setD2(e.target.value)} placeholder="aspirin" className="w-full border-2 border-slate-200 rounded-2xl p-3 focus:border-teal-500 focus:outline-none" />
              <button onClick={checkInteractions} disabled={busy} className="w-full bg-teal-700 text-white py-3 rounded-2xl font-bold disabled:opacity-50">{busy ? "جاري الفحص..." : "فحص التداخل"}</button>
            </div>
            {inter && !inter.error && (
              <div className={`rounded-3xl shadow-sm border p-5 ${inter.found ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                <p className="font-bold text-slate-800 mb-2">{inter.found ? "⚠️ تداخل موجود" : "✅ لا تداخل مسجل"}</p>
                {inter.severity && <p className="text-sm text-slate-700 mb-1">الدرجة: <b>{inter.severity}</b></p>}
                <p className="text-sm text-slate-700">{inter.description}</p>
                <a href={inter.source} target="_blank" className="text-teal-700 text-xs underline mt-2 block">المصدر: RxNav ↗</a>
              </div>
            )}
            {inter?.error && <p className="text-sm text-red-600">{inter.error || inter.message}</p>}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
