# Ghi chú dự án — tiếp tục trên máy khác

> Cập nhật: 23/10/2026. Đọc file này trước khi làm tiếp. Tổng quan game & cấu trúc mã: `README.md` · lộ trình gốc: `PLAN.md`.

## 1. Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| Web (GitHub Pages) | ✅ https://tranthanhhai1997.github.io/kodanda/ — tự cập nhật khi push `main` |
| 15 màn · Vô tận · Thử thách ngày | ✅ Bot chơi tự động qua hết, không lỗi JS (xem mục 5) |
| Âm thanh | ✅ Synth WebAudio có vang + nhạc nền tanpura/tabla (`js/audio.js`), nút 🎵 riêng |
| Hiệu ứng | ✅ Xác quỷ ngã/mờ, vòng va chạm, tên cắm đất, bóng đổ, banner vào màn/boss/thắng, viền đỏ máu thấp, canvas nét HiDPI |
| App Android (Capacitor 8) | ✅ Build APK debug chạy được trên emulator — **chưa có keystore, chưa lên Google Play** |
| AdMob | ✅ Đã gắn ID thật, `testing: false` — quảng cáo thật chưa phân phát (app mới, chưa liên kết cửa hàng) |
| Web ads | Quảng cáo chéo sang Ram Setu (không phải quảng cáo thật) |

## 2. AdMob

- Tài khoản: **của RamSetu**, nhà xuất bản `ca-app-pub-6386233826905968` (trong Chrome là `authuser=1`).
  ⚠️ Không dùng tài khoản công ty Learningift (`ca-app-pub-4211243117083583`) — đó là tài khoản mặc định khi mở admob.google.com.
- App "Kodanda: Demon Slayer Archer" (Android):

| Loại | ID | Khai báo ở |
|---|---|---|
| App ID | `ca-app-pub-6386233826905968~9392763455` | `app/android/app/src/main/res/values/strings.xml` |
| Interstitial `kodanda_interstitial_win` | `ca-app-pub-6386233826905968/6785947268` | `js/platform.js` → `AD_CONFIG` |
| Rewarded `kodanda_rewarded` | `ca-app-pub-6386233826905968/6934121077` | `js/platform.js` → `AD_CONFIG` |

- Nhịp quảng cáo: interstitial sau mỗi 2 màn thắng (bỏ qua màn 1–2); rewarded: +30 xu, nhân đôi xu, hồi sinh, nhân đôi quà ngày.
- App không có quảng cáo (mất mạng / no fill): interstitial bỏ qua; rewarded báo "chưa tải được", riêng hồi sinh tặng miễn phí.
- Emulator luôn nhận quảng cáo test. **Không tự bấm quảng cáo thật trên máy thật** — thêm máy vào AdMob → Cài đặt → Thiết bị thử nghiệm trước.
- Trạng thái app trên AdMob là "Yêu cầu xem xét" cho tới khi liên kết với Google Play.

## 3. Cài đặt trên máy mới

```bash
git clone git@github.com:tranthanhhai1997/kodanda.git
cd kodanda
python3 -m http.server 8766        # chơi bản web: http://localhost:8766/
```

Bản app Android cần: **Node ≥ 22** (đang dùng 24 qua nvm), **Android Studio** (JDK đi kèm ở `/opt/android-studio/jbr`), Android SDK ở `~/Android/Sdk`, Python 3 + Pillow (tạo icon).

```bash
cd app
npm install
bash scripts/build-apk.sh          # APK debug → app/android/app/build/outputs/apk/debug/app-debug.apk
bash scripts/build-aab.sh          # AAB phát hành (cần keystore)
python3 scripts/make-icons.py      # tạo lại icon & splash từ img/ui/emblem.webp + cover.webp
```

- Đường dẫn JDK/SDK khác máy này: đặt `JAVA_HOME_OVERRIDE` / `ANDROID_HOME` trước khi chạy script.
- `scripts/copy-web.mjs` chép web gốc (index.html, css, js, img, icons, fonts — bỏ PNG gốc) vào `app/www` rồi `cap sync`.
- **Không có trong git** (phải tự tạo/chép tay): `app/node_modules`, `app/www`, thư mục build, `android/local.properties`, **keystore** (`*.jks`, `android/keystore.properties` — mẫu: `keystore.properties.example`). Mất keystore = không cập nhật được app trên Google Play → sao lưu riêng.

## 4. Quy tắc làm việc

- Kiến trúc không cần build, giống RamSetu (`../RamSetu`): `data.js` / `i18n.js` / `save.js` / `platform.js` / `audio.js` / `game.js` / `ui.js` / `meta.js`, thứ tự nạp như trong `index.html`.
- Mỗi lần phát hành web: tăng `VERSION` trong `sw.js` (hiện `kodanda-v5`) và thêm file mới vào `SHELL`.
- Mỗi lần phát hành app: tăng `versionCode` / `versionName` trong `app/android/app/build.gradle`.
- Ảnh mới: tạo bằng prompt trong `docs/art-prompts.md`, chuyển PNG → WebP; không đưa PNG gốc lên git (`.gitignore`).
- Chuỗi giao diện mới: thêm đủ 3 ngôn ngữ trong `js/i18n.js` (vi / en / hi).
- Khi thử trong trình duyệt mà thấy code cũ: Python http.server bị cache — tải lại cứng (Ctrl+Shift+R) hoặc gỡ service worker.

## 5. Kiểm thử

- **Bot chơi tự động**: `docs/playtest-bot.js` — dán vào DevTools Console khi đang ở menu game; chạy 15 màn + Vô tận + Thử thách ngày, in ra thời gian, máu mất, số quỷ diệt, lỗi JS.
- Kết quả gần nhất (mức Thường, bot ngắm chuẩn): không lỗi; màn khó nhất là **14 · Lửa thành Lanka** (bot mất 7 máu), sau đó màn 12 và 15 (4 máu).
- **Hiệu năng (emulator Android)**: khung hình p50 20 ms / p95 24 ms, giật 0,44 %, CPU ~40 % một nhân khi chơi, ~12–16 % ở menu (menu/tạm dừng chỉ vẽ ~20 fps), RAM ~129 MB. Chưa đo nhiệt trên máy thật.
- Thử app trên emulator: `adb install -r app/android/app/build/outputs/apk/debug/app-debug.apk`.

## 6. Việc tiếp theo

1. Thử APK trên điện thoại thật ~10 phút (nóng máy, pin, cảm giác điều khiển).
2. Tạo keystore → build AAB → tạo app trên Google Play Console → liên kết cửa hàng trong AdMob.
3. Thêm `app-ads.txt` lên trang web khi đã có Google Play (AdMob → Ứng dụng → app-ads.txt).
4. Nội dung "siêu khó" (đang chờ chọn):
   - (đề xuất) Độ khó **Địa ngục**: 1 máu, quỷ +40 % tốc độ, boss ×2 máu, xu ×3, mở sau khi phá đảo — sửa `DIFFS` trong `js/data.js` + nút trong `.seg`.
   - Chương IV "Thử thách thần linh" (5 màn: 2 boss cùng lúc, giới hạn mũi tên…).
   - Huy hiệu / thành tựu khi thắng 3 sao ở mức Khó.
5. Bản en/hi do AI dịch — cần người bản ngữ duyệt.
