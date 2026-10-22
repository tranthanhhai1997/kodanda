# Mô hình doanh thu quảng cáo (nội bộ)

> Chuyển từ trang game sang đây ở P0 — không hiển thị cho người chơi.

Prototype này đặt sẵn 3 vị trí quảng cáo mô phỏng đúng vòng lặp kiếm tiền của game hyper-casual: người chơi thấy banner liên tục, gặp interstitial ở điểm ngắt tự nhiên (thắng màn) và chủ động xem rewarded để nhận thưởng. Khi phát hành thật, chỉ cần gắn SDK AdMob (bản app) hoặc AdSense/H5 Games Ads (bản web) vào đúng 3 vị trí dưới đây.

| Vị trí | Khi nào hiện | Mục đích & cách tính tiền |
|---|---|---|
| **Banner** | Dưới khung game, suốt phiên chơi | Doanh thu nền ổn định: tính theo lượt hiển thị (CPM). 10.000 lượt chơi × ~3 phút xem banner ≈ nguồn thu đều, không làm phiền người chơi. |
| **Interstitial** (toàn màn hình) | Sau mỗi 2 màn thắng (từ màn 3), đếm ngược 5 giây mới đóng được | Giá quảng cáo cao hơn banner nhiều lần; đặt ở điểm ngắt tự nhiên nên ít gây khó chịu, tỉ lệ ở lại game cao. |
| **Rewarded** (xem để nhận thưởng) | Người chơi tự bấm: +30 xu ở menu · nhân đôi xu khi thắng · hồi sinh khi thua | eCPM cao nhất trong 3 loại vì người chơi chủ động xem hết. Đây thường là nguồn thu chính của game bắn cung dạng này. |

Công thức ước tính: Doanh thu ≈ (tổng lượt hiển thị ÷ 1.000) × eCPM. Ví dụ minh họa: 100.000 lượt chơi/tháng, mỗi lượt 1 interstitial + 0,6 rewarded, eCPM trung bình 60.000đ → khoảng 9–10 triệu đồng/tháng trước khi trừ chi phí hosting. Con số thực tế phụ thuộc quốc gia người chơi, mùa quảng cáo và tỉ lệ giữ chân — hãy coi đây là khung tham khảo, không phải cam kết.

## Nhịp quảng cáo hiện tại (sau P0)
- Interstitial: sau mỗi 2 màn thắng, không hiện ở màn 1–2.
- Rewarded hồi sinh: tối đa 1 lần mỗi lượt chơi màn.
