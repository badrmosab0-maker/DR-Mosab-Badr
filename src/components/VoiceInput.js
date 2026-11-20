"use client";
import { useState, useEffect, useRef } from "react";

export default function VoiceInput({ onResult, placeholder = "اضغط وتحدث..." }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.lang = "ar-EG"; // العربية المصرية (تعمل لكل اللهجات)
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onResult(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
  }, [onResult]);

  const toggle = () => {
    if (!recRef.current) return;
    if (listening) recRef.current.stop();
    else {
      try { recRef.current.start(); setListening(true); }
      catch { setListening(false); }
    }
  };

  if (!supported) return null;

  return (
    <button type="button" onClick={toggle}
      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-md ${
        listening ? "bg-red-500 text-white animate-pulse" : "bg-white border-2 border-teal-600 text-teal-700 hover:bg-teal-50"
      }`}>
      {listening ? "⏹" : "🎙️"}
    </button>
  );
}
