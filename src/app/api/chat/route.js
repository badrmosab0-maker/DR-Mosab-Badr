import { NextResponse } from "next/server";
import { geminiGenerate } from "../../../lib/gemini";
import { rxnorm, openFDALabel, pubmed } from "../../../lib/medicalSources";
import { extractMedicalEntities } from "../../../lib/entityExtractor";
export const runtime = "nodejs";

const PATIENT_SYS = `أنت مساعد DR/ Mosab Badr الصحي للمريض.
- ردود قصيرة (5 نقاط كحد أقصى) بلغة يومية بسيطة.
- ممنوع ذكر جرعات أو أسماء تجارية محددة.
- ابدأ بسطر طمأنة ثم النقاط، وادفع لمراجعة الطبيب عند الحاجة.
- اعتمد على المصادر المرفقة فقط، وإن غابت قل "استشر طبيبك" ولا تخترع.`;

const PRO_SYS = `أنت مساعد سريري للأطباء والصيادلة.
- اذكر الجرعات والتداخلات فقط إن وردت نصاً في المصادر مع ذكر المصدر.
- لا تقطع بتشخيص نهائي، صف الاحتمالات.
- بالعربية مع إبقاء المصطلحات الإنجليزية.`;

function detectRedFlags(text) {
  const t = (text || "").toLowerCase();
  const rules = [
    [["الم في الصدر","الم صدر","ألم صدر","ضغط في الصدر","chest pain"], "قد يكون مشكلة قلبية - اتصل بالإسعاف فوراً"],
    [["ضيق تنفس","صعوبة في التنفس","shortness of breath"], "إن كان شديداً أو مفاجئاً توجه للطوارئ الآن"],
    [["شلل","تنميل نصف","تلعثم","انحراف الفم","ضعف مفاجئ","stroke"], "علامات قد تخص الجلطة - الطوارئ فوراً"],
    [["نزيف","دم في القيء","دم في البراز","براز أسود"], "نزيف محتمل - طوارئ فوراً"],
    [["فقدان الوعي","إغماء","تشنج","seizure"], "طوارئ فوراً"],
  ];
  return rules.filter((r) => r[0].some((k) => t.includes(k))).map((r) => r[1]);
}

export async function POST(req) {
  try {
    let message, audience = "patient";
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const b = await req.json();
      message = (b.message || "").toString().trim();
      audience = b.audience === "pro" ? "pro" : "patient";
    } else {
      const form = await req.formData();
      message = (form.get("message") || "").toString().trim();
      audience = form.get("audience") === "pro" ? "pro" : "patient";
    }
    if (!message) return NextResponse.json({ reply: "اكتب سؤالك أولاً", sources: [] });

    const redFlags = detectRedFlags(message);
    if (redFlags.length > 0) {
      return NextResponse.json({
        reply: "🚨 بناءً على وصفك توجد علامات تستدقي تقييماً عاجلاً الآن:\n\n" +
          redFlags.map((r) => "- " + r).join("\n") +
          "\n\nلا تنتظر - توجه لأقرب طوارئ أو اتصل بالإسعاف.",
        sources: [], red_flags: redFlags,
      });
    }

    const entities = await extractMedicalEntities(message);
    const searchTerm = entities.drug_name || entities.condition || entities.english_query;

    let contextText = `User Query: ${message}\n`;
    const sources = [];
    if (searchTerm) {
      const [rx, fda, pm] = await Promise.all([
        rxnorm(searchTerm).catch(() => null),
        openFDALabel(searchTerm).catch(() => null),
        pubmed(searchTerm, 3).catch(() => []),
      ]);
      if (rx?.rxcui) { contextText += `\nRxNorm: ${rx.name} (RxCUI ${rx.rxcui})\n`; sources.push({ title: "RxNorm (NLM)", url: rx.url }); }
      if (fda) {
        contextText += `\nFDA label for ${fda.brand || fda.generic}:\n`;
        // ✅ الإصلاح: المتغير الصحيح هو fda وليس fdaData
        for (const [k, v] of Object.entries(fda.sections || {})) if (v) contextText += `${k}: ${v}\n`;
        sources.push({ title: "openFDA", url: fda.url });
      }
      (pm || []).forEach((p) => { contextText += `\nPubMed: ${p.title} (${p.journal}, ${p.date})\n`; sources.push({ title: p.title.slice(0, 70), url: p.url }); });
    }

    const raw = await geminiGenerate({
      parts: [{ text: `Context:\n${contextText}\n\nUser Message: ${message}` }],
      system: audience === "pro" ? PRO_SYS : PATIENT_SYS,
    });
    const reply = raw.startsWith("SYSTEM_ERROR:")
      ? "تعذّر التوليد الآن (خدمة الذكاء الاصطناعي مشغولة). حاول بعد لحظات."
      : raw;
    return NextResponse.json({ reply, sources, red_flags: [] });
  } catch (e) {
    console.error("=== /api/chat ERROR ===", e); // ← سيظهر في Vercel Logs
    return NextResponse.json({ reply: "حدث خطأ غير متوقع.", sources: [], red_flags: [] });
  }
}
