# Bắn Cung Diệt Quỷ

### ▶ [Chơi ngay: tranthanhhai1997.github.io/kodanda](https://tranthanhhai1997.github.io/kodanda/)

[![Bắn Cung Diệt Quỷ — chơi ngay](img/ui/og-kodanda.jpg)](https://tranthanhhai1997.github.io/kodanda/)

Game trình duyệt bắn cung theo sử thi Ramayana — cùng Rama và cây cung thần Kodanda diệt quỷ Rakshasa. Chạy trên máy tính và điện thoại, cài được như ứng dụng (PWA), chơi offline, hỗ trợ Tiếng Việt / English / हिन्दी. Cùng vũ trụ với [Xây Cầu Ram Setu](https://tranthanhhai1997.github.io/ram-setu/).

- **15 màn cốt truyện** qua 3 chương, hội thoại cùng Rama, Lakshmana, Sita, Hanuman, Vibhishana, Ravana…
- **4 boss**: Tataka ném đá tảng · nai vàng Maricha phân thân ảo ảnh · Kumbhakarna dậm đất · Ravana mười đầu mọc lại
- **4 thần tiễn** (Agneyastra, Varunastra, Vayavyastra, Brahmastra), phát bắn hoàn hảo & chí mạng
- **Vô tận**, **Thử thách ngày**, cửa hàng nâng cấp cung / trang phục / Lakshmana trợ chiến, 17 thành tựu, 9 thẻ nhân vật
- **Điều khiển:** kéo / chạm giữ để ngắm và dồn lực, thả để bắn · bàn phím: `↑` `↓` chỉnh góc, giữ `Space` dồn lực, `1`–`4` thần tiễn, `P` tạm dừng

## Chạy trên máy

Không cần build — chạy bằng server tĩnh bất kỳ:

```bash
python3 -m http.server 8766
```

Mở `http://localhost:8766/`. File gốc được giữ nguyên: `Game Bắn Cung Diệt Quỷ.html`. Kế hoạch nâng cấp: `PLAN.md`.

> **Tiếp tục dự án trên máy khác:** đọc [`NOTES.md`](NOTES.md) (trạng thái, ID AdMob, cách build app Android, việc tiếp theo).

## Cấu trúc

| File | Nội dung |
|---|---|
| `index.html` | Bố cục trang, các lớp phủ (menu, thắng/thua, tạm dừng, quảng cáo) |
| `css/style.css` | Giao diện |
| `js/data.js` | **Toàn bộ nội dung & cân bằng**: độ khó, nhân vật hội thoại, 3 chương, 15 màn + cốt truyện, 4 boss, 4 thần tiễn (Astra), bầu trời |
| `js/i18n.js` | Đa ngôn ngữ vi / en / hi: chuỗi giao diện (`STR`) + bản dịch nội dung (`CONTENT`) |
| `js/save.js` | Lưu tiến trình (localStorage, khóa `kodanda_save_v1`): xu, màn đã mở, sao, hội thoại đã xem, độ khó, âm thanh, thống kê |
| `js/platform.js` | Web hay app native (Capacitor): rung, chia sẻ, nút Back, **AdMob** (interstitial + rewarded, đồng ý GDPR) |
| `js/audio.js` | Âm thanh tổng hợp bằng WebAudio (vang, chuông, gảy dây, tabla) + nhạc nền tanpura |
| `js/game.js` | Engine: sinh quỷ, AI boss, thần tiễn, bắn tên (hoàn hảo / chí mạng), va chạm, vẽ canvas, điều khiển |
| `js/ui.js` | HUD, thanh Astra, hội thoại, menu theo chương, luồng màn, quảng cáo (AdMob trong app, quảng cáo chéo Ram Setu trên web) |
| `js/meta.js` | Cửa hàng, quà ngày, thành tựu, thẻ nhân vật, Vô tận, Thử thách ngày, chia sẻ, toàn màn hình |
| `img/portraits/`, `img/ui/` | Ảnh tái dùng từ RamSetu: chân dung (hội thoại, thẻ), quỷ, cầu lửa, ảnh chủ đạo, huy hiệu |
| `img/sprites/`, `img/bg/` | Ảnh Rama, quỷ, boss, 7 nền (WebP, chuyển từ `img/ramayana_sprite_pack/` — PNG gốc không đưa lên máy chủ) |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA: cài lên màn hình chính, chơi offline |
| `docs/art-prompts.md` | Prompt tạo ảnh (dùng khi cần thêm ảnh mới) |
| `app/` | Bản app Android (Capacitor 8): project Android, script build APK/AAB, icon & splash |
| `css/fonts.css`, `fonts/` | Font lưu kèm game (chạy offline, dùng trong app) |
| `privacy.html` | Chính sách bảo mật (bắt buộc cho AdMob / Google Play) |
| `docs/playtest-bot.js` | Bot chơi thử tự động 15 màn + Vô tận + Thử thách ngày |
| `docs/monetization.md` | Mô hình doanh thu quảng cáo (nội bộ, không hiển thị cho người chơi) |

## Quảng cáo

- App Android: AdMob thật (`js/platform.js`); web: quảng cáo chéo sang Ram Setu. ID & lưu ý: `NOTES.md`.
- Interstitial: mỗi 2 màn thắng, không hiện ở màn 1–2 (`winsSinceAd` trong `js/ui.js`).
- Rewarded: +30 xu, nhân đôi xu khi thắng, hồi sinh (tối đa 1 lần mỗi lượt chơi màn).

## Lưu ý phát hành

- Không dùng logo, hình ảnh, tên diễn viên hay nhạc phim khi chưa có thỏa thuận bản quyền.
- Xóa tiến trình khi thử nghiệm: DevTools → Application → Local Storage → xóa `kodanda_save_v1`.

## Thêm / sửa nội dung

Chỉ cần sửa `js/data.js`:
- Màn mới: thêm phần tử vào `LEVELS` (`ch`, `mix`, `boss`, `story`). Hội thoại chỉ hiện lần đầu (`S.seen`).
- Nhân vật hội thoại: `CHARACTERS.<id>` với `img` (chân dung) hoặc `icon` (emoji dự phòng).
- Thần tiễn: `ASTRAS` (`cost`, `from` = mở khóa từ màn nào, `key` = phím tắt).
- Cửa hàng: `UPGRADES`, `OUTFITS`, `TRAILS` · quà ngày: `DAILY_REWARDS` · thành tựu: `ACHIEVEMENTS` · thẻ: `LEVELS[].card`, `CARD_ORDER`.
- Thử thách ngày: đề sinh theo ngày (`dailyLevel` trong `js/meta.js`), điều kiện trong `DAILY_MODS`.
- Ảnh: khai báo trong `ART` (cuối `js/data.js`). Thiếu file thì game tự vẽ bằng code.

## Trước khi phát hành

- Đã phát hành: https://tranthanhhai1997.github.io/kodanda/ (`SHARE.url` trong `js/data.js`).
- Chưa có URL của “Hanuman Bay Qua Biển” nên mới liên kết chéo sang RamSetu.

## Đa ngôn ngữ

- Tự nhận theo trình duyệt (vi / hi, còn lại → en); người chơi đổi ở thanh trên cùng.
- Thêm/sửa chuỗi: `STR.<lang>` trong `js/i18n.js`; nội dung (màn, cốt truyện, thành tựu…): `CONTENT.<lang>`. Thiếu khóa sẽ tự lấy tiếng Việt.
- Bản tiếng Anh / Hindi do AI dịch — **cần người bản ngữ duyệt** trước khi phát hành.

## PWA

- Cần phục vụ qua **HTTPS** (hoặc localhost) để cài đặt và chạy offline.
- Service worker ưu tiên mạng: có mạng luôn tải bản mới, mất mạng mới dùng bản đệm. Mỗi lần phát hành vẫn nên tăng `VERSION` trong `sw.js` và cập nhật danh sách `SHELL` nếu thêm file.

## Ảnh

- Thêm/sửa ảnh: chuyển sang WebP rồi khai báo trong `ART` (`js/data.js`). Quỷ: `k` = tỉ lệ chiều cao ảnh so với bán kính va chạm; Ravana: `heads` = tâm từng đầu (vùng trúng tên) theo tỉ lệ ảnh.
- Trang phục Rama dùng bộ lọc màu (`OUTFITS[].filter`) trên ảnh — trình duyệt cũ không hỗ trợ sẽ hiện màu gốc.

## Bộ ba game Ramayana

| Game | Mô tả | Link |
|---|---|---|
| 🏹 **Kodanda** | Rama bắn cung diệt quỷ *(game này)* | [tranthanhhai1997/kodanda](https://github.com/tranthanhhai1997/kodanda) |
| 🌊 **Ram Setu** | Ném đá xây cầu vượt biển | [tranthanhhai1997/ram-setu](https://github.com/tranthanhhai1997/ram-setu) |
| 🐒 **Hanuman Bay Qua Biển** | Hanuman vượt đại dương | [tranthanhhai1997/hanuman-bay-qua-bien](https://github.com/tranthanhhai1997/hanuman-bay-qua-bien) |

