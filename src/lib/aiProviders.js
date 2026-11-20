// نظام ذكاء اصطناعي متعدد - Gemini + OpenRouter + Claude
export async function generateWithGemini(parts, system) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      systemInstruction: { parts: [{ text: system }] }
    })
  });
  
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const j = await res.json();
  return j?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join("\n");
}

export async function generateWithOpenRouter(parts, system) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY missing");
  
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        { role: "system", content: system },
        { role: "user", content: parts.map(p => p.text).join("\n") }
      ]
    })
  });
  
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const j = await res.json();
  return j?.choices?.[0]?.message?.content;
}

export async function generateAI(parts, system) {
  let lastError = "";
  
  try {
    return await generateWithGemini(parts, system);
  } catch (e) {
    lastError = `Gemini: ${e.message}`;
  }
  
  try {
    return await generateWithOpenRouter(parts, system);
  } catch (e) {
    lastError += ` | OpenRouter: ${e.message}`;
  }
  
  throw new Error(`All AI failed: ${lastError}`);
}
