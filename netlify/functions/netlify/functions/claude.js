exports.handler = async (event) => {
  const code = process.env.ACCESS_CODE, h = event.headers || {};
  if (code && h["x-access-code"] !== code) return { statusCode: 401, body: "access" };
  const body = JSON.parse(event.body || "{}");
  const safe = {
    model: process.env.CLAUDE_MODEL || "claude-haiku-5-5",
    max_tokens: Math.min(Number(body.max_tokens) || 150, 300),
    system: String(body.system || "").slice(0, 4000),
    messages: (body.messages || []).slice(-12)
  };
  if (body.thinking) safe.thinking = body.thinking;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify(safe)
  });
  return { statusCode: r.status, headers: { "content-type": "application/json" }, body: await r.text() };
};
