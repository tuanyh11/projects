#!/usr/bin/env python3
"""Download homestay images and upload to Payload CMS, then link to rooms."""

import urllib.request
import json
import os
import io
import uuid

BASE_URL = "http://localhost:3000/api"
EMAIL = "vantuanxyz741@gmail.com"
PASSWORD = "123456"
DOWNLOAD_DIR = "/tmp/homestay_images"

def api_json(method, path, data=None, token=None):
    url = BASE_URL + path
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"JWT {token}"
    body = json.dumps(data, ensure_ascii=False).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode("utf-8"))

def download_image(url, filename):
    filepath = os.path.join(DOWNLOAD_DIR, filename)
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        print(f"  ⏭️  Đã có: {filename}")
        return filepath
    print(f"  ⬇️  Đang tải: {filename}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
        with open(filepath, "wb") as f:
            f.write(data)
    size_kb = os.path.getsize(filepath) / 1024
    print(f"  ✅ Tải xong: {filename} ({size_kb:.0f}KB)")
    return filepath

def upload_to_payload(filepath, alt_text, token):
    boundary = f"----Boundary{uuid.uuid4().hex[:12]}"
    filename = os.path.basename(filepath)

    with open(filepath, "rb") as f:
        file_data = f.read()

    # Build multipart body manually
    parts = []

    # _payload field with alt text (this is how Payload CMS expects it)
    payload_data = json.dumps({"alt": alt_text}, ensure_ascii=False)
    parts.append(
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="_payload"\r\n'
        f"Content-Type: application/json\r\n\r\n"
        f"{payload_data}\r\n"
    )

    # File field
    parts.append(
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    )

    # Build final body
    body = b""
    for part in parts:
        body += part.encode("utf-8")
    # Insert file data before the last \r\n
    body = body[:-2]  # Remove last \r\n from file header
    body += b"\r\n" + file_data + b"\r\n"
    body += f"--{boundary}--\r\n".encode("utf-8")

    # Actually, let me rebuild properly
    body = io.BytesIO()

    # _payload part
    body.write(f"--{boundary}\r\n".encode())
    body.write(b'Content-Disposition: form-data; name="_payload"\r\n')
    body.write(b"Content-Type: application/json\r\n\r\n")
    body.write(payload_data.encode("utf-8"))
    body.write(b"\r\n")

    # file part
    body.write(f"--{boundary}\r\n".encode())
    body.write(f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode())
    body.write(b"Content-Type: image/jpeg\r\n\r\n")
    body.write(file_data)
    body.write(b"\r\n")

    # End boundary
    body.write(f"--{boundary}--\r\n".encode())

    url = f"{BASE_URL}/media"
    req = urllib.request.Request(url, data=body.getvalue(), method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    req.add_header("Authorization", f"JWT {token}")

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8")
        return {"error": err[:500]}


# ─── MAIN ───
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# Login
print("🔑 Đăng nhập...")
resp = api_json("POST", "/users/login", {"email": EMAIL, "password": PASSWORD})
token = resp.get("token")
if not token:
    print(f"❌ Login failed"); exit(1)
print("✅ Đã đăng nhập!\n")

# Good Unsplash image URLs (verified working)
room_images = [
    {
        "slug": "nha-san-tre-truc",
        "url": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
        "filename": "nha-san-tre-truc.jpg",
        "alt": "Nhà sàn tre trúc truyền thống view hồ tại Hồng Thái",
    },
    {
        "slug": "phong-ngu-view-ho",
        "url": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
        "filename": "phong-ngu-view-ho.jpg",
        "alt": "Phòng ngủ view hồ tại homestay Hồng Thái",
    },
    {
        "slug": "dorm-phuot-thu",
        "url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
        "filename": "dorm-phuot-thu.jpg",
        "alt": "Dorm giường tầng cho phượt thủ tại Hồng Thái",
    },
    {
        "slug": "bungalow-rung",
        "url": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
        "filename": "bungalow-rung.jpg",
        "alt": "Bungalow rừng giữa thiên nhiên tại Hồng Thái",
    },
]

# Step 1: Download images
print("═══ TẢI ẢNH ═══")
downloaded = {}
for img in room_images:
    try:
        filepath = download_image(img["url"], img["filename"])
        downloaded[img["slug"]] = {"filepath": filepath, "alt": img["alt"]}
    except Exception as e:
        print(f"  ❌ Lỗi tải {img['filename']}: {e}")

# Step 2: Upload to Payload
print("\n═══ UPLOAD ẢNH LÊN PAYLOAD CMS ═══")
media_ids = {}
for slug, info in downloaded.items():
    fname = os.path.basename(info["filepath"])
    print(f"  📤 Uploading: {fname}...")
    result = upload_to_payload(info["filepath"], info["alt"], token)
    if result.get("doc"):
        media_id = result["doc"]["id"]
        media_ids[slug] = media_id
        print(f"  ✅ OK! Media ID: {media_id}, URL: {result['doc'].get('url','?')}")
    else:
        print(f"  ❌ Lỗi: {str(result)[:300]}")

# Step 3: Update rooms
print("\n═══ CẬP NHẬT ROOMS VỚI ẢNH ═══")
rooms_resp = api_json("GET", "/rooms?limit=20", token=token)
for room in rooms_resp.get("docs", []):
    slug = room.get("slug", "")
    if slug in media_ids:
        result = api_json("PATCH", f"/rooms/{room['id']}", {"image": media_ids[slug]}, token)
        if result.get("doc"):
            print(f"  ✅ {room['name']} → ảnh ID {media_ids[slug]}")
        else:
            print(f"  ❌ Lỗi {room['name']}: {str(result)[:200]}")
    else:
        print(f"  ⚠️  Không tìm thấy ảnh cho: {room['name']} (slug: {slug})")

print("\n🎉 Hoàn thành!")
