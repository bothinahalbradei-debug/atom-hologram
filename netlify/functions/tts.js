exports.handler = async (event) => {
  const code = process.env.ACCESS_CODE, h = event.headers || {};
  if (code && h["x-access-code"] !== code) return { statusCode: 401, body: "access" };
  const body = JSON.parse(event.body || "{}");
  const text = String(body.text || "").slice(0, 500);
  if (!text) return { statusCode: 400, body: "no text" };
  const model = ["eleven_multilingual_v2","eleven_flash_v2_5","eleven_v3"].includes(body.model_id) ? body.model_id : "eleven_multilingual_v2";
  const payload = { text, model_id: model, seed: 4242, voice_settings: { stability: 0.8, similarity_boost: 0.75, style: 0, use_speaker_boost: true } };
  if (/flash_v2_5|eleven_v3/.test(model)) payload.language_code = "ar";
  const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + process.env.ELEVEN_VOICE_ID + "?output_format=mp3_44100_128", {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVEN_API_KEY, "content-type": "application/json", "accept": "audio/mpeg" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) return { statusCode: r.status, body: await r.text() };
  const buf = Buffer.from(await r.arrayBuffer());
  return { statusCode: 200, headers: { "content-type": "audio/mpeg" }, body: buf.toString("base64"), isBase64Encoded: true };
};
