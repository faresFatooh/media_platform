declare global {
  interface ImportMetaEnv {
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

const FACEBOOK_PAGE_ID = import.meta.env.VITE_FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = import.meta.env.VITE_INSTAGRAM_USER_ID;
const THREADS_USER_ID = import.meta.env.VITE_THREADS_USER_ID;

if (!FACEBOOK_PAGE_ID) console.error("❌ VITE_FACEBOOK_PAGE_ID is not set.");
if (!FACEBOOK_PAGE_ACCESS_TOKEN) console.error("❌ VITE_FACEBOOK_PAGE_ACCESS_TOKEN is not set.");
if (!INSTAGRAM_USER_ID) console.error("❌ VITE_INSTAGRAM_USER_ID is not set.");
if (!THREADS_USER_ID) console.error("❌ VITE_THREADS_USER_ID is not set.");

// 📌 فيسبوك
// ----------------------------
// 🆕 إنشاء منشور جديد بصورة (ينزل في البوستات مباشرة)
// ----------------------------
// نشر صورة (Base64 أو URL)
export async function createFacebookPost(options: { imageBase64: string; message?: string }) {
  try {
    const url = `https://graph.facebook.com/v23.0/${FACEBOOK_PAGE_ID}/photos`;

    // فك Base64 وتحويله لـ Blob
    const byteString = atob(options.imageBase64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ia], { type: "image/png" });

    // تجهيز البيانات
    const formData = new FormData();
    formData.append("access_token", FACEBOOK_PAGE_ACCESS_TOKEN);
    formData.append("published", "true"); // 👈 مباشرة كمنشور
    formData.append("source", blob, "infographic.png");
    if (options.message) {
      formData.append("message", options.message);
    }

    // رفع الصورة + نشرها في بوست واحد
    const res = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data; // فيه id للمنشور الجديد
  } catch (err: any) {
    console.error("❌ Facebook create post error:", err.response?.data || err);
    return null;
  }
}


export async function updateFacebookPost(
  postId: string,
  caption: string
) {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v23.0/${postId}`,
      null,
      {
        params: {
          message: caption,
          access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
        },
      }
    );
    return res.data;
  } catch (err: any) {
    console.error("❌ Facebook update post error:", err.response?.data || err);
    return null;
  }
}


// 📌 إنستغرام
export async function createInstagramPost(options: { imageUrl: string; caption?: string }) {
  try {
    const container = await axios.post(
      `https://graph.facebook.com/v23.0/${INSTAGRAM_USER_ID}/media`,
      null,
      { params: { image_url: options.imageUrl, caption: options.caption || "", access_token: FACEBOOK_PAGE_ACCESS_TOKEN } }
    );
    const publish = await axios.post(
      `https://graph.facebook.com/v23.0/${INSTAGRAM_USER_ID}/media_publish`,
      null,
      { params: { creation_id: container.data.id, access_token: FACEBOOK_PAGE_ACCESS_TOKEN } }
    );
    return publish.data;
  } catch (err: any) {
    console.error("❌ Instagram create post error:", err.response?.data || err);
    return null;
  }
}

// 📌 ثريدز
export async function createThreadsPost(options: { text: string }) {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v23.0/${THREADS_USER_ID}/threads`,
      null,
      { params: { text: options.text, access_token: FACEBOOK_PAGE_ACCESS_TOKEN } }
    );
    return res.data;
  } catch (err: any) {
    console.error("❌ Threads create post error:", err.response?.data || err);
    return null;
  }
}
