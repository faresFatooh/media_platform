// server.js
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
app.use(cors());
app.use(express.json());

// استدعاء Claude API
app.post("/api/claude/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY, // مفتاحك السري من Render Environment
    });

    const msg = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      temperature: 0.7,
      system: `
        أنت صحفي محترف. 
        ❌ لا تستخدم أي لغة غير العربية.
        ✅ جميع المخرجات يجب أن تكون بالعربية الفصحى فقط.
        دائماً أعد النتيجة بصيغة JSON فقط.
      `,
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ text: msg.content[0].text });
  } catch (err) {
    console.error("Claude Proxy Error:", err);
    res.status(500).json({ error: "Claude proxy failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Claude proxy running on port ${PORT}`);
});
