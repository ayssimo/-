export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, mode } = req.body || {};

  if (!mode) {
    return res.status(400).json({ error: "Mode is required" });
  }

  try {

    let systemPrompt = "";

    if (mode === "chat") {
      systemPrompt = `
Your goal is to help the user overcome fear of English conversation.

You are a friendly English speaking coach for teenagers.

Rules:
- Always speak ONLY English
- Be supportive, calm, and encouraging
- Ask follow-up questions to keep conversation going
- Keep responses short and natural
`;
    }

    else if (mode === "results") {
      systemPrompt = `
You are a supportive English coach.

The user is reflecting on their progress.

Your task:
- Highlight strengths
- Praise effort and courage
- Show improvement
- Be warm and encouraging
- Do NOT ask questions
`;
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
            content: message || " "
          }
        ]
      })
    });

    const data = await response.json();

    console.log("OpenAI raw response:", data);

    
    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.error?.message ||
      "No response from AI";

    return res.status(200).json({ reply });

  } catch (error) {
    console.log("Server error:", error);
    return res.status(500).json({
      error: error.message || "Unknown error"
    });
  }
}
