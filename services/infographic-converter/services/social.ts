import axios from "axios";

declare global {
  interface ImportMetaEnv {
    readonly VITE_LINKEDIN_ORGANIZATION_ID: string;
    readonly VITE_N8N_PUBLISH_WEBHOOK_URL: string; 
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const N8N_PUBLISH_WEBHOOK_URL = import.meta.env.VITE_N8N_PUBLISH_WEBHOOK_URL;
if (!N8N_PUBLISH_WEBHOOK_URL) {
    console.error("❌ VITE_N8N_PUBLISH_WEBHOOK_URL is not set.");
}

// -------------------------------------------------------------
// 🚀 الدالة الشاملة الجديدة للنشر عبر n8n
// -------------------------------------------------------------

/**
 * ترسل المحتوى إلى n8n للقيام بنشره على المنصة المحددة.
 * @param platform - اسم المنصة (e.g., 'facebook', 'instagram', 'linkedin').
 * @param imageBase64 - الصورة المشفرة.
 * @param caption - النص المرافق للمنشور.
 */
export async function sendToPublishingWorkflow(platform: string, imageBase64: string, caption?: string) {
    if (!N8N_PUBLISH_WEBHOOK_URL) {
        console.error("n8n Webhook URL is not configured.");
        return null;
    }

    try {
        // هذه هي البيانات التي سنرسلها إلى n8n
        // لاحظ أننا نرسل اسم المنصة لتوجيه سير العمل
        const payload = {
            platform: platform,
            imageBase64: imageBase64,
            caption: caption || "Check out this new post created with our tool!",
        };

        const response = await axios.post(N8N_PUBLISH_WEBHOOK_URL, payload, {
            headers: { 'Content-Type': 'application/json' },
        });

        console.log(`✅ Data successfully sent to n8n for [${platform}] publishing.`);
        return response.data; // n8n يمكنه إرجاع تأكيد أو رابط المنشور

    } catch (err: any) {
        console.error(`❌ Error sending data to n8n for [${platform}]:`, err.response?.data || err.message);
        return null;
    }
}