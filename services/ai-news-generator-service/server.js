import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Claude Proxy API
app.post("/api/claude/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
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

// ✅ Serve React build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "dist"); // مجلد البناء
app.use(express.static(distPath));

// أي route غير موجود → يرجع index.html (يدعم React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
