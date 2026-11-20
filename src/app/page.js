"use client";
import Link from "next/link";
import BottomNav from "../components/BottomNav";

const CARDS = [
  { href: "/patient", icon: "❤️", tag: "فرز ذكي", title: "أنا مريض", desc: "صف شكواك، أجب عن أسئلة قصيرة، ثم تعرف: منزل أم عيادة أم طوارئ", color: "from-teal-50 to-white", border: "border-teal-200" },
  { href: "/pro", icon: "Rx", tag: "للمحترفين", title: "أنا طبيب / صيدلي", desc: "نشرة الدواء الرسمية، التداخلات، الأبحاث", color: "from-blue-50 to-white", border: "border-blue-200" },
  { href: "/calculators", icon: "Σ", tag: "حاسبات", title: "الحاسبات السريرية", desc: "BMI · eGFR 2021 · CrCl", color: "from-slate-50 to-white", border: "border-slate-200" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-gradient-to-br from-teal-700 to-teal-900 text-white px-5 pt-8 pb-10 rounded-b-3xl shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">م ب</div>
            <div>
              <h1 className="text-2xl font-bold">د. مصعب بدر</h1>
              <p className="text-teal-100 text-sm">مساعدك الطبي، كل معلومة بمصدر يمكنك فتحه</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 -mt-5 space-y-4">
        {/* تنبيه الطوارئ */}
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-4">
          <p className="text-red-700 font-bold text-base">حالة طارئة؟ اتصل فوراً</p>
          <p className="text-red-600 text-sm mt-1">مصر: 123 · السعودية: 997 · الإمارات: 998</p>
        </div>

        {/* البطاقات الثلاث */}
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href}
            className={`block bg-gradient-to-br ${c.color} border-2 ${c.border} rounded-3xl p-5 shadow-sm hover:shadow-md transition`}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl font-bold text-teal-700 shrink-0">
                {c.icon}
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">{c.tag}</span>
                <h2 className="text-lg font-bold text-slate-800 mt-1.5">{c.title}</h2>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{c.desc}</p>
              </div>
              <span className="text-slate-400 text-2xl">→</span>
            </div>
          </Link>
        ))}

        {/* المصادر */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 mt-6">
          <p className="text-sm font-bold text-slate-700 mb-3">المصادر المعتمدة</p>
          <div className="flex flex-wrap gap-2">
            {["RxNorm", "openFDA", "DailyMed", "PubMed", "MedlinePlus"].map((s) => (
              <span key={s} className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">{s}</span>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-3">أداة دعم قرار، لا تُغني عن الطبيب.</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
