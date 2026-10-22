"use strict";
/* =====================================================================
   ĐA NGÔN NGỮ — vi (gốc) · en · hi
   - STR: chuỗi giao diện, dùng t('key', {biến}); thiếu khóa → tiếng Việt
   - CONTENT: bản dịch nội dung trong data.js, áp thẳng vào dữ liệu lúc tải
   - HTML tĩnh: data-i18n (text) / data-i18n-html / data-i18n-title
   Bản en/hi do AI dịch — cần người bản ngữ duyệt trước khi phát hành.
   ===================================================================== */
var LANGS = [
  { id:'vi', label:'Tiếng Việt', locale:'vi-VN' },
  { id:'en', label:'English',    locale:'en-US' },
  { id:'hi', label:'हिन्दी',       locale:'hi-IN' }
];

var STR = {
  vi: {
    doc_title:'Bắn Cung Diệt Quỷ — Rama & cung thần Kodanda', brand:'Bắn Cung Diệt Quỷ',
    brand_sub:'Rama & cây cung thần Kodanda — bảo vệ bìa rừng khỏi quỷ Rakshasa',
    diff_t:'Độ khó', coin_t:'Xu vàng tích lũy (được lưu trên máy)', coin_unit:'xu', sound_t:'Bật/tắt âm thanh',
    ad_coin_t:'Xem quảng cáo nhận 30 xu', fs_t:'Toàn màn hình', pause_t:'Tạm dừng (P)', lang_t:'Ngôn ngữ', install:'📲 Cài game',
    ios_install:'Trên iPhone/iPad: bấm Chia sẻ ⎋ trong Safari → “Thêm vào MH chính” để cài game.',
    hud_level:'MÀN', hud_hp:'SINH LỰC', hud_energy:'THẦN LỰC', hud_kill:'QUỶ ĐÃ DIỆT', hud_score:'ĐIỂM',
    skip:'Bỏ qua', next:'Tiếp ▶', fight:'⚔️ Vào trận',
    menu_title:'Cung Thần Diệt Quỷ',
    menu_intro_html:'Hoàng tử <b>Rama</b> giương cây cung thần <b>Kodanda</b> qua 3 chương sử thi — từ khu rừng đạo sĩ tới chiến trường Lanka. Kéo / chạm giữ để ngắm và dồn lực, thả ra để bắn!',
    menu_hint_html:'Mẹo: thả cung khi thanh lực vào <b>vùng xanh</b> = phát HOÀN HẢO · bắn trúng đầu = CHÍ MẠNG · tích <b>thần lực</b> để gọi Astra (phím 1–4).',
    play_lvl:'▶ Chơi màn {n}', ad_coins_btn:'📺 Xem QC nhận 30 xu',
    m_shop:'🛒 Cửa hàng', m_journey:'🏆 Hành trình', m_daily:'🎁 Quà ngày', m_endless:'♾️ Vô tận', m_dchal:'⚔️ Thử thách ngày', m_dchal_done:'✅ Thử thách ngày', m_share:'📤 Chia sẻ',
    win_title:'🎉 Chiến thắng!', win_score:'Điểm màn', win_coins:'Xu kiếm được', win_acc:'Độ chính xác',
    double_btn:'📺 Xem QC — nhân đôi xu', double_done:'✔ Đã nhân đôi xu', next_lvl:'Màn {n} ▶', ending_btn:'🏁 Đoạn kết ▶',
    share_win:'📤 Khoe kết quả', pick_lvl:'Chọn màn',
    lose_title:'💀 Vạch phòng thủ đã vỡ…',
    lose_text:'Lũ quỷ tràn qua bìa rừng. Nhưng đừng bỏ cuộc — xem một quảng cáo ngắn để Rama hồi sinh với 3 sinh lực và đẩy lùi toàn bộ quỷ đang áp sát.',
    lose_text2:'Lũ quỷ tràn qua bìa rừng lần nữa. Hãy chơi lại — Rama sẽ trở lại mạnh mẽ hơn!',
    lose_record:'🏆 Kỷ lục điểm mới ở chế độ Vô tận! ', lose_kill:'Quỷ đã diệt', lose_wave_lbl:'Đã trụ tới', score:'Điểm',
    revive:'📺 Xem QC — Hồi sinh', retry:'↻ Chơi lại', share_record:'📤 Khoe kỷ lục',
    shop_title:'🛒 Cửa hàng', tab_up:'Nâng cấp cung', tab_outfit:'Trang phục', tab_trail:'Vệt tên', back:'← Quay lại',
    journey_title:'🏆 Hành trình của Rama', tab_ach:'Thành tựu', tab_cards:'Thẻ nhân vật',
    daily_title:'🎁 Quà hằng ngày', daily_claim:'🎁 Nhận {n} xu', daily_claimed:'✔ Đã nhận hôm nay', daily_double:'📺 Xem QC — nhân đôi', close:'Đóng',
    daily_streak:'Chuỗi đăng nhập: {n} ngày', daily_tomorrow:' · Hẹn bạn ngày mai!', day:'Ngày {n}',
    rotate_hint:'📱 Xoay ngang và bấm ⛶ để chơi toàn màn hình',
    pause_title:'⏸ Tạm dừng', pause_text:'Rama đang nín thở chờ lệnh của bạn.', resume:'▶ Chơi tiếp',
    banner_tag:'Quảng cáo · Banner 728×90', banner_text:'🏹 Game hay mỗi ngày tại GameVui Hub', banner_small:'Chơi miễn phí — không cần cài đặt · Vị trí banner dưới khung game, hiển thị suốt phiên chơi',
    banner_cta:'Chơi ngay', banner_toast:'Đây là banner mô phỏng — khi phát hành thật, nút này dẫn tới trang của nhà quảng cáo.',
    info1_title_html:'Khải huyền <span class="accent">Ramayana</span> — cây cung thần Kodanda',
    info1_html:'Trong sử thi Ramayana, Rama là hoàng tử thành Ayodhya, hiện thân của thần Vishnu. Tại lễ chọn rể của công chúa Sita, chàng là người duy nhất giương nổi cây cung của thần Shiva mà vua Janaka gìn giữ — và kéo gãy nó ngay tại lễ đường. Sau hôn lễ, Rama nhận cây cung thần <b>Kodanda</b> từ đạo sĩ Parashurama và mang theo trong suốt hành trình. Khi quỷ vương Ravana bắt cóc Sita về đảo Lanka, Rama lên đường giải cứu cùng em trai Lakshmana, đội quân khỉ của Hanuman và cây cầu đá Ram Setu bắc qua biển. Trong game này, bạn vào vai Rama ở tuyến đầu: mỗi mũi tên là một lần đẩy lùi bầy Rakshasa trước khi chúng chạm vạch phòng thủ.',
    card_play:'Cách chơi',
    card_play_html:'<li><b>Kéo chuột / chạm &amp; giữ</b> trên khung game để ngắm — chấm quỹ đạo hiện theo lực kéo, thả ra để bắn.</li><li>Bàn phím: <span class="kbd">↑</span><span class="kbd">↓</span> chỉnh góc, giữ <span class="kbd">Space</span> dồn lực, thả để bắn, <span class="kbd">1</span>–<span class="kbd">4</span> gọi thần tiễn, <span class="kbd">P</span> tạm dừng.</li><li><b>Hoàn hảo</b>: thả khi thanh lực vào vùng xanh (+1 sát thương) · <b>Chí mạng</b>: trúng đầu quỷ (+1 sát thương).</li><li>Quỷ chạm vạch đỏ bên trái = mất 1 sinh lực. Hết sinh lực là thua màn.</li>',
    card_demons:'Quỷ, boss & vật phẩm',
    card_demons_html:'<li><b>Quỷ đất · bay · tốc độ · giáp</b> · <b>Quỷ khiên</b> chặn tên bay thẳng — bắn vòng cầu · <b>Quỷ phân thân</b> tách đôi · <b>Pháp sư</b> hồi máu đồng bọn.</li><li><b>4 boss</b>: Tataka ném đá tảng · nai vàng Maricha phân thân ảo ảnh · Kumbhakarna dậm đất · Ravana mười đầu mọc lại.</li><li><b>Tên vàng</b> định kỳ (×2, xuyên khiên) · <b>cầu lửa thiêng</b> cho Tên Lửa 12 giây · <b>trái tim</b> hồi 1 sinh lực.</li>',
    card_astra:'Thần tiễn & chấm sao',
    card_astra_html:'<li><b>Agneyastra</b> mưa tên lửa · <b>Varunastra</b> sóng thần · <b>Vayavyastra</b> gió thần · <b>Brahmastra</b> thần tiễn tối thượng — mở dần theo cốt truyện.</li><li>3 sao: giữ trọn sinh lực · 2 sao: còn từ một nửa · 1 sao: thắng sít sao.</li><li>Độ khó <b>Khó</b>: quỷ nhanh hơn 20%, xuất hiện dồn dập hơn, Rama chỉ có 3 sinh lực — đổi lại điểm và xu cao hơn.</li>',
    xlink_title_html:'Vũ trụ game <span class="accent">Ramayana</span>', xlink_p:'Tiếp tục hành trình cùng đại quân vanara: ném đá xây cây cầu huyền thoại vượt biển sang Lanka.',
    xlink_btn:'🌉 Chơi “Xây Cầu Ram Setu”',
    footer:'“Bắn Cung Diệt Quỷ” — thuộc vũ trụ game Ramayana cùng “Xây Cầu Ram Setu” và “Hanuman Bay Qua Biển”. Mọi quảng cáo trong trang là mô phỏng để minh họa vị trí đặt quảng cáo; chưa gắn mạng quảng cáo thật.',
    ad_inter_head:'📺 Quảng cáo', ad_inter_tag:'Interstitial · mô phỏng', ad_inter_h:'Giao đồ ăn siêu tốc — Giảm 40% đơn đầu',
    ad_inter_p:'Quảng cáo toàn màn hình xuất hiện ở điểm ngắt tự nhiên (vừa thắng màn). Người chơi xem vài giây rồi quay lại game.',
    ad_src:'Nguồn: mạng quảng cáo (mô phỏng)', ad_inter_note:'eCPM interstitial thường cao gấp 5–10 lần banner',
    ad_reward_head:'🎁 Quảng cáo có thưởng', ad_reward_tag:'Rewarded · mô phỏng', ad_reward_h:'Ứng dụng học tiếng Anh — dùng thử 7 ngày',
    ad_reward_p:'Xem hết quảng cáo để nhận thưởng.', ad_reward_wait:'Phần thưởng sẽ trao khi xem đủ thời lượng', ad_reward_done:'Đã trao thưởng ✔',
    ad_close_in:'Đóng sau {n}s', ad_close:'✕ Đóng quảng cáo', ad_claim:'🎁 Nhận thưởng', ad_playing:'Đang phát…',
    t_ad_coins:'🎁 +30 xu từ quảng cáo!', t_double:'🎁 Nhân đôi xu thành công: +{n} xu', t_revive:'💚 Rama hồi sinh! Bầy quỷ bị đẩy lùi.',
    /* trong trận */
    f_perfect:'HOÀN HẢO!', f_split:'Phân thân!', f_killed:'ĐÃ DIỆT {n}!', f_illusion:'Ảo ảnh!', f_exposed:'RAVANA LỘ ĐIỂM YẾU — DÙNG BRAHMASTRA!',
    t_exposed:'☀️ Thần lực đầy! Bấm Brahmastra (phím 4) hoặc bắn vào ngực Ravana', f_head_down:'Hạ 1 đầu!', f_3heads:'Ba đầu mọc lại!', f_head_back:'Đầu mọc lại!',
    f_ravana_call:'Ravana gọi thêm quỷ!', f_kumbha_stomp:'Kumbhakarna dậm đất!', f_kumbha_break:'Kumbhakarna phá vạch!', f_maricha_split:'Maricha phân thân!',
    f_hp:'❤️ +1 sinh lực', f_wave:'ĐỢT {n}', f_boss:' · BOSS!', f_break:'Quỷ phá vạch!', f_hit_rock:'Trúng đá tảng!', f_hit_fire:'Trúng cầu lửa!',
    f_fire_arrow:'🔥 TÊN LỬA 12s!', f_shoot_rock:'Bắn vỡ đá tảng', f_shoot_fire:'Bắn vỡ cầu lửa', f_shield:'Khiên chặn! Bắn vòng cầu', f_heads:'Hãy bắn vào các đầu!',
    f_combo:'COMBO ×{n}', f_crit:'CHÍ MẠNG!', c_power:'LỰC {n}%', c_fire:'🔥 Tên lửa: {n}s', c_exposed:' · LỘ ĐIỂM YẾU {n}s', c_heads:' · {n}/{m} ĐẦU',
    c_hint:'Kéo / chạm giữ để giương cung — thả ra để bắn', wave:'Đợt {n}', endless_name:'Bảo vệ Ayodhya',
    astra_title:'{name} — {desc} (phím {key})', t_ch_unlock:'🗺️ Mở khóa {n}', t_modes_unlock:'♾️ Mở khóa chế độ Vô tận & Thử thách ngày!',
    lvl_label:'Màn {n}', lvl_toast:'Màn {n}: {s}', lvl_meta:'{n} quỷ · {d}: {h} sinh lực', t_diff:'Độ khó: {n}',
    /* meta */
    t_card:'🃏 Mở thẻ nhân vật: {n}', t_ach:'🏆 Thành tựu: {n}', t_ach_claim:'🏆 +{n} xu — {a}', modes_locked:'Mở khóa sau khi qua Chương I',
    ach_sum:'Đã đạt {a}/{b} · Diệt {k} quỷ · Combo cao nhất ×{c} · Vô tận: đợt {w}', claim:'Nhận {n} xu', claimed:'✔ Đã nhận',
    cards_sum:'Đã sưu tầm {a}/{b} thẻ — thắng màn lần đầu để mở thẻ.', card_locked:'Chưa mở khóa',
    max:'Tối đa', using:'✔ Đang dùng', use:'Dùng', need_win:'🔒 Phá đảo để mở', t_upgrade:'{n} lên cấp {l}!',
    t_daily:'🎁 +{n} xu quà hằng ngày!', t_daily_double:'🎁 Nhân đôi quà ngày: +{n} xu',
    endless_label:'♾️ Bảo vệ Ayodhya', endless_toast:'♾️ Vô tận — trụ càng lâu càng tốt! Kỷ lục: đợt {n}',
    daily_name:'Thử thách ngày', daily_label:'⚔️ Thử thách ngày', t_daily_win:'⚔️ Hoàn thành Thử thách ngày: +{n} xu!',
    share_title:'Bắn Cung Diệt Quỷ', t_copied:'📋 Đã chép nội dung chia sẻ — dán vào mạng xã hội nhé!',
    share_endless:'Tôi đã trụ tới đợt {n} ({s} điểm) ở chế độ Vô tận “Bắn Cung Diệt Quỷ” — bạn trụ được bao lâu?',
    share_daily:'Tôi đã vượt Thử thách ngày “{n}” trong game Bắn Cung Diệt Quỷ với {s} điểm!',
    share_level:'Tôi đã vượt màn {n} · {l} với {s} điểm trong game Bắn Cung Diệt Quỷ!',
    share_progress:'Tôi đã mở {a}/{b} màn, {s}⭐ và {c} thẻ nhân vật trong game Bắn Cung Diệt Quỷ — cùng Rama diệt quỷ nào!',
    img_wave:'♾️ Trụ tới đợt {n}', img_daily:'⚔️ Thử thách ngày: {n}', img_level:'🏹 Màn {n} · {l}', points:'{n} điểm',
    t_img_saved:'🖼️ Đã lưu ảnh kết quả — đăng kèm {n} nhé!'
  },

  en: {
    doc_title:'Demon Slayer Archer — Rama & the Kodanda Bow', brand:'Demon Slayer Archer',
    brand_sub:'Rama & the divine bow Kodanda — defend the forest from the Rakshasas',
    diff_t:'Difficulty', coin_t:'Gold coins (saved on this device)', coin_unit:'coins', sound_t:'Sound on/off',
    ad_coin_t:'Watch an ad for 30 coins', fs_t:'Full screen', pause_t:'Pause (P)', lang_t:'Language', install:'📲 Install game',
    ios_install:'On iPhone/iPad: tap Share ⎋ in Safari → “Add to Home Screen” to install.',
    hud_level:'LEVEL', hud_hp:'HEALTH', hud_energy:'DIVINE POWER', hud_kill:'DEMONS SLAIN', hud_score:'SCORE',
    skip:'Skip', next:'Next ▶', fight:'⚔️ To battle',
    menu_title:'The Divine Bow',
    menu_intro_html:'Prince <b>Rama</b> draws the divine bow <b>Kodanda</b> across 3 epic chapters — from the sages’ forest to the battlefield of Lanka. Drag / hold to aim and charge, release to shoot!',
    menu_hint_html:'Tip: release when the power bar is in the <b>blue zone</b> for a PERFECT shot · headshots are CRITICAL · build <b>divine power</b> to call an Astra (keys 1–4).',
    play_lvl:'▶ Play level {n}', ad_coins_btn:'📺 Watch ad for 30 coins',
    m_shop:'🛒 Shop', m_journey:'🏆 Journey', m_daily:'🎁 Daily gift', m_endless:'♾️ Endless', m_dchal:'⚔️ Daily challenge', m_dchal_done:'✅ Daily challenge', m_share:'📤 Share',
    win_title:'🎉 Victory!', win_score:'Score', win_coins:'Coins earned', win_acc:'Accuracy',
    double_btn:'📺 Watch ad — double coins', double_done:'✔ Coins doubled', next_lvl:'Level {n} ▶', ending_btn:'🏁 Epilogue ▶',
    share_win:'📤 Share result', pick_lvl:'Levels',
    lose_title:'💀 The defense line has fallen…',
    lose_text:'The demons broke through. Don’t give up — watch a short ad to revive Rama with 3 health and push back every nearby demon.',
    lose_text2:'The demons broke through again. Try again — Rama will return stronger!',
    lose_record:'🏆 New Endless high score! ', lose_kill:'Demons slain', lose_wave_lbl:'Survived to', score:'Score',
    revive:'📺 Watch ad — Revive', retry:'↻ Retry', share_record:'📤 Share record',
    shop_title:'🛒 Shop', tab_up:'Bow upgrades', tab_outfit:'Outfits', tab_trail:'Arrow trails', back:'← Back',
    journey_title:'🏆 Rama’s Journey', tab_ach:'Achievements', tab_cards:'Character cards',
    daily_title:'🎁 Daily gift', daily_claim:'🎁 Claim {n} coins', daily_claimed:'✔ Claimed today', daily_double:'📺 Watch ad — double', close:'Close',
    daily_streak:'Login streak: {n} days', daily_tomorrow:' · See you tomorrow!', day:'Day {n}',
    rotate_hint:'📱 Rotate to landscape and tap ⛶ for full screen',
    pause_title:'⏸ Paused', pause_text:'Rama holds his breath, awaiting your command.', resume:'▶ Resume',
    banner_tag:'Ad · Banner 728×90', banner_text:'🏹 Great games every day at GameVui Hub', banner_small:'Free to play — no install · Banner slot below the game, shown during the session',
    banner_cta:'Play now', banner_toast:'This is a simulated banner — in the real release this button opens the advertiser’s page.',
    info1_title_html:'The <span class="accent">Ramayana</span> — the divine bow Kodanda',
    info1_html:'In the Ramayana epic, Rama is the prince of Ayodhya and an avatar of Lord Vishnu. At Princess Sita’s swayamvara he alone could lift Lord Shiva’s bow kept by King Janaka — and broke it in the hall. Rama later carried the divine bow <b>Kodanda</b> throughout his journey. When the demon king Ravana abducted Sita to Lanka, Rama set out to rescue her with his brother Lakshmana, Hanuman’s vanara army and the stone bridge Ram Setu across the sea. In this game you are Rama on the front line: every arrow pushes back the Rakshasas before they reach the defense line.',
    card_play:'How to play',
    card_play_html:'<li><b>Drag / touch &amp; hold</b> on the game to aim — the dotted arc follows your power; release to shoot.</li><li>Keyboard: <span class="kbd">↑</span><span class="kbd">↓</span> aim, hold <span class="kbd">Space</span> to charge, release to shoot, <span class="kbd">1</span>–<span class="kbd">4</span> divine arrows, <span class="kbd">P</span> pause.</li><li><b>Perfect</b>: release in the blue zone (+1 damage) · <b>Critical</b>: hit a demon’s head (+1 damage).</li><li>A demon touching the red line costs 1 health. Lose all health and the level is lost.</li>',
    card_demons:'Demons, bosses & items',
    card_demons_html:'<li><b>Ground · flying · fast · armored</b> · <b>Shield demons</b> block straight shots — lob your arrows · <b>Splitters</b> split in two · <b>Shamans</b> heal their allies.</li><li><b>4 bosses</b>: Tataka hurls boulders · the golden deer Maricha conjures illusions · Kumbhakarna shakes the earth · ten-headed Ravana regrows his heads.</li><li><b>Golden arrows</b> regularly (×2, pierce shields) · <b>sacred fire orb</b> grants Fire Arrows for 12s · <b>heart</b> restores 1 health.</li>',
    card_astra:'Divine arrows & stars',
    card_astra_html:'<li><b>Agneyastra</b> fire rain · <b>Varunastra</b> tidal wave · <b>Vayavyastra</b> divine wind · <b>Brahmastra</b> the ultimate weapon — unlocked through the story.</li><li>3 stars: no health lost · 2 stars: half or more left · 1 star: a narrow win.</li><li><b>Hard</b>: demons 20% faster, spawning faster, Rama has only 3 health — but more points and coins.</li>',
    xlink_title_html:'The <span class="accent">Ramayana</span> game universe', xlink_p:'Continue the journey with the vanara army: hurl stones to build the legendary bridge to Lanka.',
    xlink_btn:'🌉 Play “Ram Setu Bridge”',
    footer:'“Demon Slayer Archer” — part of the Ramayana game universe with “Ram Setu Bridge” and “Hanuman Over the Sea”. All ads on this page are simulated to illustrate ad placements; no real ad network is connected.',
    ad_inter_head:'📺 Ad', ad_inter_tag:'Interstitial · simulated', ad_inter_h:'Super-fast food delivery — 40% off your first order',
    ad_inter_p:'A full-screen ad shown at a natural break (just after winning a level). Players watch a few seconds and return to the game.',
    ad_src:'Source: ad network (simulated)', ad_inter_note:'Interstitial eCPM is often 5–10× a banner',
    ad_reward_head:'🎁 Rewarded ad', ad_reward_tag:'Rewarded · simulated', ad_reward_h:'English learning app — 7-day free trial',
    ad_reward_p:'Watch the whole ad to get your reward.', ad_reward_wait:'Reward is granted after the full ad', ad_reward_done:'Reward granted ✔',
    ad_close_in:'Close in {n}s', ad_close:'✕ Close ad', ad_claim:'🎁 Claim reward', ad_playing:'Playing…',
    t_ad_coins:'🎁 +30 coins from the ad!', t_double:'🎁 Coins doubled: +{n} coins', t_revive:'💚 Rama revived! The demons are pushed back.',
    f_perfect:'PERFECT!', f_split:'Split!', f_killed:'{n} DEFEATED!', f_illusion:'Illusion!', f_exposed:'RAVANA IS EXPOSED — USE BRAHMASTRA!',
    t_exposed:'☀️ Divine power full! Press Brahmastra (key 4) or shoot Ravana’s chest', f_head_down:'Head down!', f_3heads:'Three heads regrew!', f_head_back:'A head regrew!',
    f_ravana_call:'Ravana summons demons!', f_kumbha_stomp:'Kumbhakarna stomps!', f_kumbha_break:'Kumbhakarna broke through!', f_maricha_split:'Maricha splits!',
    f_hp:'❤️ +1 health', f_wave:'WAVE {n}', f_boss:' · BOSS!', f_break:'Demon broke through!', f_hit_rock:'Hit by a boulder!', f_hit_fire:'Hit by a fireball!',
    f_fire_arrow:'🔥 FIRE ARROWS 12s!', f_shoot_rock:'Boulder shattered', f_shoot_fire:'Fireball shattered', f_shield:'Blocked! Lob your arrow', f_heads:'Shoot the heads!',
    f_combo:'COMBO ×{n}', f_crit:'CRITICAL!', c_power:'POWER {n}%', c_fire:'🔥 Fire arrows: {n}s', c_exposed:' · EXPOSED {n}s', c_heads:' · {n}/{m} HEADS',
    c_hint:'Drag / hold to draw the bow — release to shoot', wave:'Wave {n}', endless_name:'Defend Ayodhya',
    astra_title:'{name} — {desc} (key {key})', t_ch_unlock:'🗺️ Unlocked {n}', t_modes_unlock:'♾️ Endless & Daily challenge unlocked!',
    lvl_label:'Level {n}', lvl_toast:'Level {n}: {s}', lvl_meta:'{n} demons · {d}: {h} health', t_diff:'Difficulty: {n}',
    t_card:'🃏 Card unlocked: {n}', t_ach:'🏆 Achievement: {n}', t_ach_claim:'🏆 +{n} coins — {a}', modes_locked:'Unlocks after Chapter I',
    ach_sum:'Completed {a}/{b} · {k} demons slain · Best combo ×{c} · Endless: wave {w}', claim:'Claim {n}', claimed:'✔ Claimed',
    cards_sum:'Collected {a}/{b} cards — clear levels for the first time to unlock them.', card_locked:'Locked',
    max:'Max', using:'✔ Equipped', use:'Equip', need_win:'🔒 Finish the game', t_upgrade:'{n} upgraded to level {l}!',
    t_daily:'🎁 +{n} coins daily gift!', t_daily_double:'🎁 Daily gift doubled: +{n} coins',
    endless_label:'♾️ Defend Ayodhya', endless_toast:'♾️ Endless — survive as long as you can! Best: wave {n}',
    daily_name:'Daily challenge', daily_label:'⚔️ Daily challenge', t_daily_win:'⚔️ Daily challenge complete: +{n} coins!',
    share_title:'Demon Slayer Archer', t_copied:'📋 Share text copied — paste it on social media!',
    share_endless:'I survived to wave {n} ({s} points) in Endless mode of “Demon Slayer Archer” — how long can you last?',
    share_daily:'I beat the daily challenge “{n}” in Demon Slayer Archer with {s} points!',
    share_level:'I cleared level {n} · {l} with {s} points in Demon Slayer Archer!',
    share_progress:'I’ve unlocked {a}/{b} levels, {s}⭐ and {c} character cards in Demon Slayer Archer — join Rama and slay the demons!',
    img_wave:'♾️ Survived to wave {n}', img_daily:'⚔️ Daily challenge: {n}', img_level:'🏹 Level {n} · {l}', points:'{n} points',
    t_img_saved:'🖼️ Result image saved — post it with {n}!'
  },

  hi: {
    doc_title:'राक्षस संहारक धनुर्धर — राम और कोदंड धनुष', brand:'राक्षस संहारक धनुर्धर',
    brand_sub:'राम और दिव्य धनुष कोदंड — वन को राक्षसों से बचाएँ',
    diff_t:'कठिनाई', coin_t:'सोने के सिक्के (इस डिवाइस पर सहेजे गए)', coin_unit:'सिक्के', sound_t:'आवाज़ चालू/बंद',
    ad_coin_t:'विज्ञापन देखें, 30 सिक्के पाएँ', fs_t:'पूर्ण स्क्रीन', pause_t:'रोकें (P)', lang_t:'भाषा', install:'📲 गेम इंस्टॉल करें',
    ios_install:'iPhone/iPad पर: Safari में शेयर ⎋ दबाएँ → “होम स्क्रीन में जोड़ें”।',
    hud_level:'स्तर', hud_hp:'जीवन', hud_energy:'दिव्य शक्ति', hud_kill:'राक्षस मारे', hud_score:'अंक',
    skip:'छोड़ें', next:'आगे ▶', fight:'⚔️ युद्ध में',
    menu_title:'दिव्य धनुष',
    menu_intro_html:'राजकुमार <b>राम</b> दिव्य धनुष <b>कोदंड</b> उठाते हैं — ऋषियों के वन से लंका के रणक्षेत्र तक 3 महाकाव्य अध्याय। खींचकर / दबाकर निशाना लगाएँ और शक्ति भरें, छोड़कर तीर चलाएँ!',
    menu_hint_html:'सुझाव: शक्ति पट्टी <b>नीले क्षेत्र</b> में हो तब छोड़ें = उत्तम तीर · सिर पर वार = घातक · <b>दिव्य शक्ति</b> जमा कर अस्त्र चलाएँ (कुंजी 1–4)।',
    play_lvl:'▶ स्तर {n} खेलें', ad_coins_btn:'📺 विज्ञापन देखें, 30 सिक्के',
    m_shop:'🛒 दुकान', m_journey:'🏆 यात्रा', m_daily:'🎁 दैनिक उपहार', m_endless:'♾️ अनंत', m_dchal:'⚔️ दैनिक चुनौती', m_dchal_done:'✅ दैनिक चुनौती', m_share:'📤 साझा करें',
    win_title:'🎉 विजय!', win_score:'अंक', win_coins:'सिक्के मिले', win_acc:'सटीकता',
    double_btn:'📺 विज्ञापन देखें — दोगुने सिक्के', double_done:'✔ सिक्के दोगुने हुए', next_lvl:'स्तर {n} ▶', ending_btn:'🏁 उपसंहार ▶',
    share_win:'📤 परिणाम साझा करें', pick_lvl:'स्तर चुनें',
    lose_title:'💀 रक्षा रेखा टूट गई…',
    lose_text:'राक्षस आगे बढ़ आए। हार न मानें — छोटा विज्ञापन देखकर राम को 3 जीवन के साथ पुनर्जीवित करें और पास के सभी राक्षसों को पीछे धकेलें।',
    lose_text2:'राक्षस फिर से आगे बढ़ आए। दोबारा खेलें — राम और भी शक्तिशाली लौटेंगे!',
    lose_record:'🏆 अनंत मोड में नया रिकॉर्ड! ', lose_kill:'राक्षस मारे', lose_wave_lbl:'यहाँ तक टिके', score:'अंक',
    revive:'📺 विज्ञापन देखें — पुनर्जीवन', retry:'↻ फिर खेलें', share_record:'📤 रिकॉर्ड साझा करें',
    shop_title:'🛒 दुकान', tab_up:'धनुष उन्नयन', tab_outfit:'वेशभूषा', tab_trail:'तीर की लकीर', back:'← वापस',
    journey_title:'🏆 राम की यात्रा', tab_ach:'उपलब्धियाँ', tab_cards:'पात्र कार्ड',
    daily_title:'🎁 दैनिक उपहार', daily_claim:'🎁 {n} सिक्के लें', daily_claimed:'✔ आज ले लिया', daily_double:'📺 विज्ञापन — दोगुना', close:'बंद करें',
    daily_streak:'लगातार लॉगिन: {n} दिन', daily_tomorrow:' · कल फिर मिलेंगे!', day:'दिन {n}',
    rotate_hint:'📱 फ़ोन को आड़ा घुमाएँ और पूर्ण स्क्रीन के लिए ⛶ दबाएँ',
    pause_title:'⏸ रुका हुआ', pause_text:'राम साँस रोके आपके आदेश की प्रतीक्षा कर रहे हैं।', resume:'▶ जारी रखें',
    banner_tag:'विज्ञापन · बैनर 728×90', banner_text:'🏹 हर दिन बढ़िया गेम — GameVui Hub', banner_small:'मुफ़्त — इंस्टॉल की ज़रूरत नहीं · गेम के नीचे बैनर स्थान',
    banner_cta:'अभी खेलें', banner_toast:'यह नकली बैनर है — असली संस्करण में यह विज्ञापनदाता के पेज पर ले जाएगा।',
    info1_title_html:'<span class="accent">रामायण</span> — दिव्य धनुष कोदंड',
    info1_html:'रामायण महाकाव्य में राम अयोध्या के राजकुमार और भगवान विष्णु के अवतार हैं। सीता के स्वयंवर में केवल वही राजा जनक द्वारा रखे शिव धनुष को उठा सके — और उसे तोड़ दिया। राम ने पूरी यात्रा में दिव्य धनुष <b>कोदंड</b> धारण किया। जब रावण सीता को लंका ले गया, तब राम भाई लक्ष्मण, हनुमान की वानर सेना और समुद्र पर बने राम सेतु के साथ उन्हें बचाने निकले। इस गेम में आप अग्रिम पंक्ति पर राम हैं: हर तीर राक्षसों को रक्षा रेखा तक पहुँचने से पहले पीछे धकेलता है।',
    card_play:'कैसे खेलें',
    card_play_html:'<li>गेम पर <b>खींचें / दबाकर रखें</b> — बिंदुओं का पथ शक्ति के अनुसार दिखता है; छोड़कर तीर चलाएँ।</li><li>कीबोर्ड: <span class="kbd">↑</span><span class="kbd">↓</span> कोण, <span class="kbd">Space</span> दबाकर शक्ति, छोड़कर तीर, <span class="kbd">1</span>–<span class="kbd">4</span> दिव्य अस्त्र, <span class="kbd">P</span> रोकें।</li><li><b>उत्तम</b>: नीले क्षेत्र में छोड़ें (+1 क्षति) · <b>घातक</b>: राक्षस के सिर पर वार (+1 क्षति)।</li><li>लाल रेखा छूने वाला राक्षस 1 जीवन लेता है। सारे जीवन ख़त्म तो स्तर हार।</li>',
    card_demons:'राक्षस, महाराक्षस और वस्तुएँ',
    card_demons_html:'<li><b>भूमि · उड़ने वाले · तेज़ · कवचधारी</b> · <b>ढाल वाले</b> सीधे तीर रोकते हैं — ऊँचा तीर चलाएँ · <b>विभाजक</b> दो में बँटते हैं · <b>तांत्रिक</b> साथियों को ठीक करते हैं।</li><li><b>4 महाराक्षस</b>: ताड़का चट्टानें फेंकती है · स्वर्ण मृग मारीच माया रचता है · कुंभकर्ण धरती हिलाता है · दशानन रावण के सिर फिर उग आते हैं।</li><li><b>स्वर्ण तीर</b> नियमित रूप से (×2, ढाल भेदे) · <b>पवित्र अग्नि गोला</b> 12 सेकंड अग्नि तीर · <b>हृदय</b> 1 जीवन लौटाता है।</li>',
    card_astra:'दिव्य अस्त्र और तारे',
    card_astra_html:'<li><b>आग्नेयास्त्र</b> अग्नि वर्षा · <b>वरुणास्त्र</b> जल लहर · <b>वायव्यास्त्र</b> दिव्य पवन · <b>ब्रह्मास्त्र</b> परम अस्त्र — कहानी के साथ खुलते हैं।</li><li>3 तारे: कोई जीवन नहीं गया · 2 तारे: आधा या अधिक बचा · 1 तारा: कड़ी जीत।</li><li><b>कठिन</b>: राक्षस 20% तेज़, जल्दी आते हैं, राम के पास केवल 3 जीवन — पर अधिक अंक और सिक्के।</li>',
    xlink_title_html:'<span class="accent">रामायण</span> गेम संसार', xlink_p:'वानर सेना के साथ यात्रा जारी रखें: पत्थर फेंककर लंका तक पौराणिक सेतु बनाएँ।',
    xlink_btn:'🌉 “राम सेतु” खेलें',
    footer:'“राक्षस संहारक धनुर्धर” — “राम सेतु” और “हनुमान समुद्र पार” के साथ रामायण गेम संसार का हिस्सा। इस पेज के सभी विज्ञापन नकली हैं, केवल विज्ञापन स्थान दिखाने के लिए।',
    ad_inter_head:'📺 विज्ञापन', ad_inter_tag:'इंटरस्टीशियल · नकली', ad_inter_h:'तेज़ फ़ूड डिलीवरी — पहले ऑर्डर पर 40% छूट',
    ad_inter_p:'पूर्ण स्क्रीन विज्ञापन स्वाभाविक विराम पर (स्तर जीतने के बाद) दिखता है।',
    ad_src:'स्रोत: विज्ञापन नेटवर्क (नकली)', ad_inter_note:'इंटरस्टीशियल eCPM अक्सर बैनर से 5–10 गुना',
    ad_reward_head:'🎁 इनाम वाला विज्ञापन', ad_reward_tag:'रिवॉर्डेड · नकली', ad_reward_h:'अंग्रेज़ी सीखने का ऐप — 7 दिन मुफ़्त',
    ad_reward_p:'इनाम पाने के लिए पूरा विज्ञापन देखें।', ad_reward_wait:'पूरा देखने पर इनाम मिलेगा', ad_reward_done:'इनाम मिला ✔',
    ad_close_in:'{n} से. में बंद', ad_close:'✕ विज्ञापन बंद करें', ad_claim:'🎁 इनाम लें', ad_playing:'चल रहा है…',
    t_ad_coins:'🎁 विज्ञापन से +30 सिक्के!', t_double:'🎁 सिक्के दोगुने: +{n}', t_revive:'💚 राम पुनर्जीवित! राक्षस पीछे हटे।',
    f_perfect:'उत्तम!', f_split:'विभाजन!', f_killed:'{n} पराजित!', f_illusion:'माया!', f_exposed:'रावण असुरक्षित — ब्रह्मास्त्र चलाएँ!',
    t_exposed:'☀️ दिव्य शक्ति पूर्ण! ब्रह्मास्त्र (कुंजी 4) दबाएँ या रावण की छाती पर वार करें', f_head_down:'एक सिर गिरा!', f_3heads:'तीन सिर फिर उगे!', f_head_back:'सिर फिर उगा!',
    f_ravana_call:'रावण ने राक्षस बुलाए!', f_kumbha_stomp:'कुंभकर्ण का प्रहार!', f_kumbha_break:'कुंभकर्ण रेखा पार!', f_maricha_split:'मारीच की माया!',
    f_hp:'❤️ +1 जीवन', f_wave:'लहर {n}', f_boss:' · महाराक्षस!', f_break:'राक्षस रेखा पार!', f_hit_rock:'चट्टान लगी!', f_hit_fire:'अग्नि गोला लगा!',
    f_fire_arrow:'🔥 अग्नि तीर 12 से.!', f_shoot_rock:'चट्टान तोड़ी', f_shoot_fire:'अग्नि गोला तोड़ा', f_shield:'ढाल ने रोका! ऊँचा तीर चलाएँ', f_heads:'सिरों पर वार करें!',
    f_combo:'कॉम्बो ×{n}', f_crit:'घातक!', c_power:'शक्ति {n}%', c_fire:'🔥 अग्नि तीर: {n} से.', c_exposed:' · असुरक्षित {n} से.', c_heads:' · {n}/{m} सिर',
    c_hint:'धनुष खींचने के लिए दबाकर रखें — छोड़कर तीर चलाएँ', wave:'लहर {n}', endless_name:'अयोध्या की रक्षा',
    astra_title:'{name} — {desc} (कुंजी {key})', t_ch_unlock:'🗺️ खुला: {n}', t_modes_unlock:'♾️ अनंत मोड और दैनिक चुनौती खुल गए!',
    lvl_label:'स्तर {n}', lvl_toast:'स्तर {n}: {s}', lvl_meta:'{n} राक्षस · {d}: {h} जीवन', t_diff:'कठिनाई: {n}',
    t_card:'🃏 कार्ड खुला: {n}', t_ach:'🏆 उपलब्धि: {n}', t_ach_claim:'🏆 +{n} सिक्के — {a}', modes_locked:'अध्याय I के बाद खुलेगा',
    ach_sum:'पूर्ण {a}/{b} · {k} राक्षस मारे · सर्वश्रेष्ठ कॉम्बो ×{c} · अनंत: लहर {w}', claim:'{n} लें', claimed:'✔ ले लिया',
    cards_sum:'{a}/{b} कार्ड एकत्र — पहली बार स्तर जीतकर कार्ड खोलें।', card_locked:'बंद',
    max:'अधिकतम', using:'✔ पहना है', use:'पहनें', need_win:'🔒 गेम पूरा करें', t_upgrade:'{n} स्तर {l} पर!',
    t_daily:'🎁 दैनिक उपहार +{n} सिक्के!', t_daily_double:'🎁 दैनिक उपहार दोगुना: +{n}',
    endless_label:'♾️ अयोध्या की रक्षा', endless_toast:'♾️ अनंत — जितना हो सके टिके रहें! रिकॉर्ड: लहर {n}',
    daily_name:'दैनिक चुनौती', daily_label:'⚔️ दैनिक चुनौती', t_daily_win:'⚔️ दैनिक चुनौती पूरी: +{n} सिक्के!',
    share_title:'राक्षस संहारक धनुर्धर', t_copied:'📋 साझा करने का संदेश कॉपी हुआ — सोशल मीडिया पर चिपकाएँ!',
    share_endless:'मैं “राक्षस संहारक धनुर्धर” के अनंत मोड में लहर {n} ({s} अंक) तक टिका — आप कितना टिकेंगे?',
    share_daily:'मैंने राक्षस संहारक धनुर्धर की दैनिक चुनौती “{n}” {s} अंकों से जीती!',
    share_level:'मैंने राक्षस संहारक धनुर्धर में स्तर {n} · {l} {s} अंकों से जीता!',
    share_progress:'मैंने राक्षस संहारक धनुर्धर में {a}/{b} स्तर, {s}⭐ और {c} पात्र कार्ड खोले — राम के साथ राक्षसों का संहार करें!',
    img_wave:'♾️ लहर {n} तक टिके', img_daily:'⚔️ दैनिक चुनौती: {n}', img_level:'🏹 स्तर {n} · {l}', points:'{n} अंक',
    t_img_saved:'🖼️ परिणाम चित्र सहेजा — {n} के साथ पोस्ट करें!'
  }
};

