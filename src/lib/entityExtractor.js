// قاموس موسع للأسماء التجارية العربية والمصرية وربطها بالاسم العلمي
// يمكنك إضافة آلاف الأدوية هنا بسهولة
const drugDictionary = {
  "كتافلام": "diclofenac", "فولتارين": "diclofenac", "ديكلو": "diclofenac",
  "بروفين": "ibuprofen", "نوروفين": "ibuprofen", "ادفيل": "ibuprofen",
  "بنادول": "paracetamol", "ادول": "paracetamol", "سيتال": "paracetamol", "بانادول": "paracetamol",
  "أوجمنتين": "amoxicillin clavulanate", "كلاموكس": "amoxicillin clavulanate",
  "سيبروسين": "ciprofloxacin", "تافاسين": "ciprofloxacin",
  "أزيثرومايسين": "azithromycin", "أزيترو": "azithromycin", "زيثروماكس": "azithromycin",
  "فلاجيل": "metronidazole", "مترونيدازول": "metronidazole",
  "أوميبرازول": "omeprazole", "سيتران": "omeprazole", "جازك": "omeprazole",
  "بانتو": "pantoprazole", "كونترولوك": "pantoprazole",
  "لوسارتان": "losartan", "تاندومين": "losartan",
  "أملوديبين": "amlodipine", "نورفاسك": "amlodipine",
  "ميتفورمين": "metformin", "جلوكوفاج": "metformin",
  "أتورفاستاتين": "atorvastatin", "ليبيتور": "atorvastatin",
  "سيمفاستاتين": "simvastatin", "زوكور": "simvastatin",
  "سيتريزين": "cetirizine", "زيرتك": "cetirizine",
  "لوراتادين": "loratadine", "كلاريتين": "loratadine",
  "أموكسيسيلين": "amoxicillin", "أموكسيل": "amoxicillin",
  "دوكسيسيكلين": "doxycycline", "دوكسين": "doxycycline",
  "بريجابالين": "pregabalin", "ليريكا": "pregabalin",
  "ترامادول": "tramadol", "كونترامال": "tramadol",
  "ديازيبام": "diazepam", "فاليوم": "diazepam",
  "ألبرازولام": "alprazolam", "زولام": "alprazolam",
  "سيرترالين": "sertraline", "لوسترال": "sertraline",
  "فلوكستين": "fluoxetine", "بروزاك": "fluoxetine",
  "بانتوبرازول": "pantoprazole", "رابيبرازول": "rabeprazole", "باريت": "rabeprazole",
  "هيدروكورتيزون": "hydrocortisone", "بيتاميثازون": "betamethasone",
  "سالبيوتامول": "salbutamol", "فينتولين": "salbutamol",
  "ثيوفيلين": "theophylline", "دومبيريدون": "domperidone", "موتيليوم": "domperidone"
};

const conditionDictionary = {
  "صداع نصفي": "migraine", "شقيقة": "migraine", "صداع": "headache",
  "حمى": "fever", "سخونية": "fever", "حرارة": "fever",
  "كحة": "cough", "سعال": "cough", "بلغم": "sputum",
  "غثيان": "nausea", "ترجيع": "vomiting", "قيء": "vomiting",
  "اسهال": "diarrhea", "امساك": "constipation", "مغص": "colic",
  "الم معدة": "abdominal pain", "الم بطن": "abdominal pain",
  "حرقان بول": "urinary tract infection", "التهاب بول": "urinary tract infection",
  "الم ظهر": "back pain", "مفاصل": "joint pain", "ربو": "asthma",
  "حساسية": "allergy", "ضغط": "hypertension", "سكر": "diabetes",
  "كوليسترول": "cholesterol", "دهون كبد": "fatty liver", "قرحة": "peptic ulcer",
  "حموضة": "acid reflux", "ارتجاع": "gastroesophageal reflux",
  "جيوب": "sinusitis", "لوز": "tonsillitis", "ارق": "insomnia",
  "قلق": "anxiety", "توتر": "anxiety", "اكتئاب": "depression",
  "فقر دم": "anemia", "انيميا": "anemia", "جلطة": "stroke"
};

const normalize = (s) => (s || "").replace(/[\u064B-\u065F\u0670]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").toLowerCase();

export async function extractMedicalEntities(message) {
  const t = normalize(message);
  let drug_name = null, condition = null;

  // البحث في القاموس الموسع
  for (const [ar, en] of Object.entries(drugDictionary)) {
    if (!drug_name && t.includes(ar)) drug_name = en;
  }
  for (const [ar, en] of Object.entries(conditionDictionary)) {
    if (!condition && t.includes(ar)) condition = en;
  }

  const englishTokens = (message.match(/[A-Za-z][A-Za-z0-9-]{3,}/g) || []).filter(
    (w) => !["with", "that", "this", "from", "have", "about", "and", "the"].includes(w.toLowerCase())
  );

  const english_query = [drug_name, condition, ...englishTokens].filter(Boolean).join(" ");
  return { drug_name, condition, english_query: english_query || message };
}
