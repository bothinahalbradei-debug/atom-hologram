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
exports.handler = async (event) => {
  const g = guard(event, 20); if (g) return g;
  const region = process.env.AZURE_SPEECH_REGION;
  const r = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
    method: "POST", headers: { "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY, "content-length": "0" }
  });
  if (!r.ok) return { statusCode: r.status, body: await r.text() };
  return { statusCode: 200, headers: { "content-type": "application/json", "cache-control": "no-store" }, body: JSON.stringify({ token: await r.text(), region }) };
};
