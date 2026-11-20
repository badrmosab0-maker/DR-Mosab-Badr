import { NextResponse } from "next/server";
import { rxnorm, openFDALabel, pubmed, medlineplus } from "../../../lib/medicalSources";
export const runtime = "nodejs";

export async function GET(req) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ error: "أدخل كلمة بحث" }, { status: 400 });
  const [rx, label, papers, ml] = await Promise.all([
    rxnorm(q).catch(() => null),
    openFDALabel(q).catch(() => null),
    pubmed(q, 5).catch(() => []),
    medlineplus(q).catch(() => []),
  ]);
  return NextResponse.json({ rxnorm: rx, label, papers, medlineplus: ml });
}
