#!/usr/bin/env python3
"""Seed data script for Hồng Thái website - Payload CMS REST API"""

import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://localhost:3000/api"
EMAIL = "vantuanxyz741@gmail.com"
PASSWORD = "123456"

def api_request(method, path, data=None, token=None):
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
        resp_body = e.read().decode("utf-8")
        try:
            return json.loads(resp_body)
        except:
            return {"error": resp_body[:200]}

# ─── LOGIN ───
print("🔑 Đăng nhập...")
resp = api_request("POST", "/users/login", {"email": EMAIL, "password": PASSWORD})
token = resp.get("token")
if not token:
    print(f"❌ Login failed: {resp}")
    sys.exit(1)
print(f"✅ Đã đăng nhập!")

# ─── CHECK EXISTING ───
existing_dest = api_request("GET", "/destinations?limit=50", token=token)
existing_slugs_dest = {d["slug"] for d in existing_dest.get("docs", [])}
print(f"\n📍 Destinations hiện có: {len(existing_slugs_dest)} ({', '.join(existing_slugs_dest) or 'chưa có'})")

existing_rooms = api_request("GET", "/rooms?limit=50", token=token)
existing_slugs_rooms = {r["slug"] for r in existing_rooms.get("docs", []) if r.get("slug")}
print(f"🏡 Rooms hiện có: {len(existing_slugs_rooms)}")

existing_posts = api_request("GET", "/posts?limit=50", token=token)
existing_slugs_posts = {p["slug"] for p in existing_posts.get("docs", []) if p.get("slug")}
print(f"📝 Posts hiện có: {len(existing_slugs_posts)}")

# ═══════════════════════════════════════════
# DESTINATIONS
# ═══════════════════════════════════════════
destinations = [
    {
        "name": "Thác Khuổi Nhi",
        "slug": "thac-khuoi-nhi",
        "description": "Thác nước hùng vĩ giữa rừng nguyên sinh Na Hang, nơi dòng nước trắng xoá đổ xuống từ độ cao 30m tạo nên khung cảnh hoang sơ tuyệt đẹp. Âm thanh của thác nước cùng không khí trong lành của rừng già mang lại cảm giác bình yên hiếm có.",
        "tag": "Phiêu lưu",
        "emoji": "💦",
        "gradient": "from-cyan-500 to-blue-600",
        "highlights": [
            {"text": "Thác nước cao 30m giữa rừng nguyên sinh"},
            {"text": "Bơi lội và picnic ven thác"},
            {"text": "Trekking 2km xuyên rừng"},
            {"text": "Chụp ảnh cực đẹp mùa nước lớn"},
        ],
        "order": 1,
        "isActive": True,
    },
    {
        "name": "Hồ Na Hang",
        "slug": "ho-na-hang",
        "description": "Hồ thủy điện Na Hang rộng lớn với hàng nghìn đảo nhỏ mọc lên giữa mặt nước trong xanh, được ví như 'Hạ Long cạn' của Tuyên Quang. Du thuyền ngắm cảnh, câu cá và khám phá các bản làng ven hồ là những trải nghiệm không thể bỏ lỡ.",
        "tag": "Trên hồ",
        "emoji": "🌊",
        "gradient": "from-cyan-500 to-blue-600",
        "highlights": [
            {"text": "Hàng nghìn đảo nhỏ trên hồ rộng lớn"},
            {"text": "Du thuyền ngắm hoàng hôn tuyệt đẹp"},
            {"text": "Câu cá và ăn cá tươi tại chỗ"},
            {"text": "Khám phá bản làng dân tộc ven hồ"},
        ],
        "order": 2,
        "isActive": True,
    },
    {
        "name": "Rừng Nguyên Sinh Na Hang",
        "slug": "rung-nguyen-sinh-na-hang",
        "description": "Khu bảo tồn thiên nhiên Na Hang rộng hơn 22.000 ha với nhiều loài động thực vật quý hiếm. Đây là nơi sinh sống của nhiều loài linh trưởng như voọc đen má trắng — một trong những loài linh trưởng quý hiếm nhất Việt Nam.",
        "tag": "Thiên nhiên",
        "emoji": "🌳",
        "gradient": "from-emerald-500 to-green-700",
        "highlights": [
            {"text": "Khu bảo tồn thiên nhiên 22.000 ha"},
            {"text": "Ngắm voọc đen má trắng - đặc hữu Việt Nam"},
            {"text": "Trekking khám phá rừng nguyên sinh"},
            {"text": "Ngủ đêm dưới tán rừng cùng chim muông"},
        ],
        "order": 3,
        "isActive": True,
    },
    {
        "name": "Bản Nà Tông",
        "slug": "ban-na-tong",
        "description": "Bản làng người Tày bình yên nằm ven hồ Na Hang, nơi vẫn còn lưu giữ những nét văn hoá truyền thống như nghề dệt thổ cẩm, múa Then và lễ hội Lồng Tồng đặc sắc. Thưởng thức cơm lam, thịt trâu gác bếp và uống rượu ngô cùng bà con dân bản.",
        "tag": "Văn hoá",
        "emoji": "🏘️",
        "gradient": "from-amber-400 to-yellow-600",
        "highlights": [
            {"text": "Trải nghiệm cuộc sống người Tày bản địa"},
            {"text": "Học dệt thổ cẩm thủ công"},
            {"text": "Thưởng thức ẩm thực đặc sản bản làng"},
            {"text": "Tham gia lễ hội Lồng Tồng truyền thống"},
        ],
        "order": 4,
        "isActive": True,
    },
]

