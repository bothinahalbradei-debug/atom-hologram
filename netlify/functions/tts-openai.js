const BASE = "معلمة دافئة ومرحة تتحدث مع طالبة صغيرة بالعربية الفصحى السهلة، بصوت إنسان طبيعي غير آلي. بلا ضحك ولا تنفس مسموع ولا أي أصوات غير الكلام. انطقي الذرة بفتح الذال وتشديد الراء.";
const TONES = {
  excited: "النبرة: حماس وفرح.",
  gentle: "النبرة: لطيفة ومطمئنة وأهدأ.",
  happy: "النبرة: فرح وفخر بالطالبة.",
  curious: "النبرة: فضول، وارفعي النبرة في آخر السؤال.",
  warm: "النبرة: دافئة وحنونة.",
  normal: "النبرة: ودودة وطبيعية."
};
exports.handler = async (event) => {
  const body = JSON.parse(event.body || "{}");
  const text = String(body.text || "").slice(0, 600);
  if (!text) return { statusCode: 400, body: "no text" };
  const tone = TONES[body.tone] || TONES.normal;
  const model = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
  const payload = { model, voice: process.env.OPENAI_VOICE || "marin", input: text, response_format: "mp3" };
  if (model.startsWith("gpt-")) payload.instructions = BASE + " " + tone;
  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { "Authorization": "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) return { statusCode: r.status, body: await r.text() };
  const buf = Buffer.from(await r.arrayBuffer());
  return { statusCode: 200, headers: { "content-type": "audio/mpeg" }, body: buf.toString("base64"), isBase64Encoded: true };
};
