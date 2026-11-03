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
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "POST only" };
  const g = guard(event, 40); if (g) return g;
  let body; try { body = JSON.parse(event.body || "{}"); } catch (e) { return { statusCode: 400, body: "bad json" }; }
  const safe = {
    model: process.env.CLAUDE_MODEL || "claude-haiku-5-5",
    max_tokens: Math.min(Number(body.max_tokens) || 150, 300),
    system: String(body.system || "").slice(0, 4000),
    messages: (Array.isArray(body.messages) ? body.messages : []).slice(-12)
  };
  if (body.thinking) safe.thinking = body.thinking;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify(safe)
  });
  return { statusCode: r.status, headers: { "content-type": "application/json" }, body: await r.text() };
};
