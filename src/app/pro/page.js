"use client";
import { useState } from "react";
import BottomNav from "../../components/BottomNav";

export default function ProPage() {
  const [tab, setTab] = useState("drug");
  const [q, setQ] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);

  async function search() {
    if (!q.trim()) return;
    setBusy(true); setRes(null);
    try {
      const r = await fetch(`/api/drug?q=${encodeURIComponent(q)}`);
      const j = await r.json();
      setRes(j);
    } catch {}
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
          <button onClick={() => setTab("drug")} className={`flex-1 py-3 rounded-2xl font-bold text-sm ${tab === "drug" ? "bg-teal-700 text-white" : "text-slate-600"}`}>بحث دوائي</button>
          <button onClick={() => setTab("interactions")} className={`flex-1 py-3 rounded-2xl font-bold text-sm ${tab === "interactions" ? "bg-teal-700 text-white" : "text-slate-600"}`}>التداخلات</button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
          <label className="text-sm text-slate-600 mb-2 block">اسم الدواء (تجاري أو مادة فعّالة، بالإنجليزية)</label>
          <div className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="amoxicillin" className="flex-1 border-2 border-slate-200 rounded-2xl p-3 focus:border-teal-500 focus:outline-none" />
            <button onClick={search} disabled={busy} className="bg-teal-700 text-white px-5 rounded-2xl font-bold disabled:opacity-50">ابحث</button>
          </div>
        </div>

        {res && (
          <div className="space-y-3">
            {res.rxnorm?.rxcui && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                <p className="text-xs text-slate-500 mb-1">الاسم القياسي (RxNorm)</p>
                <p className="font-bold text-slate-800">{res.rxnorm.name}</p>
                <a href={res.rxnorm.url} target="_blank" className="text-teal-700 text-xs underline mt-2 block">المصدر ↗</a>
              </div>
            )}
            {res.label && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                <p className="text-xs text-slate-500 mb-1">النشرة الرسمية — {res.label.brand}</p>
                {Object.entries(res.label.sections).map(([k, v]) => v && (
                  <details key={k} className="border-b border-slate-100 py-2 last:border-0">
                    <summary className="font-semibold text-sm cursor-pointer text-slate-700">{k}</summary>
                    <p className="text-xs leading-6 text-slate-600 mt-2 whitespace-pre-line">{v}</p>
                  </details>
                ))}
              </div>
            )}
            {res.papers?.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                <p className="font-bold text-sm mb-3">أبحاث PubMed</p>
                <ul className="space-y-2">
                  {res.papers.map((p) => (
                    <li key={p.id}>
                      <a href={p.url} target="_blank" className="text-teal-800 text-sm font-medium hover:underline">{p.title}</a>
                      <p className="text-xs text-slate-500">{p.journal} — {p.date}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
