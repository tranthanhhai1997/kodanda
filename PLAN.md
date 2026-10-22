# Kế hoạch nâng cấp — Bắn Cung Diệt Quỷ → "Rama: Cung Thần Kodanda"

Mục tiêu: nâng game lên ngang chuẩn **RamSetu** (cốt truyện, ảnh minh họa, lưu tiến trình, cửa hàng, quà ngày, thành tựu, đa ngôn ngữ, PWA, chia sẻ) để đón sóng phim *Ramayana* (ra rạp đầu tháng 11/2026 — **cần xác nhận ngày chính thức**).

---

## 1. Hiện trạng (từ `Game Bắn Cung Diệt Quỷ.html`, 1.247 dòng)

| # | Vấn đề | Vị trí | Ảnh hưởng |
|---|---|---|---|
| 1 | Không lưu tiến trình: sao, màn đã mở, xu mất khi tải lại trang | `LEVELS[].stars`, `coins`, `unlocked` (dòng 420–438) | Người chơi không quay lại |
| 2 | Xu không có chỗ tiêu (không cửa hàng/nâng cấp) | `addCoins` (467) | Rewarded "+30 xu" vô nghĩa |
| 3 | Chỉ 6 màn, không cốt truyện, chỉ 1 boss | `LEVELS` (420) | Chơi xong ~15 phút |
| 4 | Toàn bộ hình vẽ bằng canvas + emoji, không có ảnh | `drawRama`, `drawDemon` (1017, 1088) | Kém hấp dẫn so với RamSetu |
| 5 | **Lỗi**: hồi sinh xóa quỷ nhưng không cộng vào `killed` → thanh tiến độ không bao giờ đầy; dòng 945 là code chết | `reviveBtn` (939–953) | Hiển thị sai |
| 6 | Interstitial sau **mọi** màn thắng, kể cả màn 1 | `showWin` (757) | Dễ làm người chơi bỏ game (RamSetu: mỗi 2 màn) |
| 7 | Mục "Mô hình doanh thu quảng cáo" hiển thị cho người chơi | `<section class="info">` (357–369) | Nội dung nội bộ, không nên public |
| 8 | Ngày phim lệch nhau: footer ghi 5/11, RamSetu `FILM.releaseDate` = 08/11 (giả định) | footer (372) | Thông tin không nhất quán |
| 9 | Không i18n, không PWA, không chia sẻ, không đếm ngược phim | — | Khó lan truyền |

Điểm tốt giữ lại: cơ chế kéo–dồn lực–thả, quỹ đạo, tên vàng mỗi phát thứ 5, combo, Ravana bắn cầu lửa có thể bắn vỡ, điều khiển bàn phím.

---

## 2. Kiến trúc mới (giống RamSetu, không cần build)

```
index.html · css/style.css · sw.js · manifest.webmanifest · icons/
js/data.js    — FILM, CHARACTERS, CHAPTERS, LEVELS, BOSSES, ASTRAS, SHOP, ACHIEVEMENTS, ART
js/save.js    — localStorage, khóa `kodanda_save_v1`
js/i18n.js    — vi / en / hi
js/audio.js   — SFX + nhạc nền WebAudio (tái dùng từ RamSetu)
js/game.js    — engine bắn cung (tách từ file hiện tại)
js/ui.js      — menu, bản đồ chương, hội thoại, cửa hàng, quà ngày, chia sẻ
img/          — ảnh WebP · docs/art-prompts.md — prompt tạo ảnh
```
File gốc giữ nguyên như RamSetu.

---

## 3. Nội dung & gameplay

### 3.1 Cốt truyện 3 chương × 5 màn (màn 5 mỗi chương là boss)
| Chương | Bối cảnh | Boss | Cơ chế boss |
|---|---|---|---|
| I · Khu rừng đạo sĩ | Bảo vệ lễ tế của đạo sĩ Vishwamitra | **Tataka** | Ném đá tảng; bắn vỡ đá giữa trời |
| II · Rừng Panchavati | Sita bị bắt cóc | **Maricha – nai vàng** | Phân thân ảo ảnh, chỉ 1 con thật |
| III · Chiến trường Lanka | Giải cứu Sita | **Kumbhakarna** → **Ravana mười đầu** | Ravana: bắn từng đầu, đầu mọc lại nếu chậm; kết liễu bằng Brahmastra |

- Hội thoại trước màn bằng chân dung (tái dùng `img/portraits/` của RamSetu: rama, lakshmana, hanuman, sita, ravana, kumbhakarna, vibhishana, narrator).
- Kết thúc chương III: lời mời ra rạp xem phim + nút chia sẻ.

### 3.2 Quỷ mới (thêm vào 4 loại hiện có)
- **Quỷ khiên**: chặn tên bắn thẳng → phải bắn vòng cầu từ trên xuống.
- **Quỷ phân thân**: chết tách thành 2 quỷ nhỏ.
- **Pháp sư Rakshasa**: hồi máu cho quỷ xung quanh — ưu tiên hạ trước.

### 3.3 Thần tiễn (Astra) — kỹ năng nạp bằng combo
| Astra | Hiệu ứng | Mở khóa |
|---|---|---|
| Agneyastra | Mưa tên lửa toàn màn hình | Chương I |
| Varunastra | Sóng nước đẩy lùi toàn bộ quỷ mặt đất | Chương II |
| Vayavyastra | Gió quét sạch quỷ bay | Chương II |
| Brahmastra | Đòn kết liễu boss | Chương III |

