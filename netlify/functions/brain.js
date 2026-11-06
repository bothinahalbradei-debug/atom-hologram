exports.handler = async (event) => {
  const body = JSON.parse(event.body || "{}");
  const messages = [];
  if (body.system) messages.push({ role: "system", content: String(body.system).slice(0, 4000) });
  (body.messages || []).slice(-12).forEach(m => messages.push({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "") }));
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini", messages, max_tokens: Math.min(Number(body.max_tokens) || 150, 300), temperature: 0.3 })
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) return { statusCode: r.status, headers: { "content-type": "application/json" }, body: JSON.stringify(d) };
  const text = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || "";
  return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ content: [{ type: "text", text }] }) };
};
