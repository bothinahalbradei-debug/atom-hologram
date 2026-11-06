exports.handler = async (event) => {
  const body = JSON.parse(event.body || "{}");
  if (!body.audio) return { statusCode: 400, body: "no audio" };
  const bytes = Buffer.from(body.audio, "base64");
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: body.mime || "audio/webm" }), "speech.webm");
  form.append("model", process.env.OPENAI_STT_MODEL || "gpt-4o-mini-transcribe");
  form.append("language", "ar");
  form.append("prompt", "طالبة تتحدث بالعربية عن الذرة: الذرة، النواة، البروتونات، النيوترونات، الإلكترونات، موجبة، سالبة، متعادلة، مستويات الطاقة، يتجاذبان، الكربون، الأكسجين.");
  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST", headers: { "Authorization": "Bearer " + process.env.OPENAI_API_KEY }, body: form
  });
  return { statusCode: r.status, headers: { "content-type": "application/json" }, body: await r.text() };
};