/* ---------- Bản dịch nội dung (data.js). Thiếu mục nào → giữ tiếng Việt ---------- */
var CONTENT = {
  en: {
    diffs: { easy:'Easy', normal:'Normal', hard:'Hard' },
    chars: {
      narrator:{ name:'Narrator' }, vishwamitra:{ name:'Sage Vishwamitra' },
      rama:{ role:'Prince of Ayodhya, bearer of the divine bow Kodanda.' }, lakshmana:{ role:'The loyal brother who never leaves Rama’s side.' },
      sita:{ role:'Princess of Mithila, gentle and steadfast.' }, hanuman:{ role:'The devoted monkey god of matchless strength.' },
      sugriva:{ role:'King of the vanaras, Rama’s ally.' }, jambavan:{ role:'The wise bear king, counsel of the army.' },
      vibhishana:{ role:'Ravana’s brother who chose righteousness.' }, kumbhakarna:{ role:'The sleeping giant, loyal to his brother.' },
      ravana:{ role:'The ten-headed demon king of Lanka.' }
    },
    chapters: [
      { name:'Chapter I · The Sages’ Forest', desc:'Protect Sage Vishwamitra’s ritual from the Rakshasa hordes.' },
      { name:'Chapter II · Panchavati Forest', desc:'The years of exile — and the trap of the golden deer.' },
      { name:'Chapter III · Battlefield of Lanka', desc:'Cross Ram Setu and face the ten-headed demon king.' }
    ],
    levels: [
      { name:'The Forest Ritual', sub:'The first demons rush the altar', story:['Prince Rama and his brother Lakshmana follow Sage Vishwamitra deep into the forest.','The Rakshasas have ruined my rituals for years. Rama, hold the forest edge!','Perform your rites in peace, master. No demon will cross this line.','Drag / hold to aim and charge, release to shoot. Release when the power bar is full for a PERFECT shot!'] },
      { name:'Banks of the Sarayu', sub:'Flying demons over the river', story:['Brother Rama, demons are flying over the river!','Aim a little higher, Lakshmana. A headshot deals critical damage.'] },
      { name:'Subahu’s Raid', sub:'Fast demons charge the altar', story:['Subahu leads the attack! Rama, I grant you the divine Agneyastra.','Every hit builds DIVINE POWER. When it is enough, tap the Astra button (or key 1) to call a rain of fire arrows!'] },
      { name:'Wall of Shields', sub:'Shield demons block every straight shot', story:['They raise shields in front — straight arrows bounce off!','Then we lob our arrows so they fall from above. Golden arrows pierce shields too.'] },
      { name:'The Demoness Tataka', sub:'BOSS: Tataka hurls boulders!', story:['Tataka — who turned this forest into a wasteland — is coming!','Her boulders can be shot down mid-air. Lakshmana, hold the line!'] },
      { name:'The Hut at Panchavati', sub:'Splitters break in two when defeated', story:['For fourteen years of exile, Rama, Sita and Lakshmana live by the Godavari river.','It is so peaceful here… yet I hear roaring in the forest.','I have received the Varunastra — a tidal wave that pushes back ground demons (key 2).'] },
      { name:'Khara & Dushana', sub:'An army of armored demons approaches', story:['Khara and Dushana lead fourteen thousand demons for revenge!','Take Sita to the cave. I will stop them alone.'] },
      { name:'Flying Hordes of Dandaka', sub:'Rakshasa shamans heal their allies', story:['Rakshasa shamans stand at the back healing the horde — take them down first!','Vayavyastra — a divine wind that sweeps away flying demons (key 3).'] },
      { name:'Night at Panchavati', sub:'Every kind of demon attacks at once', story:['Rama… I see a shimmering golden deer at the edge of the forest.','Careful, brother. In this forest, beauty is often a trap.'] },
      { name:'Maricha the Golden Deer', sub:'BOSS: only one deer is real!', story:['The golden deer is really the demon Maricha, sent by Ravana to lure Rama away from Sita.','Illusions flicker; the real one does not. Shooting an illusion breaks your combo!'] },
      { name:'Landing on Lanka', sub:'Cross Ram Setu and stop the vanguard', story:['Ravana has taken Sita to Lanka. The vanara army built Ram Setu across the sea.','My lord, our army has set foot on Lanka!','Sage Agastya gave me the Brahmastra — the ultimate divine weapon (key 4).'] },
      { name:'Gates of Lanka', sub:'The city guard stands thick', story:['I am Ravana’s brother, but I choose righteousness. The southern gate is the weakest!','The vanara army is ready. Give the command, Rama!'] },
      { name:'The Giant Kumbhakarna', sub:'BOSS: Kumbhakarna awakens!', story:['Who dares wake me? …So be it, I will fight for my brother.','He is slow but incredibly tough. Don’t let him reach the line — and aim for the head!'] },
      { name:'Lanka in Flames', sub:'The final all-out assault', story:['Lanka is burning! Ravana throws his entire army into battle.','Just one more battle. Sita, wait for me!'] },
      { name:'Showdown with Ravana', sub:'BOSS: the ten-headed demon king!', story:['My ten heads will grow back forever, prince of Ayodhya!','Destroy all ten heads quickly — when he is exposed, use the Brahmastra!','For Sita, for righteousness — Kodanda, sing!'] }
    ],
    ending: ['The Brahmastra pierces Ravana. The ten-headed king falls and Lanka is freed.','Rama… I knew you would come.','Let us go home, Sita. Ayodhya is lighting lamps for us.','The epic journey continues — watch Ramayana on the big screen!'],
    bosses: { tataka:{ name:'Tataka', intro:'👹 The demoness TATAKA appears!' }, maricha:{ name:'Maricha', intro:'🦌 Golden deer MARICHA — find the real one!' }, kumbha:{ name:'Kumbhakarna', intro:'💤 KUMBHAKARNA has awakened!' }, ravana:{ name:'Ravana', intro:'👑 Demon king RAVANA appears!' } },
    astras: { agneya:'A rain of fire arrows over the battlefield', varuna:'A tidal wave pushes back ground demons', vayavya:'A divine wind sweeps away flyers and fireballs', brahma:'The ultimate weapon — destroys common demons, cripples bosses' },
    upgrades: { hp:['Ayodhya Armor','+1 max health per level.'], charge:['Divine Bowstring','Charge 15% faster per level.'], golden:['Golden Arrows','Golden arrows come 1 shot sooner per level.'], energy:['Meditation','+15 starting divine power per level.'], aim:['Garuda’s Eye','Aim guide 50% longer per level.'] },
    outfits: { saffron:'Royal saffron', vanvas:'Exile bark robe', royal:'Ayodhya ruby', victory:'Triumphant platinum' },
    trails: { none:'Default', lotus:'Lotus petals', azure:'Divine azure', sun:'Halo' },
    ach: {
      first:['First Arrow','Clear level 1.'], kill100:['Exorcist','Slay 100 demons.'], kill500:['Divine Archer','Slay 500 demons.'],
      perfect:['Perfection','Fire 50 perfect shots.'], head:['Critical','Land 50 headshots.'], combo10:['Chain','Reach a ×10 combo.'], combo25:['Arrow Storm','Reach a ×25 combo.'],
      astra10:['Master of Astras','Use divine arrows 10 times.'], ch1:['Ritual Guardian','Complete Chapter I.'], ch2:['Illusion Breaker','Complete Chapter II.'], ch3:['Victory at Lanka','Complete Chapter III.'],
      stars:['Flawless','Earn 3 stars on all 15 levels.'], endless5:['Walls of Ayodhya','Clear wave 5 in Endless.'], endless15:['Impregnable','Clear wave 15 in Endless.'],
      daily1:['Daily Challenger','Complete a daily challenge.'], streak7:['Devotion','Claim gifts 7 days in a row.'], cards:['Collector','Unlock every character card.']
    },
    mods: { swift:['Raging demons','Demons are 25% faster.'], golden:['Golden rain','Every 3rd arrow is golden.'], fragile:['Daredevil','Only 2 health — coins ×2.'], astra:['Overflowing power','Start with 100 divine power.'] }
  },

  hi: {
    diffs: { easy:'आसान', normal:'सामान्य', hard:'कठिन' },
    chars: {
      narrator:{ name:'सूत्रधार' }, vishwamitra:{ name:'ऋषि विश्वामित्र' }, rama:{ name:'राम', role:'अयोध्या के राजकुमार, कोदंड धनुषधारी।' },
      lakshmana:{ name:'लक्ष्मण', role:'वफ़ादार भाई, जो राम का साथ कभी नहीं छोड़ते।' }, sita:{ name:'सीता', role:'मिथिला की राजकुमारी, सौम्य और दृढ़।' },
      hanuman:{ name:'हनुमान', role:'अतुलित बलशाली, समर्पित वानर देव।' }, sugriva:{ name:'सुग्रीव', role:'वानरों के राजा, राम के मित्र।' },
      jambavan:{ name:'जाम्बवान', role:'ज्ञानी रीछराज, सेना के सलाहकार।' }, vibhishana:{ name:'विभीषण', role:'रावण के भाई, जिन्होंने धर्म चुना।' },
      kumbhakarna:{ name:'कुंभकर्ण', role:'सोया हुआ महाकाय, भाई के प्रति वफ़ादार।' }, ravana:{ name:'रावण', role:'लंका का दशानन राक्षसराज।' }
    },
    chapters: [
      { name:'अध्याय I · ऋषियों का वन', desc:'ऋषि विश्वामित्र के यज्ञ की राक्षसों से रक्षा करें।' },
      { name:'अध्याय II · पंचवटी वन', desc:'वनवास के वर्ष — और स्वर्ण मृग का जाल।' },
      { name:'अध्याय III · लंका का रणक्षेत्र', desc:'राम सेतु पार करें, दशानन से अंतिम युद्ध।' }
    ],
    levels: [
      { name:'वन का यज्ञ', sub:'पहले राक्षस यज्ञवेदी की ओर', story:['राजकुमार राम और भाई लक्ष्मण ऋषि विश्वामित्र के साथ घने वन में जाते हैं।','राक्षस वर्षों से मेरे यज्ञ नष्ट कर रहे हैं। राम, वन की सीमा थामे रखो!','गुरुदेव, निश्चिंत होकर यज्ञ करें। कोई राक्षस यह रेखा पार नहीं करेगा।','निशाना लगाने और शक्ति भरने के लिए खींचें / दबाएँ, छोड़कर तीर चलाएँ। पट्टी भरने पर छोड़ें — उत्तम तीर!'] },
      { name:'सरयू का तट', sub:'नदी पर उड़ते राक्षस', story:['भैया राम, नदी पर राक्षस उड़ रहे हैं!','थोड़ा ऊँचा निशाना लगाओ, लक्ष्मण। सिर पर वार घातक होता है।'] },
      { name:'सुबाहु का आक्रमण', sub:'तेज़ राक्षस वेदी की ओर दौड़े', story:['सुबाहु सेना लेकर आया है! राम, मैं तुम्हें आग्नेयास्त्र देता हूँ।','हर वार से दिव्य शक्ति बढ़ती है। पर्याप्त होने पर अस्त्र बटन (या कुंजी 1) दबाकर अग्नि बाण-वर्षा करें!'] },
      { name:'ढालों की दीवार', sub:'ढाल वाले राक्षस सीधे तीर रोकते हैं', story:['वे आगे ढाल उठाए हैं — सीधे तीर लौट आते हैं!','तो हम ऊँचा तीर चलाएँगे, ताकि ऊपर से गिरे। स्वर्ण तीर भी ढाल भेदता है।'] },
      { name:'राक्षसी ताड़का', sub:'महाराक्षस: ताड़का चट्टानें फेंकती है!', story:['ताड़का — जिसने इस वन को उजाड़ दिया — आ रही है!','उसकी चट्टानें हवा में ही तोड़ी जा सकती हैं। लक्ष्मण, रेखा थामे रखो!'] },
      { name:'पंचवटी की कुटिया', sub:'विभाजक हारने पर दो में बँटते हैं', story:['चौदह वर्ष के वनवास में राम, सीता और लक्ष्मण गोदावरी के तट पर रहते हैं।','यहाँ कितनी शांति है… फिर भी वन में गर्जना सुनाई देती है।','मुझे वरुणास्त्र मिला है — जल लहर जो भूमि के राक्षसों को पीछे धकेलती है (कुंजी 2)।'] },
      { name:'खर और दूषण', sub:'कवचधारी राक्षसों की सेना', story:['खर और दूषण चौदह हज़ार राक्षसों के साथ बदला लेने आए हैं!','सीता को गुफा में ले जाओ। मैं अकेले इन्हें रोकूँगा।'] },
      { name:'दंडक के उड़ते राक्षस', sub:'तांत्रिक राक्षस साथियों को ठीक करते हैं', story:['तांत्रिक राक्षस पीछे से झुंड को ठीक कर रहे हैं — पहले उन्हें गिराओ!','वायव्यास्त्र — दिव्य पवन जो उड़ने वाले राक्षसों को उड़ा देती है (कुंजी 3)।'] },
      { name:'पंचवटी की रात', sub:'हर तरह के राक्षस एक साथ', story:['राम… वन के किनारे एक चमकता स्वर्ण मृग दिख रहा है।','सावधान भैया। इस वन में सुंदरता अक्सर जाल होती है।'] },
      { name:'स्वर्ण मृग मारीच', sub:'महाराक्षस: केवल एक मृग असली है!', story:['स्वर्ण मृग असल में राक्षस मारीच है, जिसे रावण ने राम को सीता से दूर करने भेजा।','माया झिलमिलाती है; असली मृग नहीं। माया पर तीर से कॉम्बो टूटता है!'] },
      { name:'लंका पर उतरना', sub:'राम सेतु पार कर अग्रिम सेना रोकें', story:['रावण सीता को लंका ले गया। वानर सेना ने समुद्र पर राम सेतु बनाया।','प्रभु, हमारी सेना लंका पहुँच गई है!','ऋषि अगस्त्य ने मुझे ब्रह्मास्त्र दिया है — परम दिव्य अस्त्र (कुंजी 4)।'] },
      { name:'लंका के द्वार', sub:'नगर रक्षकों की घनी पंक्ति', story:['मैं रावण का भाई हूँ, पर मैंने धर्म चुना है। दक्षिणी द्वार सबसे कमज़ोर है!','वानर सेना तैयार है। आदेश दें, राम!'] },
      { name:'महाकाय कुंभकर्ण', sub:'महाराक्षस: कुंभकर्ण जाग उठा!', story:['किसने मुझे जगाया? …ठीक है, मैं अपने भाई के लिए लड़ूँगा।','वह धीमा है पर बहुत मज़बूत। उसे रेखा तक मत पहुँचने दो — और सिर पर निशाना लगाओ!'] },
      { name:'जलती लंका', sub:'अंतिम पूर्ण आक्रमण', story:['लंका जल रही है! रावण ने पूरी सेना झोंक दी है।','बस एक युद्ध और। सीता, मेरी प्रतीक्षा करो!'] },
      { name:'रावण से महायुद्ध', sub:'महाराक्षस: दशानन राक्षसराज!', story:['मेरे दस सिर हमेशा फिर उग आएँगे, अयोध्या के राजकुमार!','दसों सिर जल्दी गिराओ — जब वह असुरक्षित हो, ब्रह्मास्त्र चलाओ!','सीता के लिए, धर्म के लिए — कोदंड, गर्जना करो!'] }
    ],
    ending: ['ब्रह्मास्त्र रावण को भेद देता है। दशानन गिरता है और लंका मुक्त होती है।','राम… मुझे पता था आप आएँगे।','चलो घर चलें, सीता। अयोध्या हमारे लिए दीप जला रही है।','महाकाव्य यात्रा जारी है — रामायण बड़े पर्दे पर देखें!'],
    bosses: { tataka:{ name:'ताड़का', intro:'👹 राक्षसी ताड़का प्रकट हुई!' }, maricha:{ name:'मारीच', intro:'🦌 स्वर्ण मृग मारीच — असली को खोजें!' }, kumbha:{ name:'कुंभकर्ण', intro:'💤 कुंभकर्ण जाग उठा!' }, ravana:{ name:'रावण', intro:'👑 राक्षसराज रावण प्रकट हुआ!' } },
    astraNames: { agneya:'आग्नेयास्त्र', varuna:'वरुणास्त्र', vayavya:'वायव्यास्त्र', brahma:'ब्रह्मास्त्र' },
    astras: { agneya:'रणभूमि पर अग्नि बाणों की वर्षा', varuna:'जल लहर भूमि के राक्षसों को पीछे धकेलती है', vayavya:'दिव्य पवन उड़ने वाले राक्षस और अग्नि गोले उड़ा देती है', brahma:'परम अस्त्र — सामान्य राक्षसों का नाश, महाराक्षस को भारी क्षति' },
    upgrades: { hp:['अयोध्या कवच','हर स्तर पर +1 अधिकतम जीवन।'], charge:['दिव्य प्रत्यंचा','हर स्तर पर 15% तेज़ शक्ति।'], golden:['स्वर्ण तीर','हर स्तर पर स्वर्ण तीर 1 तीर पहले।'], energy:['ध्यान','हर स्तर पर +15 आरंभिक दिव्य शक्ति।'], aim:['गरुड़ दृष्टि','हर स्तर पर निशाना पथ 50% लंबा।'] },
    outfits: { saffron:'राजसी केसरिया', vanvas:'वनवास वल्कल', royal:'अयोध्या माणिक', victory:'विजयी प्लैटिनम' },
    trails: { none:'सामान्य', lotus:'कमल पंखुड़ियाँ', azure:'दिव्य नीला', sun:'प्रभामंडल' },
    ach: {
      first:['पहला तीर','स्तर 1 पूरा करें।'], kill100:['राक्षस निवारक','100 राक्षस मारें।'], kill500:['दिव्य धनुर्धर','500 राक्षस मारें।'],
      perfect:['उत्तमता','50 उत्तम तीर चलाएँ।'], head:['घातक','50 बार सिर पर वार।'], combo10:['श्रृंखला','×10 कॉम्बो पाएँ।'], combo25:['बाण वर्षा','×25 कॉम्बो पाएँ।'],
      astra10:['अस्त्र स्वामी','10 बार दिव्य अस्त्र चलाएँ।'], ch1:['यज्ञ रक्षक','अध्याय I पूरा करें।'], ch2:['माया भंजक','अध्याय II पूरा करें।'], ch3:['लंका विजय','अध्याय III पूरा करें।'],
      stars:['निर्दोष','सभी 15 स्तरों पर 3 तारे।'], endless5:['अयोध्या की दीवार','अनंत मोड में लहर 5 पार करें।'], endless15:['अजेय','अनंत मोड में लहर 15 पार करें।'],
      daily1:['दैनिक योद्धा','एक दैनिक चुनौती पूरी करें।'], streak7:['निष्ठा','लगातार 7 दिन उपहार लें।'], cards:['संग्राहक','सभी पात्र कार्ड खोलें।']
    },
    mods: { swift:['क्रोधित राक्षस','राक्षस 25% तेज़।'], golden:['स्वर्ण वर्षा','हर तीसरा तीर स्वर्ण।'], fragile:['दुस्साहसी','केवल 2 जीवन — सिक्के ×2।'], astra:['असीम शक्ति','100 दिव्य शक्ति से शुरुआत।'] }
  }
};

