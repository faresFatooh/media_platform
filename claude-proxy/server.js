import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();

// ✅ ميدل وير
app.use(bodyParser.json());
app.use(cors({
  origin: [
    "https://ghazimortaja.com",
    "https://ai-news-generator-service.onrender.com",
    "https://frontend-rgr7.onrender.com"
  ],
  credentials: true,
}));

// ✅ عميل Claude
const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// ✅ راوت للتوليد
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

// ✅ health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ✅ شغل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Claude proxy running on port ${PORT}`);
});
