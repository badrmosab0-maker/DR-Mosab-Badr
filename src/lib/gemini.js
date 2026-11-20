// موجّه Gemini ذاتي الاكتشاف: يسأل جوجل "ما النماذج المتاحة لمفتاحك؟"
// ثم يجرّبها بالترتيب مع إعادة محاولة عند الضغط - لا أسماء ثابتة قد تموت
const PREFERRED = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];
let cached = { models: null, at: 0 };

async function resolveModels(key) {
  if (cached.models && Date.now() - cached.at < 600000) return cached.models; // كاش 10 دقائق
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=200`);
    if (!r.ok) return null;
    const j = await r.json();
    const avail = (j.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => m.name.replace("models/", ""));
    if (!avail.length) return null;
    const rank = (n) => {
      const i = PREFERRED.indexOf(n);
      if (i > -1) return i;
      if (n.includes("flash-lite")) return 10;
      if (n.includes("flash")) return 20;
      if (n.includes("pro")) return 30;
      return 99;
    };
    cached = { models: avail.sort((a, b) => rank(a) - rank(b)).slice(0, 5), at: Date.now() };
    console.log("[gemini] models available for this key:", cached.models.join(", "));
    return cached.models;
  } catch { return null; }
}

export async function geminiGenerate({ parts, contents, model, system = "" }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === "" || key.includes("الصق")) {
    return "SYSTEM_ERROR: GEMINI_API_KEY is missing in .env.local";
  }

  const list = model ? [model] : (await resolveModels(key)) || PREFERRED;
  const body = {
    contents: contents && contents.length ? contents : [{ role: "user", parts }],
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
  };

  let last = "";
  for (const m of list) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,
          { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(body) }
        );
        if (!res.ok) {
          const txt = await res.text();
          if (res.status === 429 || res.status === 503) {
            last = `${m} busy (${res.status})`;
            if (attempt === 1) await new Promise((r) => setTimeout(r, 1200));
            continue; // جرّب مرة أخرى ثم النموذج التالي
          }
          if (res.status === 404) break; // نموذج غير موجود - التالي فوراً
          return `SYSTEM_ERROR: Gemini ${res.status} ${txt.slice(0, 200)}`;
        }
        const j = await res.json();
        const text = (j?.candidates?.[0]?.content?.parts || []).map((p) => p.text).filter(Boolean).join("\n");
        if (text) return text;
        last = `${m} empty response`;
        break;
      } catch (e) {
        last = `${m} network: ${e.message}`;
        if (attempt === 1) await new Promise((r) => setTimeout(r, 1200));
      }
    }
  }
  return `SYSTEM_ERROR: All models busy/unavailable (${last})`;
}
