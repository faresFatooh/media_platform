// ---------------------------------
// This part is for TypeScript type definitions
// ---------------------------------
declare global {
  interface ImportMetaEnv {
    readonly VITE_CLOUDINARY_CLOUD_NAME: string;
    readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
    readonly VITE_FACEBOOK_APP_ID: string;
    readonly VITE_FACEBOOK_PAGE_ID: string;
    readonly VITE_FACEBOOK_PAGE_ACCESS_TOKEN: string;
    readonly VITE_INSTAGRAM_USER_ID: string;
    readonly VITE_THREADS_USER_ID: string;
    readonly VITE_TELEGRAM_BOT_TOKEN: string;
    readonly VITE_TELEGRAM_CHAT_ID: string;
    readonly VITE_LINKEDIN_ORGANIZATION_ID: string;
    readonly VITE_N8N_LINKEDIN_WEBHOOK_URL: string; // ⚙️ NEW: n8n Webhook URL
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
import axios from "axios";

// ---------------------------------
// Reading variables from the environment file
// ---------------------------------
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const FACEBOOK_PAGE_ID = import.meta.env.VITE_FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = import.meta.env.VITE_INSTAGRAM_USER_ID;
const THREADS_USER_ID = import.meta.env.VITE_THREADS_USER_ID;
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
const LINKEDIN_ORGANIZATION_ID = import.meta.env.VITE_LINKEDIN_ORGANIZATION_ID;
const N8N_LINKEDIN_WEBHOOK_URL = import.meta.env.VITE_N8N_LINKEDIN_WEBHOOK_URL; // ⚙️ NEW

// Checking for the existence of variables
if (!CLOUDINARY_CLOUD_NAME) console.error("❌ VITE_CLOUDINARY_CLOUD_NAME is not set.");
if (!CLOUDINARY_UPLOAD_PRESET) console.error("❌ VITE_CLOUDINARY_UPLOAD_PRESET is not set.");
if (!FACEBOOK_PAGE_ID) console.error("❌ VITE_FACEBOOK_PAGE_ID is not set.");
if (!FACEBOOK_PAGE_ACCESS_TOKEN) console.error("❌ VITE_FACEBOOK_PAGE_ACCESS_TOKEN is not set.");
if (!INSTAGRAM_USER_ID) console.error("❌ VITE_INSTAGRAM_USER_ID is not set.");
if (!THREADS_USER_ID) console.error("❌ VITE_THREADS_USER_ID is not set.");
if (!TELEGRAM_BOT_TOKEN) console.error("❌ VITE_TELEGRAM_BOT_TOKEN is not set.");
if (!TELEGRAM_CHAT_ID) console.error("❌ VITE_TELEGRAM_CHAT_ID is not set.");
if (!LINKEDIN_ORGANIZATION_ID) console.error("❌ VITE_LINKEDIN_ORGANIZATION_ID is not set.");
if (!N8N_LINKEDIN_WEBHOOK_URL) console.error("❌ VITE_N8N_LINKEDIN_WEBHOOK_URL is not set."); // ⚙️ NEW

// -------------------------------------------------------------
// 🆕 New function to upload an image to Cloudinary
// -------------------------------------------------------------
export async function uploadImageToCloud(base64Image: string): Promise<string | null> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.error("Cloudinary settings are not configured properly.");
    return null;
  }
  
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  try {
    const response = await axios.post(url, {
      file: base64Image,
      upload_preset: CLOUDINARY_UPLOAD_PRESET,
    });
    return response.data.secure_url;
  } catch (error: any) {
    console.error("❌ Cloudinary upload failed:", error.response?.data || error);
    return null;
  }
}

// -------------------------------------------------------------
// 📌 Facebook
// -------------------------------------------------------------
export async function createFacebookPost(options: { imageBase64: string; message?: string }) {
  try {
    const url = `https://graph.facebook.com/v20.0/${FACEBOOK_PAGE_ID}/photos`;
    const byteString = atob(options.imageBase64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ia], { type: "image/png" });
    const formData = new FormData();
    formData.append("access_token", FACEBOOK_PAGE_ACCESS_TOKEN);
    formData.append("published", "true");
    formData.append("source", blob, "infographic.png");
    if (options.message) {
      formData.append("message", options.message);
    }
    const res = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: any) {
    console.error("❌ Facebook create post error:", err.response?.data || err);
    return null;
  }
}

