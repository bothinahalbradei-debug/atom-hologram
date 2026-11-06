const BASE = "تكلمي كإنسانة حقيقية لا كقارئة آلية: معلمة دافئة ومرحة تتحدث مع طالبة صغيرة تحبها، بالعربية الفصحى السهلة. ابتسمي وأنت تتكلمين، ونوعي نبرتك بشكل طبيعي، وتوقفي توقفات قصيرة عند الفواصل. انطقي الذرة بفتح الذال وتشديد الراء.";
const TONES = {
  excited: "النبرة الآن: حماس ودهشة وفرح كبير، صوت أعلى قليلا وأسرع قليلا، كأنك تعلنين مفاجأة جميلة.",
  gentle: "النبرة الآن: لطيفة جدا ومطمئنة، أبطأ وأهدأ، كأنك تشجعين طفلة خجولة بحنان.",
  happy: "النبرة الآن: فرح حقيقي وفخر بالطالبة، مع ابتسامة واضحة في الصوت.",
  curious: "النبرة الآن: فضول ومرح، وارفعي نبرتك في آخر السؤال كأنك تنتظرين الجواب بشوق.",
  warm: "النبرة الآن: دافئة وحنونة وهادئة، كوداع صديقة عزيزة.",
  normal: "النبرة الآن: ودودة وطبيعية وحيوية."
};
exports.handler = async (event) => {
  const body = JSON.parse(event.body || "{}");
  const text = String(body.text || "").slice(0, 600);
  if (!text) return { statusCode: 400, body: "no text" };
  const tone = TONES[body.tone] || TONES.normal;
  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { "Authorization": "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: process.env.OPENAI_VOICE || "marin",
      input: text,
      instructions: BASE + " " + tone,
      response_format: "mp3"
    })
  });
  if (!r.ok) return { statusCode: r.status, body: await r.text() };
  const buf = Buffer.from(await r.arrayBuffer());
  return { statusCode: 200, headers: { "content-type": "audio/mpeg" }, body: buf.toString("base64"), isBase64Encoded: true };
};
