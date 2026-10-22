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
