exports.handler = async (event) => {
  const body = JSON.parse(event.body || "{}");
  const text = String(body.text || "").slice(0, 600);
  if (!text) return { statusCode: 400, body: "no text" };
  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { "Authorization": "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: process.env.OPENAI_VOICE || "nova",
      input: text,
      instructions: "تحدثي بالعربية الفصحى بنطق صحيح وواضح، بصوت معلمة ودودة متحمسة تتكلم مع طالبات صغيرات، وبسرعة هادئة. انطقي كلمة الذَّرَّة بفتح الذال وتشديد الراء.",
      response_format: "mp3"
    })
  });
  if (!r.ok) return { statusCode: r.status, body: await r.text() };
  const buf = Buffer.from(await r.arrayBuffer());
  return { statusCode: 200, headers: { "content-type": "audio/mpeg" }, body: buf.toString("base64"), isBase64Encoded: true };
};