/* ---------- chọn ngôn ngữ: đã lưu → trình duyệt (vi / hi, còn lại en) ---------- */
function detectLang(){
  if(S.lang && STR[S.lang]) return S.lang;
  var n = (navigator.language || 'vi').toLowerCase();
  return n.indexOf('vi') === 0 ? 'vi' : (n.indexOf('hi') === 0 ? 'hi' : 'en');
}
var LANG = detectLang();
var LOCALE = LANGS.filter(function(l){ return l.id === LANG; })[0].locale;
function t(key, vars){
  var s = (STR[LANG] && STR[LANG][key]) != null ? STR[LANG][key] : (STR.vi[key] != null ? STR.vi[key] : key);
  if(vars) s = s.replace(/\{(\w+)\}/g, function(m, k){ return vars[k] != null ? vars[k] : m; });
  return s;
}

/* áp bản dịch nội dung thẳng vào dữ liệu trong data.js */
function applyContent(){
  var P = CONTENT[LANG]; if(!P) return;
  var k;
  if(P.diffs) for(k in P.diffs) if(DIFFS[k]) DIFFS[k].name = P.diffs[k];
  if(P.chars) for(k in P.chars) if(CHARACTERS[k]){ if(P.chars[k].name) CHARACTERS[k].name = P.chars[k].name; if(P.chars[k].role) CHARACTERS[k].role = P.chars[k].role; }
  if(P.chapters) P.chapters.forEach(function(c, i){ if(CHAPTERS[i]){ CHAPTERS[i].name = c.name; CHAPTERS[i].desc = c.desc; } });
  if(P.levels) P.levels.forEach(function(l, i){
    var L = LEVELS[i]; if(!L) return;
    L.name = l.name; L.sub = l.sub;
    if(l.story && L.story) L.story = L.story.map(function(ln, j){ return [ln[0], l.story[j] || ln[1]]; });
  });
  if(P.ending) for(var e = 0; e < ENDING.length; e++) if(P.ending[e]) ENDING[e] = [ENDING[e][0], P.ending[e]];
  if(P.bosses) for(k in P.bosses) if(BOSSES[k]){ BOSSES[k].name = P.bosses[k].name; BOSSES[k].intro = P.bosses[k].intro; }
  ASTRAS.forEach(function(A){ if(P.astras && P.astras[A.id]) A.desc = P.astras[A.id]; if(P.astraNames && P.astraNames[A.id]) A.name = P.astraNames[A.id]; });
  UPGRADES.forEach(function(u){ var x = P.upgrades && P.upgrades[u.id]; if(x){ u.name = x[0]; u.desc = x[1]; } });
  OUTFITS.forEach(function(o){ if(P.outfits && P.outfits[o.id]) o.name = P.outfits[o.id]; });
  TRAILS.forEach(function(o){ if(P.trails && P.trails[o.id]) o.name = P.trails[o.id]; });
  ACHIEVEMENTS.forEach(function(a){ var x = P.ach && P.ach[a.id]; if(x){ a.name = x[0]; a.desc = x[1]; } });
  DAILY_MODS.forEach(function(m){ var x = P.mods && P.mods[m.id]; if(x){ m.name = x[0]; m.desc = x[1]; } });
}
/* HTML tĩnh */
function applyStatic(){
  document.documentElement.lang = LANG;
  document.title = t('doc_title');
  document.querySelectorAll('[data-i18n]').forEach(function(n){ n.textContent = t(n.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-html]').forEach(function(n){ n.innerHTML = t(n.getAttribute('data-i18n-html')); });
  document.querySelectorAll('[data-i18n-title]').forEach(function(n){ var v = t(n.getAttribute('data-i18n-title')); n.title = v; n.setAttribute('aria-label', v); });
}
applyContent();
applyStatic();
