import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

app.post("/api/claude/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const completion = await client.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.content[0].text;
    res.json({ text });
  } catch (err) {
    console.error("Claude error:", err);
    res.status(500).json({ error: "Claude failed" });
  }
});

// ✅ عند النشر على Render بيشتغل على البورت من متغير البيئة
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Claude proxy running on port ${PORT}`);
});
