// حماية بسيطة: رمز تجربة اختياري + حد للطلبات لكل زائر
const hits = new Map();
const guard = (event, limitPerMin) => {
  const code = process.env.ACCESS_CODE;
  const h = event.headers || {};
  if (code && (h["x-access-code"] || "") !== code) return { statusCode: 401, body: JSON.stringify({ error: "access" }) };
  const ip = h["x-nf-client-connection-ip"] || h["x-forwarded-for"] || "x";
  const now = Date.now(), win = hits.get(ip) || [];
  const recent = win.filter(t => now - t < 60000); recent.push(now); hits.set(ip, recent);
  if (recent.length > limitPerMin) return { statusCode: 429, body: JSON.stringify({ error: "slow down" }) };
  return null;
};
const MODELS = ["eleven_multilingual_v2", "eleven_flash_v2_5", "eleven_v3"];
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "POST only" };
  const g = guard(event, 60); if (g) return g;
  let body; try { body = JSON.parse(event.body || "{}"); } catch (e) { return { statusCode: 400, body: "bad json" }; }
  const text = String(body.text || "").slice(0, 500);
  if (!text) return { statusCode: 400, body: "no text" };
  const model = process.env.ELEVEN_MODEL || (MODELS.includes(body.model_id) ? body.model_id : "eleven_multilingual_v2");
  const payload = { text, model_id: model, seed: 4242, voice_settings: { stability: 0.8, similarity_boost: 0.75, style: 0, use_speaker_boost: true } };
  if (/flash_v2_5|eleven_v3/.test(model)) payload.language_code = "ar";
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(process.env.ELEVEN_VOICE_ID)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVEN_API_KEY, "content-type": "application/json", "accept": "audio/mpeg" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) return { statusCode: r.status, body: await r.text() };
  const buf = Buffer.from(await r.arrayBuffer());
  return { statusCode: 200, headers: { "content-type": "audio/mpeg" }, body: buf.toString("base64"), isBase64Encoded: true };
};
