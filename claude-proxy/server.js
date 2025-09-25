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
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 300,
        messages: [{ role: "user", content: req.body.prompt }],
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("Claude API error:", response.status, text);
      return res
        .status(response.status)
        .json({ error: "Claude API failed", details: text });
    }

    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Server error:", error);
    res
      .status(500)
      .json({ error: "Claude proxy crashed", details: error.message });
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
