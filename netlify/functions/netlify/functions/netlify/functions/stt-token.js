exports.handler = async (event) => {
  const code = process.env.ACCESS_CODE, h = event.headers || {};
  if (code && h["x-access-code"] !== code) return { statusCode: 401, body: "access" };
  const region = process.env.AZURE_SPEECH_REGION;
  const r = await fetch("https://" + region + ".api.cognitive.microsoft.com/sts/v1.0/issueToken", {
    method: "POST", headers: { "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY, "content-length": "0" }
  });
  if (!r.ok) return { statusCode: r.status, body: await r.text() };
  return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ token: await r.text(), region }) };
};
