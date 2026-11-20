import { NextResponse } from "next/server";
import { geminiGenerate } from "../../../lib/gemini";
import { rxnorm, openFDALabel, pubmed } from "../../../lib/medicalSources";
import { extractMedicalEntities } from "../../../lib/entityExtractor";

const PATIENT_SYS = `أنت مساعد DR/ Mosab Badr الصحي للمريض.
- ردود قصيرة (5 نقاط كحد أقصى) بلغة يومية.
- ممنوع ذكر جرعات أو أسماء تجارية محددة.
- ابدأ بسطر طمأنة، ثم النقاط.
- ادفع لمراجعة الطبيب عند الحاجة.`;

const PRO_SYS = `أنت مساعد سريري للأطباء والصيادلة.
- اذكر الجرعات والتداخلات فقط إن وردت في المصادر مع ذكر المصدر.
- لا تقطع بتشخيص نهائي — صف الاحتمالات.
- اكتب بالعربية مع إبقاء المصطلحات الإنجليزية.`;

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    let message, audience, stage;
    if (body) {
      message = body.message || "";
      audience = body.audience || "patient";
      stage = body.stage || "ask";
    } else {
      const form = await req.formData();
      message = (form.get("message") || "").toString().trim();
      audience = form.get("audience") === "pro" ? "pro" : "patient";
      stage = form.get("stage") || "ask";
    }

    if (!message) return NextResponse.json({ reply: "اكتب سؤالك أولاً", sources: [] });

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
        for (const [k, v] of Object.entries(fdaData.sections || {})) if (v) contextText += `${k}: ${v}\n`;
        sources.push({ title: "openFDA", url: fda.url });
      }
      (pm || []).forEach((p) => { contextText += `\nPubMed: ${p.title} (${p.journal}, ${p.date})\n`; sources.push({ title: p.title.slice(0, 70), url: p.url }); });
    }

    const aiResponse = await geminiGenerate({
      parts: [{ text: `Context:\n${contextText}\n\nUser Message: ${message}` }],
      system: audience === "pro" ? PRO_SYS : PATIENT_SYS,
    });

    const reply = aiResponse.startsWith("SYSTEM_ERROR:")
      ? "تعذّر الاتصال الآن. حاول مرة أخرى."
      : aiResponse;

    return NextResponse.json({ reply, sources });
  } catch (e) {
    console.error("[/api/chat]", e);
    return NextResponse.json({ reply: "حدث خطأ غير متوقع.", sources: [] });
  }
}