export async function updateFacebookPost(postId: string, caption: string) {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v20.0/${postId}`,
      null,
      { params: { message: caption, access_token: FACEBOOK_PAGE_ACCESS_TOKEN } }
    );
    return res.data;
  } catch (err: any) {
    console.error("❌ Facebook update post error:", err.response?.data || err);
    return null;
  }
}

// -------------------------------------------------------------
// 📌 Instagram
// -------------------------------------------------------------
export async function createInstagramPost(options: { imageUrl: string; caption?: string }) {
  try {
    const container = await axios.post(
      `https://graph.facebook.com/v20.0/${INSTAGRAM_USER_ID}/media`,
      null,
      { params: { image_url: options.imageUrl, caption: options.caption || "", access_token: FACEBOOK_PAGE_ACCESS_TOKEN } }
    );
    const publish = await axios.post(
      `https://graph.facebook.com/v20.0/${INSTAGRAM_USER_ID}/media_publish`,
      null,
      { params: { creation_id: container.data.id, access_token: FACEBOOK_PAGE_ACCESS_TOKEN } }
    );
    return publish.data;
  } catch (err: any) {
    console.error("❌ Instagram create post error:", err.response?.data || err);
    return null;
  }
}

// -------------------------------------------------------------
// 📌 Threads
// -------------------------------------------------------------
export async function createThreadsPost(options: { text: string }) {
  try {
    if (!THREADS_USER_ID) throw new Error("Threads User ID is not set.");
    const res = await axios.post(
      `https://graph.facebook.com/v20.0/${THREADS_USER_ID}/threads`,
      null,
      { params: { text: options.text, access_token: FACEBOOK_PAGE_ACCESS_TOKEN } }
    );
    return res.data;
  } catch (err: any) {
    console.error("❌ Threads create post error:", err.response?.data || err);
    return null;
  }
}

// -------------------------------------------------------------
// 📌 Telegram
// -------------------------------------------------------------
export async function createTelegramPost(options: { imageBase64: string; caption?: string }) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("❌ Telegram Bot Token or Chat ID is not set.");
    return null;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

    const byteString = atob(options.imageBase64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ia], { type: "image/png" });

    const formData = new FormData();
    formData.append("chat_id", TELEGRAM_CHAT_ID);
    formData.append("photo", blob, "infographic.png");
    if (options.caption) {
      formData.append("caption", options.caption);
    }

    const res = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (err: any) {
    console.error("❌ Telegram create post error:", err.response?.data || err);
    return null;
  }
}

// -------------------------------------------------------------
// 📌 LinkedIn (USING N8N WEBHOOK) ⚙️ NEW
// -------------------------------------------------------------

/**
 * يرسل بيانات المنشور (صورة Base64 ووصف) إلى n8n Webhook
 * ليقوم n8n بالنشر على LinkedIn.
 * * @param options - الخيارات المطلوبة.
 * @param options.imageBase64 - الصورة المشفرة Base64.
 * @param options.caption - النص/الوصف للمنشور.
 */
export async function sendToN8nLinkedInWorkflow(options: { 
    imageBase64: string; 
    caption?: string 
}) {
    if (!N8N_LINKEDIN_WEBHOOK_URL) {
        console.error("❌ n8n Webhook URL for LinkedIn is not configured.");
        return null;
    }

    try {
        const { imageBase64, caption } = options;

        // البيانات التي سيرسلها التطبيق إلى n8n
        const payload = {
            // سنرسل البيانات اللازمة لـ n8n. يجب أن تكون n8n هي التي تتعامل مع accessToken
            // و organizationId في هذه الحالة لتبسيط الكود هنا.
            imageBase64: imageBase64,       
            caption: caption || "New infographic from our tool!", 
        };

        // إرسال طلب POST إلى n8n Webhook
        const response = await axios.post(
            N8N_LINKEDIN_WEBHOOK_URL,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log("✅ Data successfully sent to n8n Webhook for LinkedIn.");
        return response.data;

    } catch (err: any) {
        // طباعة تفاصيل الخطأ في حال فشل الاتصال بالـ Webhook
        console.error("❌ Error sending data to n8n LinkedIn Webhook:", err.response?.data || err.message);
        return null;
    }
}
