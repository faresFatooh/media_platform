import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();

// --- Middleware ---
app.use(bodyParser.json());
app.use(cors({
  // Ensure your frontend service URL is listed here
  origin: [
    "https://ghazimortaja.com",
    "https://ai-news-generator-service.onrender.com",
    "https://frontend-rgr7.onrender.com"
  ],
  credentials: true,
}));

// --- Claude Client ---
// The SDK is more robust than a direct fetch call
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
      model: "claude-2.1", // A powerful and stable model
      max_tokens: 4096, // ✅ Increased token limit to prevent cut-offs
      system: system, // Pass the system prompt from the frontend
      messages: [{ role: "user", content: prompt }],
    });

    // The SDK automatically provides the clean content
    res.json(msg.content[0].text);

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