print("\n═══ TẠO DESTINATIONS ═══")
for dest in destinations:
    if dest["slug"] in existing_slugs_dest:
        print(f"⏭️  Bỏ qua '{dest['name']}' (đã tồn tại)")
        continue
    result = api_request("POST", "/destinations", dest, token)
    if result.get("doc"):
        print(f"✅ Đã tạo: {result['doc']['name']} (ID: {result['doc']['id']})")
    else:
        print(f"❌ Lỗi '{dest['name']}': {result.get('errors', result)[:200]}")

# ═══════════════════════════════════════════
# ROOMS / HOMESTAYS
# ═══════════════════════════════════════════
rooms = [
    {
        "name": "Nhà Sàn Tre Trúc",
        "slug": "nha-san-tre-truc",
        "type": "nha-san",
        "description": "Ngôi nhà sàn truyền thống dựng bằng tre trúc và gỗ tự nhiên, view trực tiếp ra hồ Na Hang. Không gian rộng rãi, thoáng mát với sàn gỗ ấm áp, giường chiếu dát thấp truyền thống và bộ bàn ghế tre thủ công. Ban công rộng để ngắm mặt hồ bình minh và hoàng hôn.",
        "price": 650000,
        "priceUnit": "đêm/phòng",
        "capacity": "2-4 người",
        "amenities": [
            {"name": "WiFi tốc độ cao"},
            {"name": "Điều hoà 2 chiều"},
            {"name": "View hồ trực tiếp"},
            {"name": "Ban công riêng"},
            {"name": "Bữa sáng kiểu Tày"},
            {"name": "Võng tre thư giãn"},
        ],
        "highlight": "Được yêu thích nhất",
        "highlightColor": "bg-amber-500",
        "emoji": "🏡",
        "bookingLink": "https://m.me/hongthai.nahang",
        "order": 1,
        "isAvailable": True,
    },
    {
        "name": "Phòng Ngủ View Hồ",
        "slug": "phong-ngu-view-ho",
        "type": "phong-rieng",
        "description": "Phòng ngủ hiện đại kết hợp chất liệu gỗ tự nhiên và đá núi, cửa kính toàn diện hướng thẳng ra mặt hồ Na Hang. Giường đôi êm ái với ga trải thơm mùi thảo mộc rừng, phòng tắm vách kính tràn ánh sáng tự nhiên.",
        "price": 480000,
        "priceUnit": "đêm/phòng",
        "capacity": "1-2 người",
        "amenities": [
            {"name": "Cửa kính view hồ"},
            {"name": "Giường đôi cao cấp"},
            {"name": "Phòng tắm riêng"},
            {"name": "Điều hoà"},
            {"name": "TV 43 inch"},
            {"name": "Minibar đồ uống"},
        ],
        "highlight": "View đẹp nhất",
        "highlightColor": "bg-sky-500",
        "emoji": "🛏️",
        "bookingLink": "https://m.me/hongthai.nahang",
        "order": 2,
        "isAvailable": True,
    },
    {
        "name": "Dorm Phượt Thủ",
        "slug": "dorm-phuot-thu",
        "type": "dorm",
        "description": "Giường tầng kiểu dorm dành cho các bạn trẻ phượt thủ và sinh viên. Phòng sạch sẽ với 6 giường tầng, tủ cá nhân có khoá, nhà vệ sinh chung sạch sẽ. Không gian cởi mở để giao lưu cùng những người bạn đồng hành mới.",
        "price": 150000,
        "priceUnit": "đêm/giường",
        "capacity": "6 giường/phòng",
        "amenities": [
            {"name": "WiFi"},
            {"name": "Tủ cá nhân có khoá"},
            {"name": "Nhà tắm chung sạch sẽ"},
            {"name": "Khu vực bếp dùng chung"},
            {"name": "Máy giặt tự phục vụ"},
        ],
        "highlight": "Tiết kiệm nhất",
        "highlightColor": "bg-green-600",
        "emoji": "🎒",
        "bookingLink": "https://m.me/hongthai.nahang",
        "order": 3,
        "isAvailable": True,
    },
    {
        "name": "Bungalow Rừng",
        "slug": "bungalow-rung",
        "type": "bungalow",
        "description": "Căn bungalow biệt lập giữa vườn cây xanh mát, bao quanh bởi tiếng chim hót và hương thơm của hoa rừng. Thiết kế mở với cửa gỗ chắc chắn, bồn tắm ngoài trời nhìn ra vườn và bếp nướng BBQ riêng.",
        "price": 850000,
        "priceUnit": "đêm/căn",
        "capacity": "2-3 người",
        "amenities": [
            {"name": "Bồn tắm ngoài trời"},
            {"name": "Bếp BBQ riêng"},
            {"name": "Vườn riêng tư"},
            {"name": "Hamock thư giãn"},
            {"name": "Lò sưởi mùa đông"},
            {"name": "Bữa sáng phục vụ tại phòng"},
        ],
        "highlight": "Cao cấp & thiên nhiên",
        "highlightColor": "bg-primary",
        "emoji": "🌄",
        "bookingLink": "https://m.me/hongthai.nahang",
        "order": 4,
        "isAvailable": True,
    },
]

