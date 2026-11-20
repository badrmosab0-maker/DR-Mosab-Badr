// استخراج المصطلح الطبي من العربية العامية/Fusha إلى إنجليزية (بحث PubMed/FDA)
// قاموس مدمج خفيف - بدون مكتبات - يعمل offline بالكامل

const normalize = (s) => (s || "")
  .replace(/[\u064B-\u065F\u0670]/g, "")
  .replace(/[أإآ]/g, "ا")
  .replace(/ى/g, "ي")
  .toLowerCase();

// أطول العبارات أولاً حتى لا يخطف "صداع" المطابقة قبل "صداع نصفي"
const DRUGS = [
  ["صداع نصفي", ""], ["شقيقة", ""],
  ["بنادول", "paracetamol"], ["ادول", "paracetamol"], ["سيتال", "paracetamol"],
  ["بروفين", "ibuprofen"], ["نوروفين", "ibuprofen"], ["فولتارين", "diclofenac"],
  ["ديكلو", "diclofenac"], ["اسبرين", "aspirin"],
  ["اوجمنتين", "amoxicillin clavulanate"], ["كلاموكس", "amoxicillin clavulanate"],
  ["سيبروسين", "ciprofloxacin"], ["ازي", "azithromycin"], ["ازيترو", "azithromycin"],
  ["فلاجيل", "metronidazole"], ["مترونيدازول", "metronidazole"],
  ["راني", "famotidine"], ["فامو", "famotidine"], ["زانتاك", "ranitidine"],
  ["اوميبرازول", "omeprazole"], ["سيتران", "omeprazole"], ["بانتو", "pantoprazole"],
  ["سيتريزين", "cetirizine"], ["زيرتك", "cetirizine"], ["لوراتادين", "loratadine"],
  ["كلاريتين", "loratadine"], ["فينتولين", "salbutamol"], ["سالبوتامول", "salbutamol"],
  ["اتروفينت", "ipratropium"], ["لوسترال", "sertraline"], ["سيرترالين", "sertraline"],
  ["سيبرالكس", "escitalopram"], ["اسيتالوبرام", "escitalopram"],
  ["انديرال", "propranolol"], ["بروبرانولول", "propranolol"],
  ["كونكور", "bisoprolol"], ["بيسوبرولول", "bisoprolol"],
  ["املوديبين", "amlodipine"], ["اميل", "amlodipine"],
  ["تانديرال", "losartan"], ["انالابريل", "enalapril"],
  ["فوكس", "fluoxetine"], ["فلوكسيتين", "fluoxetine"],
  ["زولام", "alprazolam"], ["لورانكس", "lorazepam"],
  ["ليريكا", "pregabalin"], ["بريجابالين", "pregabalin"], ["ترامادول", "tramadol"],
  ["موتيليوم", "domperidone"], ["دومبيريدون", "domperidone"],
  ["دوسبتالين", "hyoscine"], ["هيوسين", "hyoscine"],
  ["ثيراكتيل", "chlorpromazine"], ["كلوربرومازين", "chlorpromazine"],
  ["ثيروكسين", "levothyroxine"], ["جلوكوفاج", "metformin"], ["ميتفورمين", "metformin"],
  ["جليمبرايد", "glimepiride"], ["اماريل", "glimepiride"], ["انسولين", "insulin"],
  ["اتورفا", "atorvastatin"], ["ليبيتور", "atorvastatin"], ["رازو", "rosuvastatin"],
  ["فيروجلوبين", "iron"], ["حديد", "iron"], ["فيتامين د", "vitamin d"],
  ["فيتامين c", "vitamin c"], ["ب12", "vitamin b12"], ["اوميغا", "omega-3"],
];

const CONDITIONS = [
  ["صداع نصفي", "migraine"], ["شقيقة", "migraine"], ["صداع", "headache"],
  ["دوخة", "dizziness"], ["دوار", "vertigo"], ["حرارة", "fever"], ["سخونية", "fever"],
  ["حمى", "fever"], ["كحة", "cough"], ["سعال", "cough"], ["بلغم", "sputum"],
  ["غثيان", "nausea"], ["ترجيع", "vomiting"], ["قيء", "vomiting"],
  ["اسهال", "diarrhea"], ["امساك", "constipation"], ["مغص", "colic"],
  ["الم معدة", "abdominal pain"], ["الم بطن", "abdominal pain"],
  ["حرقان بول", "urinary tract infection"], ["التهاب بول", "urinary tract infection"],
  ["الم ظهر", "back pain"], ["مفاصل", "joint pain"], ["ربو", "asthma"],
  ["حساسية", "allergy"], ["ضغط", "hypertension"], ["سكر", "diabetes"],
  ["سكري", "diabetes"], ["درقية", "thyroid"], ["كوليسترول", "cholesterol"],
  ["دهون كبد", "fatty liver"], ["قرحة", "peptic ulcer"], ["حموضة", "acid reflux"],
  ["ارتجاع", "gastroesophageal reflux"], ["جيوب", "sinusitis"], ["لوز", "tonsillitis"],
  ["اسنان", "dental pain"], ["ارق", "insomnia"], ["نوم", "insomnia"],
  ["قلق", "anxiety"], ["توتر", "anxiety"], ["اكتئاب", "depression"],
  ["فقر دم", "anemia"], ["انيميا", "anemia"], ["قلب", "chest pain"],
  ["تنفس", "shortness of breath"], ["جلطة", "stroke"], ["نزيف", "bleeding"],
];

export async function extractMedicalEntities(message) {
  const t = normalize(message);
  let drug_name = null, condition = null;

  for (const [ar, en] of DRUGS) if (!drug_name && t.includes(ar)) drug_name = en;
  for (const [ar, en] of CONDITIONS) if (!condition && t.includes(ar)) condition = en;

  // التقاط أي كلمة إنجليزية طبية مكتوبة أصلاً في النص
  const englishTokens = (message.match(/[A-Za-z][A-Za-z0-9-]{3,}/g) || []).filter(
    (w) => !["with", "that", "this", "from", "have", "about"].includes(w.toLowerCase())
  );

  const english_query = [drug_name, condition, ...englishTokens].filter(Boolean).join(" ");

  return { drug_name, condition, english_query: english_query || message };
}
