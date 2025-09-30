// ---------------------------------
// هذا الجزء خاص بتعريف الأنواع لـ TypeScript
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
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
import axios from "axios";

// ---------------------------------
// قراءة المتغيرات من ملف البيئة
// ---------------------------------
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const FACEBOOK_PAGE_ID = import.meta.env.VITE_FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = import.meta.env.VITE_INSTAGRAM_USER_ID;
const THREADS_USER_ID = import.meta.env.VITE_THREADS_USER_ID;

// التحقق من وجود المتغيرات
if (!CLOUDINARY_CLOUD_NAME) console.error("❌ VITE_CLOUDINARY_CLOUD_NAME is not set.");
if (!CLOUDINARY_UPLOAD_PRESET) console.error("❌ VITE_CLOUDINARY_UPLOAD_PRESET is not set.");
if (!FACEBOOK_PAGE_ID) console.error("❌ VITE_FACEBOOK_PAGE_ID is not set.");
if (!FACEBOOK_PAGE_ACCESS_TOKEN) console.error("❌ VITE_FACEBOOK_PAGE_ACCESS_TOKEN is not set.");
if (!INSTAGRAM_USER_ID) console.error("❌ VITE_INSTAGRAM_USER_ID is not set.");
if (!THREADS_USER_ID) console.error("❌ VITE_THREADS_USER_ID is not set.");


// -------------------------------------------------------------
// 🆕 الدالة الجديدة لرفع الصورة إلى Cloudinary
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
// 📌 فيسبوك
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
// 📌 إنستغرام
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
// 📌 ثريدز
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
