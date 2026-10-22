# Prompt tạo ảnh — Bắn Cung Diệt Quỷ

Cùng quy trình với RamSetu (`../RamSetu/docs/art-prompts.md`): mở **một** cuộc trò chuyện ChatGPT cho cả bộ ảnh, tạo ảnh đầu tiên trước, các ảnh sau thêm câu `Same art style, lighting and framing as the previous image.` Tải PNG, **đặt tên đúng mã** rồi gửi lại — tôi sẽ cắt nền, chuyển WebP và khai báo trong `ART` (`js/data.js`). Chưa có ảnh thì game tự vẽ bằng code, không lỗi.

> Không yêu cầu giống diễn viên hay tạo hình của bất kỳ bộ phim nào (bản quyền). Ảnh RamSetu đã tái dùng: chân dung, `rakshasa.webp` (quỷ đất), `rakshasa-boss.webp` (quỷ giáp, Kumbhakarna), `fireball.webp`, `keyart.webp`, `emblem.webp`.

**Phần mở đầu chung cho mọi sprite** (dán trước mô tả từng ảnh):
```
Full-body 2D game sprite, side view facing LEFT, standing on an invisible ground line at the bottom edge, centered. Stylized illustration for a mobile game, traditional Indian painting blended with modern cartoon style: clean bold outlines, soft cel shading, rich saffron, gold, crimson and indigo palette. Transparent background, no text, no shadow on the ground, no frame. Original design — must not resemble any real actor or any film's character design. Family-friendly.
```

## A. Rama cung thủ (ưu tiên cao nhất)
| Mã file | Mô tả thêm |
|---|---|
| `rama_idle.png` | Prince Rama of Ayodhya, blue-tinged skin, golden crown, yellow silk dhoti, quiver on back, holding the great bow Kodanda relaxed at his side. **Facing RIGHT** (Rama đứng bên trái màn hình). |
| `rama_draw.png` | Same Rama, **facing RIGHT**, bow raised horizontally, string fully drawn to the cheek with a glowing arrow nocked. |
| `rama_release.png` | Same Rama, **facing RIGHT**, string just released, arm extended forward, slight motion lines on the string only. |

Trang phục khác (tùy chọn, cùng 3 tư thế): `vanvas` áo vỏ cây lưu đày, `royal` lam ngọc, `victory` bạch kim.

## B. Quỷ thường
| Mã file | Mô tả thêm |
|---|---|
| `demon_fly.png` | Green-skinned winged rakshasa with bat wings spread, flying pose, small horns, red eyes. |
| `demon_fast.png` | Small lean orange rakshasa sprinting, leaning forward, claws out. |
| `demon_shield.png` | Olive-skinned rakshasa holding a huge round bronze shield with a gold rim in FRONT of his body (on the left side). |
| `demon_splitter.png` | Purple rakshasa whose body glows with a bright crack down the middle, as if about to split in two. |
| `demon_shaman.png` | Teal-skinned rakshasa sorcerer with a wooden staff topped by a glowing green orb, ragged robe, bone necklace. |

## C. Boss (cao hơn, chi tiết hơn)
| Mã file | Mô tả thêm |
|---|---|
| `boss_tataka.png` | Giant demoness Tataka, wild black hair, bone ornaments, lifting a big boulder over her head. Fearsome but not gory. |
| `boss_maricha.png` | A magical golden deer with silver spots and jewel-like antlers, mid-leap, faint golden sparkles around it. |
| `boss_ravana.png` | Demon king Ravana with ten crowned heads arranged in a wide arc (5 on each side of the main head), golden armor, dark wings, holding a sword. Facing the viewer slightly left. |

## D. Nền (960×540, không nhân vật)
`bg_dawn`, `bg_day`, `bg_dusk`, `bg_sunset`, `bg_night`, `bg_storm`, `bg_lanka` — mô tả chung:
```
Wide 16:9 side-scrolling game background, 2D painted illustration, traditional Indian art meets modern cartoon. Flat ground band across the bottom 13% of the image left empty for gameplay. No characters, no text.
```
Thêm theo bối cảnh: rừng đạo sĩ có đền nhỏ (dawn/day), rừng Panchavati bên sông Godavari với túp lều (dusk/night), thành Lanka vàng bên biển (sunset/storm), Lanka bốc cháy về đêm (lanka).

---

# Đợt 2 — thêm nhân vật & ảnh bìa (✅ đã gắn 22/10: quỷ đất ×3, quỷ giáp, Kumbhakarna, Lakshmana trợ chiến, ảnh bìa)

Đợt 1 đã gắn vào game (`img/sprites/`, `img/bg/`). Hiện **quỷ đất, quỷ giáp và Kumbhakarna** vẫn dùng ảnh tạm từ RamSetu (phong cách hơi khác) — game đang tạm đổi màu ngẫu nhiên để đỡ trùng lặp. Nên tạo thêm các ảnh dưới đây, **cùng cuộc trò chuyện ChatGPT đã tạo đợt 1** để giữ phong cách.

Dùng lại **phần mở đầu chung** ở trên (full-body, side view **facing LEFT**, nền trong suốt). Kích thước tối thiểu 1024 px chiều cao.

| Mã file | Mô tả thêm | Dùng cho |
|---|---|---|
| `demon_ground_1.png` | Stocky purple-skinned rakshasa foot soldier with small horns, wild hair, red-gold loincloth, swinging a spiked club, walking forward aggressively. | Quỷ đất (biến thể 1) |
| `demon_ground_2.png` | Lean dark-green rakshasa with tusks, bone necklace, holding a curved sword and a torn red banner, mid-stride. | Quỷ đất (biến thể 2) |
| `demon_ground_3.png` | Hulking red-skinned rakshasa with one broken horn, bare chest with tribal gold armbands, fists raised, roaring. | Quỷ đất (biến thể 3) |
| `demon_armor.png` | Rakshasa warrior in heavy black-and-gold plate armor with a horned helmet covering the face, carrying a big trident, slow heavy stance. | Quỷ giáp (chịu 3 phát) |
| `boss_kumbhakarna.png` | The giant Kumbhakarna: enormous, round-bellied, dark-grey skin, sleepy half-closed eyes turning angry, golden crown, huge iron mace on his shoulder, chains and gold jewelry. Gentle-giant proportions, not gory. | Boss màn 13 |
| `ally_lakshmana.png` *(tùy chọn)* | Prince Lakshmana, fair skin, golden crown, red-orange dhoti, holding a bow, **facing RIGHT**, kneeling and aiming. | Dự kiến: đồng minh hỗ trợ |

## Ảnh bìa (thay ảnh ghép tạm `img/ui/cover.webp`)
```
Epic 16:9 key art for a mobile archery game based on the Ramayana, 1920×1080, painted illustration in the same style as the previous images. On the LEFT: Prince Rama (blue-tinged skin, golden crown, yellow dhoti) drawing the great bow Kodanda with a glowing golden arrow, heroic low angle. On the RIGHT: the ten-headed demon king Ravana with golden armor and dark wings, towering and menacing. Between them in the background: the golden city of Lanka at sunset over a stormy sea, a horde of rakshasas charging. Keep the CENTER of the image relatively calm (a game menu panel will sit there). Dramatic rim lighting, saffron-gold and crimson palette. No text, no logo. Original design — must not resemble any real actor or film. Family-friendly.
```

Gửi lại PNG đúng tên file — tôi sẽ chuyển WebP, khai báo `srcs` cho quỷ đất (chọn ngẫu nhiên 3 ảnh) và thay ảnh bìa.
