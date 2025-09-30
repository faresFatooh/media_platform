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
    readonly VITE_LINKEDIN_ORGANIZATION_ID: string; // ⚙️ Added
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
const LINKEDIN_ORGANIZATION_ID = import.meta.env.VITE_LINKEDIN_ORGANIZATION_ID; // ⚙️ Added

// Checking for the existence of variables
if (!CLOUDINARY_CLOUD_NAME) console.error("❌ VITE_CLOUDINARY_CLOUD_NAME is not set.");
if (!CLOUDINARY_UPLOAD_PRESET) console.error("❌ VITE_CLOUDINARY_UPLOAD_PRESET is not set.");
if (!FACEBOOK_PAGE_ID) console.error("❌ VITE_FACEBOOK_PAGE_ID is not set.");
if (!FACEBOOK_PAGE_ACCESS_TOKEN) console.error("❌ VITE_FACEBOOK_PAGE_ACCESS_TOKEN is not set.");
if (!INSTAGRAM_USER_ID) console.error("❌ VITE_INSTAGRAM_USER_ID is not set.");
if (!THREADS_USER_ID) console.error("❌ VITE_THREADS_USER_ID is not set.");
if (!TELEGRAM_BOT_TOKEN) console.error("❌ VITE_TELEGRAM_BOT_TOKEN is not set.");
if (!TELEGRAM_CHAT_ID) console.error("❌ VITE_TELEGRAM_CHAT_ID is not set.");
if (!LINKEDIN_ORGANIZATION_ID) console.error("❌ VITE_LINKEDIN_ORGANIZATION_ID is not set."); // ⚙️ Added



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
// 📌 LinkedIn
// -------------------------------------------------------------

// Helper function to convert Base64 to Blob
function base64ToBlob(base64: string, contentType: string): Blob {
    const byteString = atob(base64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: contentType });
}

export async function createLinkedInPost(options: { 
  accessToken: string; 
  organizationId: string;
  imageBase64: string; 
  caption?: string 
}) {
  try {
    const { accessToken, organizationId, imageBase64, caption } = options;

    // ---- STEP A: Register the image for upload ----
    const registerUploadResponse = await axios.post(
      'https://api.linkedin.com/rest/assets?action=registerUpload',
      {
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: organizationId,
          serviceRelationships: [{
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent"
          }]
        }
      },
      { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );

    const uploadUrl = registerUploadResponse.data.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
    const assetUrn = registerUploadResponse.data.value.asset;

    // ---- STEP B: Upload the image binary ----
    const blob = base64ToBlob(imageBase64, 'image/png'); 
    
    await axios.put(uploadUrl, blob, {
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'image/png' }
    });

    // ---- STEP C: Create the post with the uploaded image ----
    const postResponse = await axios.post(
      'https://api.linkedin.com/rest/posts',
      {
        author: organizationId,
        commentary: caption || "New infographic from our tool!",
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED"
        },
        content: {
          media: {
            title: "Image",
            id: assetUrn
          }
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false
      },
      { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );

    return postResponse.data;

  } catch (err: any) {
    console.error("❌ LinkedIn create post error:", err.response?.data || err);
    return null;
  }
}