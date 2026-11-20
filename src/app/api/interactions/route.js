import { NextResponse } from "next/server";
export const runtime = "nodejs";
const H = { "User-Agent": "DrMosabBadr/1.0" };
async function jget(url) {
  try { const r = await fetch(url, { headers: H }); if (!r.ok) return null; return await r.json(); }
  catch { return null; }
}
// تحويل اسم دواء → RxCUI
async function toRxcui(name) {
  const j = await jget(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(name)}`);
  return j?.idGroup?.rxnormId?.[0] || null;
}
export async function GET(req) {
  const p = new URL(req.url).searchParams;
  const a = (p.get("drug1") || "").trim();
  const b = (p.get("drug2") || "").trim();
  if (!a || !b) return NextResponse.json({ error: "أدخل دواءين" }, { status: 400 });
  const [r1, r2] = await Promise.all([toRxcui(a), toRxcui(b)]);
  if (!r1 || !r2) return NextResponse.json({ found: false, message: "لم يتم التعرف على أحد الدواءين - استخدم الاسم العلمي بالإنجليزية" });
  const j = await jget(`https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=${r1}`);
  const drugs = j?.interactionType?.find((t) => t.interactionType === "Drug-Drug")?.interactions || [];
  const hit = drugs.find((d) => d.interactingitem?.some?.((x) => x.rxcui === r2));
  return NextResponse.json({
    drug1: a, drug2: b, rxcui1: r1, rxcui2: r2,
    found: !!hit,
    severity: hit?.interaction?.[0]?.severity || null,
    description: hit?.interaction?.[0]?.description || (hit ? "تداخل موجود" : "لا يوجد تداخل مسجل بين الدواءين في RxNav"),
    source: `https://mor.nlm.nih.gov/RxNav/interaction?searchTerm=${r1}`,
  });
}
