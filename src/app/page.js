"use client";
import { useState } from "react";
import ChatPanel from "../components/ChatPanel";

export default function Home() {
  const [isPro, setIsPro] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <header className={`${isPro ? "bg-gradient-to-r from-teal-600 to-teal-800" : "bg-gradient-to-r from-blue-600 to-blue-800"} text-white px-4 pt-4 pb-3 shadow-lg`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">🩺</span>
              DR/ Mosab Badr
            </h1>
            <div className="text-xs bg-white/20 px-3 py-1 rounded-full">
              {isPro ? "وضع المحترفين" : "وضع المرضى"}
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-1 flex backdrop-blur-sm">
            <button onClick={() => setIsPro(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${!isPro ? "bg-white text-blue-700 shadow-lg" : "text-white/80"}`}>
              😊 للمريض
            </button>
            <button onClick={() => setIsPro(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${isPro ? "bg-white text-teal-700 shadow-lg" : "text-white/80"}`}>
              🩺 للمهنيين
            </button>
          </div>
        </div>
      </header>
      <ChatPanel isPro={isPro} />
      <footer className="bg-slate-900 text-slate-400 text-xs text-center py-3 px-4">
        <p>أداة دعم قرار تعليمية - ليست تشخيصاً نهائياً</p>
        <p className="mt-1">المصادر: RxNorm • openFDA • PubMed • MedlinePlus</p>
      </footer>
    </div>
  );
}
