import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();

// ✅ لازم cors يكون قبل أي routes
app.use(cors({
  origin: [
    "https://ai-news-generator-service.onrender.com",
    "https://ghazimortaja.com",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(bodyParser.json());

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

app.options("*", cors()); // ✅ مهم عشان preflight يرد بشكل صحيح

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
  } catch (err: any) {
    console.error("Claude error:", err);
    res.status(500).json({ error: "Claude failed" });
  }
});

export default app;