print("\n═══ TẠO ROOMS/HOMESTAYS ═══")
for room in rooms:
    if room["slug"] in existing_slugs_rooms:
        print(f"⏭️  Bỏ qua '{room['name']}' (đã tồn tại)")
        continue
    result = api_request("POST", "/rooms", room, token)
    if result.get("doc"):
        print(f"✅ Đã tạo: {result['doc']['name']} (ID: {result['doc']['id']})")
    else:
        print(f"❌ Lỗi '{room['name']}': {str(result)[:300]}")

# ═══════════════════════════════════════════
# BLOG POSTS
# ═══════════════════════════════════════════
def make_richtext(paragraphs):
    """Create basic Lexical JSON for rich text content"""
    children = []
    for para in paragraphs:
        if para.strip():
            children.append({
                "children": [{"detail": 0, "format": 0, "mode": "normal", "style": "", "text": para.strip(), "type": "text", "version": 1}],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
            })
    return {
        "root": {
            "children": children,
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "root",
            "version": 1,
        }
    }

posts = [
    {
        "title": "Một ngày khám phá Thác Khuổi Nhi — Viên ngọc hoang sơ giữa rừng Na Hang",
        "slug": "mot-ngay-kham-pha-thac-khuoi-nhi",
        "status": "published",
        "publishDate": "2026-02-15T00:00:00.000Z",
        "excerpt": "Chúng tôi đặt chân đến Thác Khuổi Nhi lúc sáng sớm, khi những tia nắng đầu tiên còn chưa xuyên qua tán rừng. Tiếng thác đổ từ xa vọng lại như một bản nhạc thiên nhiên dẫn đường cho bước chân phượt thủ...",
        "content": make_richtext([
            "Chúng tôi đặt chân đến Thác Khuổi Nhi lúc sáng sớm, khi những tia nắng đầu tiên còn chưa xuyên qua tán rừng già Na Hang. Tiếng thác đổ từ xa vọng lại như một bản nhạc thiên nhiên dẫn đường cho những bước chân háo hức.",
            "Con đường trekking dài 2km xuyên qua rừng nguyên sinh không quá khó nhưng đủ để khiến mọi người đổ mồ hôi và cảm nhận trọn vẹn hơi thở của đại ngàn. Hai bên đường là những cây cổ thụ cao vút, rễ cây ngoằn ngoèo bám vào đá, và những dải dương xỉ xanh mướt phủ kín lối đi.",
            "Khi thác hiện ra trước mắt, tất cả mọi người đều ồ lên thích thú. Dòng nước trắng xoá đổ xuống từ độ cao gần 30 mét, tung bọt trắng và tạo ra làn sương mịn mát lạnh. Hồ nước bên dưới xanh trong vắt, nhìn rõ từng viên đá cuội dưới đáy.",
            "Chúng tôi nghỉ ngơi, bơi lội và thưởng thức bữa picnic giản dị ngay cạnh thác. Cơm nắm muối vừng, thịt gà luộc và trái cây rừng — đơn giản nhưng khó có thể ngon hơn khi được ăn giữa khung cảnh thiên nhiên hùng vĩ như thế này.",
        ]),
    },
    {
        "title": "Du thuyền hoàng hôn trên Hồ Na Hang — Khoảnh khắc thiên đường",
        "slug": "du-thuyen-hoang-hon-tren-ho-na-hang",
        "status": "published",
        "publishDate": "2026-02-20T00:00:00.000Z",
        "excerpt": "Mặt trời dần khuất sau những ngọn núi đá vôi, nhuộm vàng cả mặt hồ rộng lớn. Chiếc thuyền gỗ nhỏ trôi nhẹ giữa hàng trăm hòn đảo xanh mướt — đây là khoảnh khắc mà máy ảnh khó có thể lột tả hết vẻ đẹp...",
        "content": make_richtext([
            "Hồ Na Hang không chỉ đẹp vào ban ngày — buổi hoàng hôn trên hồ mới thực sự là trải nghiệm đáng nhớ nhất chuyến đi.",
            "Chúng tôi thuê thuyền gỗ từ bến Năng Khả lúc 4 giờ chiều, khi nắng đã dịu hơn và mặt hồ bắt đầu chuyển sang màu vàng nhạt. Bác thuyền trưởng người Tày tên Hùng dẫn chúng tôi luồn lách qua những eo hồ hẹp, nơi vách đá hai bên dựng đứng như bức tường thiên nhiên uy nghi.",
            "Khi mặt trời chạm đỉnh núi phía Tây, toàn bộ mặt hồ bỗng như bừng sáng với muôn màu cam, vàng, tím pha lẫn vào nhau. Tiếng chèo thuyền khẽ động nước, tiếng chim trở về tổ văng vẳng từ các hòn đảo nhỏ — tất cả hoà quyện tạo nên một khung cảnh bình yên đến nao lòng.",
            "Bác Hùng kể, vào mùa nước lớn (tháng 6-8), hồ đẹp nhất vì nước dâng cao phủ các bụi cây ven bờ, tạo ra những con kênh xanh mướt dẫn đến các bản làng ẩn mình trong sương khói.",
        ]),
    },
    {
        "title": "Khám phá ẩm thực Tày tại Hồng Thái — Hành trình qua vị giác",
        "slug": "kham-pha-am-thuc-tay-tai-hong-thai",
        "status": "published",
        "publishDate": "2026-02-25T00:00:00.000Z",
        "excerpt": "Người Tày Na Hang có một kho tàng ẩm thực phong phú mà không phải du khách nào cũng biết tới. Từ cơm lam nướng trên than hồng, thịt trâu gác bếp hun khói đến bát canh lá rừng thơm lừng...",
        "content": make_richtext([
            "Ẩm thực là một phần không thể tách rời của văn hoá người Tày tại Na Hang. Mỗi món ăn là một câu chuyện về đất đai, mùa vụ và tình người bản địa.",
            "Cơm lam là món đầu tiên chúng tôi thử. Gạo nương loại đặc sản của người Tày được nhét vào ống tre non còn xanh, nút lại bằng lá chuối rồi nướng trực tiếp trên than hồng khoảng 45 phút. Khi bóc lớp tre ra, hạt cơm trắng ngần thơm mùi tre tươi và mang vị ngọt tự nhiên không cần thêm gia vị.",
            "Thịt trâu gác bếp là món khiến cả nhóm gật gù nhất. Thịt trâu được tẩm ướp với mắc khén — loại hạt tiêu rừng đặc sản của người Tày — cùng gừng, tỏi rừng và muối. Sau đó thịt được treo lên gác bếp hun khói tự nhiên trong nhiều tuần. Miếng thịt có màu nâu sẫm đẹp mắt, khi ăn dai dai, đậm đà và thơm phức mùi khói bếp.",
            "Bữa tối tại nhà bà Mến — một nghệ nhân ẩm thực người Tày lâu năm — là trải nghiệm trọn vẹn nhất. Mâm cơm với 8 món đặc sản được bày biện giản dị nhưng đầy đủ, kèm theo chum rượu ngô ủ từ ngô nương 6 tháng. 'Ăn cùng nhau mới ngon' — bà Mến nói bằng tiếng Kinh lơ lớ giọng vùng cao, và đó là sự thật.",
        ]),
    },
]

print("\n═══ TẠO BLOG POSTS ═══")
for post in posts:
    if post["slug"] in existing_slugs_posts:
        print(f"⏭️  Bỏ qua '{post['title'][:50]}...' (đã tồn tại)")
        continue
    result = api_request("POST", "/posts", post, token)
    if result.get("doc"):
        print(f"✅ Đã tạo: {result['doc']['title'][:60]}... (ID: {result['doc']['id']})")
    else:
        print(f"❌ Lỗi '{post['title'][:40]}': {str(result)[:300]}")

print("\n🎉 Hoàn thành! Kiểm tra dữ liệu:")
r1 = api_request("GET", "/destinations?limit=10", token=token)
r2 = api_request("GET", "/rooms?limit=10", token=token)
r3 = api_request("GET", "/posts?limit=10", token=token)
print(f"  📍 Destinations: {r1.get('totalDocs', '?')} mục")
print(f"  🏡 Rooms: {r2.get('totalDocs', '?')} mục")
print(f"  📝 Posts: {r3.get('totalDocs', '?')} mục")
