import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();

// --- Middleware ---
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors({
  origin: [
    "https://ghazimortaja.com",
    "https://ai-news-generator-service.onrender.com",
    "https://frontend-rgr7.onrender.com"
  ],
  credentials: true,
}));

// --- Claude Client ---
const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// --- Generation Route ---
app.post("/api/claude/generate", async (req, res) => {
  try {
    const { prompt, system } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const msg = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      system: system,
      messages: [{ role: "user", content: prompt }],
    });

    // ✅ --- THIS IS THE FIX ---
    // We manually set the header and send the raw JSON string
    // instead of letting express re-encode it.
    res.setHeader('Content-Type', 'application/json');
    res.send(msg.content[0].text);
    // -------------------------

  } catch (error) {
    console.error("Server error calling Claude:", error);
    res.status(500).json({ error: "Claude proxy crashed", details: error.message });
  }
});

// --- Health Check ---
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Claude proxy running on port ${PORT}`);
});