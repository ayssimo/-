export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, mode } = req.body || {};

  if (!mode) {
    return res.status(400).json({ error: "Mode is required" });
  }

  try {

    let systemPrompt;

    
    if (mode === "chat") {
      systemPrompt = `

Your goal is to help the user overcome fear of English conversation.

You are a friendly English speaking coach for teenagers.

Rules:
- Always speak ONLY English
- Be supportive, calm, and encouraging
- Help the user practice real conversation
- Ask simple follow-up questions to keep dialogue going
- Correct mistakes gently without saying "you are wrong"
- Focus on confidence, not perfection
- Keep responses short and natural like a chat partner
`;
    }

    
    else if (mode === "results") {
      systemPrompt = `
You are a supportive English coach.

The user is reflecting on their progress.

Your task:
- Highlight their strengths
- Praise effort and courage
- Show improvement in English
- Be warm and encouraging
- Do NOT ask questions
- End with motivation
`;
    }

    else {
      return res.status(400).json({ error: "Invalid mode" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message || ""
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("OpenAI error:", data);
      return res.status(500).json({
        error: data.error?.message || "OpenAI request failed"
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: "Empty response from AI" });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.log("Server error:", error);
    return res.status(500).json({ error: error.message });
  }
}
