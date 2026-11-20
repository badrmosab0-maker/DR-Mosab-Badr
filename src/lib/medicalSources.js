// المصادر الرسمية: RxNorm + openFDA + PubMed + MedlinePlus - fetch أصلي بدون مكتبات
const H = { "User-Agent": "DrMosabBadr/1.0 (medical decision support reference)" };
async function jget(url) {
  try { const r = await fetch(url, { headers: H }); if (!r.ok) return null; return await r.json(); }
  catch { return null; }
}
export async function rxnorm(name) {
  const j = await jget(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(name)}`);
  const rxcui = j?.idGroup?.rxnormId?.[0] || null;
  let props = null;
  if (rxcui) props = await jget(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`);
  return { rxcui, name: props?.properties?.name || name,
    url: rxcui ? `https://mor.nlm.nih.gov/RxNav/search?searchBy=cui&searchTerm=${rxcui}`
      : `https://mor.nlm.nih.gov/RxNav/search?searchBy=string&searchTerm=${encodeURIComponent(name)}` };
}
async function fdaTry(search) {
  const j = await jget(`https://api.fda.gov/drug/label.json?search=${search}&limit=1`);
  return j?.results?.[0] || null;
}
export async function openFDALabel(name) {
  let r = await fdaTry(`openfda.brand_name:%22${encodeURIComponent(name)}%22`);
  if (!r) r = await fdaTry(`openfda.generic_name:%22${encodeURIComponent(name)}%22`);
  if (!r) r = await fdaTry(encodeURIComponent(name));
  if (!r) return null;
  const clean = (s) => (Array.isArray(s) ? s.join(" ") : s || "");
  const cut = (s, n = 700) => { const t = clean(s); return t.length > n ? t.slice(0, n) + "…" : t; };
  return {
    brand: r.openfda?.brand_name?.[0] || name, generic: r.openfda?.generic_name?.[0] || "",
    sections: {
      "الاستطبابات": cut(r.indications_and_usage), "الجرعات": cut(r.dosage_and_administration),
      "التحذيرات": cut(r.warnings), "التداخلات": cut(r.drug_interactions),
      "الأعراض الجانبية": cut(r.adverse_reactions), "موانع الاستعمال": cut(r.contraindications),
    },
    url: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labelType=all&searchTerm=${encodeURIComponent(name)}`,
  };
}
export async function pubmed(term, max = 5) {
  const s = await jget(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=${max}&sort=date&term=${encodeURIComponent(term)}`);
  const ids = s?.esearchresult?.idlist || [];
  if (!ids.length) return [];
  const d = await jget(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}`);
  return ids.map((id) => ({ id, title: d?.result?.[id]?.title || "",
    journal: d?.result?.[id]?.fulljournalname || d?.result?.[id]?.source || "",
    date: d?.result?.[id]?.pubdate || "", url: `https://pubmed.ncbi.nlm.nih.gov/${id}/` })).filter((x) => x.title);
}
export async function medlineplus(term) {
  const j = await jget(`https://connect.medlineplus.gov/application?mainSearchCriteria.v.dn=${encodeURIComponent(term)}&knowledgeResponseType=application/json`);
  return (j?.feed?.entry || []).slice(0, 4).map((e) => {
    const link = Array.isArray(e?.link) ? e.link[0]?.href : e?.link?.href;
    return { title: e?.title?._ || e?.title || "", url: link || "" };
  }).filter((x) => x.title && x.url);
}
