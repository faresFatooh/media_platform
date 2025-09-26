import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();

// --- Middleware ---
app.use(bodyParser.json({ limit: '10mb' })); // زيادة الحد الأقصى لحجم الطلب
app.use(cors({
  // تأكد من وجود رابط واجهتك الأمامية هنا
  origin: [
    "https://ghazimortaja.com",
    "https://ai-news-generator-service.onrender.com",
    "https://frontend-rgr7.onrender.com"
  ],
  credentials: true,
}));

// --- عميل Claude ---
const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// --- مسار التوليد ---
app.post("/api/claude/generate", async (req, res) => {
  try {
    const { prompt, system } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const msg = await client.messages.create({
      model: "claude-haiku-4-20250514", // استخدام نموذج Haiku الأسرع والأكثر توافرًا
      max_tokens: 4096, // ✅ تم زيادة حد التوكنز لمنع انقطاع الرد
      system: system, // تمرير التعليمات النظامية من الواجهة الأمامية
      messages: [{ role: "user", content: prompt }],
    });

    // المكتبة توفر المحتوى النظيف تلقائيًا
    res.json(msg.content[0].text);

  } catch (error) {
    console.error("Server error calling Claude:", error);
    res.status(500).json({ error: "Claude proxy crashed", details: error.message });
  }
});

// --- فحص السلامة ---
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// --- تشغيل الخادم ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Claude proxy running on port ${PORT}`);
});