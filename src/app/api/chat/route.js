import { NextResponse } from "next/server";
import { generateAI } from "../../../lib/aiProviders";
import { DISEASES, SYMPTOMS } from "../../../data/diseases";

export async function POST(req) {
  try {
    const { message, patientInfo, isPro } = await req.json();
    
    if (!message) return NextResponse.json({ error: "اكتب سؤالك" }, { status: 400 });

    // كشف الطوارئ
    const emergencyKeywords = ["ألم صدر", "ضيق تنفس", "نزيف", "فقدان وعي", "تشنج", "جلطة"];
    const isEmergency = emergencyKeywords.some(k => message.toLowerCase().includes(k));
    
    if (isEmergency) {
      return NextResponse.json({
        reply: "🚨 حالة طوارئ! اتصل بالإسعاف فوراً:\n- مصر: 123\n- السعودية: 997\n- الإمارات: 998\n\nلا تنتظر - اذهب لأقرب طوارئ الآن!",
        isEmergency: true,
        sources: []
      });
    }

    // بناء السياق من معلومات المريض
    let context = `معلومات المريض:\n`;
    if (patientInfo?.meds) context += `- الأدوية الحالية: ${patientInfo.meds}\n`;
    if (patientInfo?.diseases) context += `- الأمراض المزمنة: ${patientInfo.diseases}\n`;
    if (patientInfo?.surgeries) context += `- العمليات: ${patientInfo.surgeries}\n`;
    if (patientInfo?.allergies) context += `- الحساسية: ${patientInfo.allergies}\n`;
    
    context += `\nسؤال المستخدم: ${message}\n`;

    // System Prompt
    const system = isPro
      ? `أنت مساعد طبي للأطباء. قدم تشخيصاً تفصيلياً مع خطة علاجية شاملة. اذكر التداخلات الدوائية. اعتمد على الأدلة العلمية.`
      : `أنت مساعد صحي للمرضى. اشرح بلغة بسيطة. لا تذكر جرعات. ادفع لمراجعة الطبيب. قدم خطة علاجية شاملة تراعي الأمراض المزمنة والأدوية الحالية.`;

    // توليد الإجابة
    const reply = await generateAI(
      [{ text: context }],
      system
    );

    return NextResponse.json({ reply, sources: [] });
  } catch (e) {
    return NextResponse.json({ 
      reply: `خطأ: ${e.message}`,
      sources: []
    });
  }
}
