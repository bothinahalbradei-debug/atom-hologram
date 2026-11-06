exports.handler = async () => {
  const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: { "Authorization": "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      expires_after: { anchor: "created_at", seconds: 600 },
      session: {
        type: "transcription",
        audio: { input: {
          noise_reduction: { type: "near_field" },
          transcription: {
            model: process.env.OPENAI_RT_MODEL || "gpt-4o-transcribe",
            language: "ar"
            
          },
          turn_detection: { type: "server_vad", threshold: 0.5, prefix_padding_ms: 300, silence_duration_ms: 600 }
        } }
      }
    })
  });
  return { statusCode: r.status, headers: { "content-type": "application/json", "cache-control": "no-store" }, body: await r.text() };
};
