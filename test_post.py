import requests

# url = "https://graph.facebook.com/v23.0/112674963938554/feed"
# payload = {
#     "message": "مرحبا 👋 هذا بوست تجريبي من API",
#     "access_token": "EAALZCfHZBSLxoBPt1Cf6vPobdgfh1njkjj2RAHZABa6Ld71dcVgX2wZAneQdk5WtvZC3PlNwZBOVNinXZCoSAjHhTsxwPldHZCBpPlTlwKlgUphDDRvQUDPWwjKJ09BTZA2OizhsRoZBzxmW84D6q0zva2jaIZCQg3DMZBdfXZBqgZBSq8h0xyCzfxZAZAXxw4ZAx3zl6UoqHKNP8cLWrjmAUCPx7RFPcSfQT1eQYZBnuZBxo5ZCNYZBqygZDZD",
# }

# res = requests.post(url, data=payload)
# print(res.json())
import requests

PAGE_ID = "112674963938554"   # ID الصفحة
PAGE_ACCESS_TOKEN = "EAALZCfHZBSLxoBPt1Cf6vPobdgfh1njkjj2RAHZABa6Ld71dcVgX2wZAneQdk5WtvZC3PlNwZBOVNinXZCoSAjHhTsxwPldHZCBpPlTlwKlgUphDDRvQUDPWwjKJ09BTZA2OizhsRoZBzxmW84D6q0zva2jaIZCQg3DMZBdfXZBqgZBSq8h0xyCzfxZAZAXxw4ZAx3zl6UoqHKNP8cLWrjmAUCPx7RFPcSfQT1eQYZBnuZBxo5ZCNYZBqygZDZD"

def post_infographic(image_url, caption="إنفوجرافيك جديد ✨"):
    url = f"https://graph.facebook.com/v23.0/{PAGE_ID}/photos"
    payload = {
        "url": image_url,
        "caption": caption,
        "access_token": PAGE_ACCESS_TOKEN
    }
    response = requests.post(url, data=payload)
    return response.json()

# مثال تشغيل
result = post_infographic("https://example.com/infographic.png", "شوفوا الإنفوجرافيك الجديد 🎉")
print(result)