### 3.4 Cảm giác bắn ("juice")
- **Thả chuẩn**: thả tay đúng đỉnh lực → tên phát sáng, ×1,5 sát thương.
- **Headshot** (trúng nửa trên quỷ) → chí mạng, số sát thương nổi.
- Hit-stop 40 ms khi hạ quỷ giáp, slow-motion khi hạ boss, vệt tên, rung màn hình tinh chỉnh.

---

## 4. Giao diện & hình ảnh

- **Phong cách**: hoàng gia Ấn Độ — khung viền vàng, hoa văn mandala, nền chàm/đỏ son, đồng bộ với RamSetu để thành "vũ trụ game Ramayana".
- **Màn hình chính**: ảnh chủ đạo Rama giương cung + đồng hồ đếm ngược ngày phim + nút "Chơi ngay" lớn.
- **Bản đồ chương** thay lưới màn: đường đi qua rừng → Panchavati → Lanka, sao hiển thị trên từng điểm.
- **Sprite mới cần tạo** (prompt viết vào `docs/art-prompts.md`, cùng quy trình ChatGPT như RamSetu):
  - Rama 3 tư thế (đứng, kéo cung, thả) + 3 trang phục.
  - 7 loại quỷ thường + 4 boss.
  - Nền parallax 3 lớp × 6 bối cảnh (rừng bình minh, sông Sarayu, Panchavati, đèo, biển đêm, Lanka rực lửa).
- **Tái dùng ngay từ RamSetu**: chân dung, `rakshasa*.webp`, `fireball.webp`, `frame.webp`, `emblem.webp`, icon xu/quà/cúp.
- Mobile: toàn màn hình ngang, nhắc xoay máy, vùng an toàn tai thỏ; HUD lớn hơn cho ngón tay.
- Chuyển mục "Mô hình doanh thu" sang `docs/`.

---

## 5. Giữ chân & lan truyền

- **Cửa hàng**: nâng cấp cung (sát thương, tốc độ dồn lực, +1 sinh lực, ngắm dài hơn), trang phục Rama, kiểu mũi tên.
- **Quà 7 ngày**, **15 thành tựu**, **thẻ nhân vật** sưu tập (giống RamSetu).
- **Chế độ Vô tận** "Bảo vệ Ayodhya" + **Thử thách ngày** (seed theo ngày, ai cũng cùng đề).
- **Chia sẻ**: ảnh kết quả có điểm + hashtag `#KodandaChallenge`; liên kết chéo sang RamSetu và Hanuman Bay Qua Biển.

### Quảng cáo (vẫn mô phỏng, chỉnh lại nhịp)
- Interstitial: mỗi 2 màn thắng, bỏ qua màn 1–2.
- Rewarded: hồi sinh (1 lần/màn), nhân đôi xu, nhận 1 Astra miễn phí, quà ngày ×2.

---

## 6. Lộ trình

| Giai đoạn | Nội dung | Ước tính | Điều kiện hoàn thành |
|---|---|---|---|
| **P0 – Nền tảng** ✅ 22/10 | Tách file theo kiến trúc mới, lưu tiến trình, sửa lỗi hồi sinh, nhịp interstitial, gỡ mục doanh thu | 0,5 ngày | Tải lại trang vẫn giữ sao/xu; chơi hết 6 màn cũ không lỗi |
| **P1 – Nội dung** ✅ 22/10 | 15 màn, hội thoại, 3 quỷ mới, 4 boss, 4 Astra, thả chuẩn/headshot | 1,5 ngày | Chơi xuyên 3 chương, boss có cơ chế riêng |
| **P2 – Hình ảnh** ✅ 22/10 (đã gắn bộ ảnh mới) | Viết prompt → nhận ảnh → gắn qua `ART`, menu mới, bản đồ chương, đếm ngược | 1–2 ngày (phụ thuộc tốc độ tạo ảnh) | Không còn nhân vật vẽ bằng hình khối/emoji |
| **P3 – Meta** ✅ 22/10 | Cửa hàng, quà ngày, thành tựu, thẻ, Vô tận, Thử thách ngày, chia sẻ | 1 ngày | Mọi nguồn xu đều có chỗ tiêu |
| **P4 – Phát hành** ✅ 22/10 (chờ đưa lên GitHub Pages) | i18n vi/en/hi, PWA, kiểm thử mobile, GitHub Pages | 0,5 ngày | Lighthouse PWA đạt, chạy offline |

Tổng ≈ **5 ngày làm việc** → kịp phát hành trước ngày phim nếu bắt đầu ngay. Nếu thiếu thời gian: phát hành P0 + P1 + P3 với ảnh tái dùng từ RamSetu, bổ sung P2 sau.

---

## 7. Cần xác nhận
1. Ngày công chiếu chính thức tại thị trường mục tiêu (5/11 hay 08/11?).
2. Có tái dùng ảnh RamSetu không (đề xuất: có).
3. Tạo ảnh mới qua ChatGPT theo quy trình `docs/art-prompts.md` như RamSetu?
4. Tên & URL phát hành (đề xuất repo GitHub Pages `kodanda`).
5. Rủi ro bản quyền: không dùng logo, tên diễn viên, nhạc hay tạo hình của phim.
