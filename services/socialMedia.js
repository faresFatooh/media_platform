import fetch from "node-fetch";

/**
 * نشر بوست نص/رابط على صفحة فيسبوك
 * @param {string} pageId - ID الصفحة
 * @param {string} pageAccessToken - توكن الصفحة (Page Access Token)
 * @param {string} message - النص أو الكابتشن
 * @param {string} [link] - (اختياري) رابط خارجي
 */
export async function postToFacebook(pageId, pageAccessToken, message, link = null) {
  const url = `https://graph.facebook.com/${pageId}/feed?access_token=${pageAccessToken}`;
  const body = { message };
  if (link) body.link = link;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (data.error) throw new Error(`Facebook Error: ${data.error.message}`);
  return data;
}

/**
 * نشر صورة/فيديو/ريلز على إنستغرام بيزنس (عبر Graph API)
 * @param {string} igUserId - Instagram Business Account ID
 * @param {string} pageAccessToken - Page Access Token المرتبط بالإنستغرام
 * @param {string} mediaUrl - رابط الصورة/الفيديو (يجب يكون عام https)
 * @param {string} caption - النص
 */
export async function postToInstagram(igUserId, pageAccessToken, mediaUrl, caption = "") {
  // 1. إنشاء container
  const createUrl = `https://graph.facebook.com/v21.0/${igUserId}/media?access_token=${pageAccessToken}`;
  const createRes = await fetch(createUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: mediaUrl, caption }),
  });

  const createData = await createRes.json();
  if (createData.error) throw new Error(`Instagram Error: ${createData.error.message}`);

  // 2. نشر الـ container
  const publishUrl = `https://graph.facebook.com/v21.0/${igUserId}/media_publish?access_token=${pageAccessToken}`;
  const publishRes = await fetch(publishUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: createData.id }),
  });

  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`Instagram Publish Error: ${publishData.error.message}`);
  return publishData;
}
