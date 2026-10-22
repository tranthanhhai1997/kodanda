"use strict";
/* ============================================================
   DỮ LIỆU & CÂN BẰNG — độ khó, nhân vật, chương, màn, boss, thần tiễn
   ============================================================ */
var DIFFS = {
  easy:   { name:'Dễ',     hp:5, speed:0.85, spawn:1.15, coinMul:1,   scoreMul:1,   bossHp:0.8 },
  normal: { name:'Thường', hp:4, speed:1.0,  spawn:1.0,  coinMul:1,   scoreMul:1,   bossHp:1 },
  hard:   { name:'Khó',    hp:3, speed:1.2,  spawn:0.85, coinMul:1.5, scoreMul:1.5, bossHp:1.3 }
};

/* ---------- Nhân vật hội thoại (chân dung tái dùng từ RamSetu) ---------- */
var CHARACTERS = {
  narrator:    { name:'Người kể chuyện', color:'#c9a46a', img:'img/portraits/narrator.webp' },
  rama:        { name:'Rama',            color:'#5b8dff', img:'img/portraits/rama.webp', role:'Hoàng tử Ayodhya, chủ nhân cây cung thần Kodanda.' },
  lakshmana:   { name:'Lakshmana',       color:'#e0675c', img:'img/portraits/lakshmana.webp', role:'Người em trung thành, không rời Rama nửa bước.' },
  vishwamitra: { name:'Đạo sĩ Vishwamitra', color:'#f0a54a', icon:'🔥' },
  sita:        { name:'Sita',            color:'#e86aa8', img:'img/portraits/sita.webp', role:'Công chúa xứ Mithila, hiền thục và kiên cường.' },
  hanuman:     { name:'Hanuman',         color:'#f08a3e', img:'img/portraits/hanuman.webp', role:'Thần khỉ trung thành, sức mạnh vô song.' },
  sugriva:     { name:'Sugriva',         color:'#e0b54a', img:'img/portraits/sugriva.webp', role:'Vua của tộc vanara, đồng minh của Rama.' },
  jambavan:    { name:'Jambavan',        color:'#b59a82', img:'img/portraits/jambavan.webp', role:'Vua gấu thông thái, mưu sĩ của đại quân.' },
  vibhishana:  { name:'Vibhishana',      color:'#a68ae0', img:'img/portraits/vibhishana.webp', role:'Em trai Ravana, người chọn chính nghĩa.' },
  kumbhakarna: { name:'Kumbhakarna',     color:'#9b86b8', img:'img/portraits/kumbhakarna.webp', role:'Gã khổng lồ ngủ say, trung thành với anh trai.' },
  ravana:      { name:'Ravana',          color:'#ff5d6c', img:'img/portraits/ravana.webp', role:'Quỷ vương mười đầu của đảo Lanka.' }
};

/* ---------- Chương ---------- */
var CHAPTERS = [
  { name:'Chương I · Khu rừng đạo sĩ', desc:'Bảo vệ lễ tế của đạo sĩ Vishwamitra khỏi bầy Rakshasa.' },
  { name:'Chương II · Rừng Panchavati', desc:'Những năm lưu đày — và cạm bẫy của con nai vàng.' },
  { name:'Chương III · Chiến trường Lanka', desc:'Vượt cầu Ram Setu, quyết chiến quỷ vương mười đầu.' }
];

/* ---------- Màn chơi ----------
   total: số quỷ (boss tính 1) · interval: giây giữa 2 lần sinh quỷ · speed: tốc độ cơ bản
   mix: tỉ lệ loại quỷ (ground, fly, fast, armor, shield, splitter, shaman) · boss: id trong BOSSES
   card: thẻ nhân vật mở khi thắng lần đầu · story: hội thoại trước màn (chỉ hiện lần đầu) */
var LEVELS = [
  { ch:0, name:'Lễ tế bìa rừng', card:'rama', sub:'Bầy quỷ đầu tiên tràn tới đàn tế', total:12, interval:1.9, speed:26, mix:{ground:1}, sky:'dawn',
    story:[['narrator','Hoàng tử Rama và em trai Lakshmana theo đạo sĩ Vishwamitra vào rừng sâu.'],
           ['vishwamitra','Bầy Rakshasa phá hoại lễ tế của ta suốt nhiều năm. Hỡi Rama, hãy giữ vững bìa rừng!'],
           ['rama','Xin thầy yên tâm hành lễ. Không con quỷ nào vượt qua được vạch này.'],
           ['narrator','Kéo / chạm giữ để ngắm và dồn lực, thả ra để bắn. Thả đúng lúc thanh lực đầy để có phát bắn HOÀN HẢO!']] },
  { ch:0, name:'Bờ sông Sarayu', sub:'Quỷ bay lượn trên mặt nước', total:16, interval:1.7, speed:30, mix:{ground:.7, fly:.3}, sky:'day',
    story:[['lakshmana','Anh Rama, có quỷ bay trên mặt sông!'],
           ['rama','Ngắm cao lên một chút, Lakshmana. Bắn trúng đầu sẽ gây sát thương chí mạng.']] },
  { ch:0, name:'Subahu tập kích', sub:'Quỷ tốc độ lao tới đàn tế', total:18, interval:1.6, speed:32, mix:{ground:.5, fly:.25, fast:.25}, sky:'day',
    story:[['vishwamitra','Subahu dẫn quân tới rồi! Rama, ta trao cho con thần tiễn Agneyastra.'],
           ['narrator','Mỗi phát trúng tích THẦN LỰC. Đủ thần lực, bấm nút Astra (hoặc phím 1) để gọi mưa tên lửa!']] },
  { ch:0, name:'Tường khiên Rakshasa', card:'lakshmana', sub:'Quỷ khiên chặn mọi mũi tên bắn thẳng', total:20, interval:1.5, speed:33, mix:{ground:.4, fly:.2, fast:.15, shield:.25}, sky:'dusk',
    story:[['lakshmana','Chúng giơ khiên chắn phía trước, tên bắn thẳng đều bật ra!'],
           ['rama','Vậy ta bắn vòng cầu — để mũi tên rơi từ trên xuống. Tên vàng cũng xuyên được khiên.']] },
  { ch:0, name:'Nữ quỷ Tataka', sub:'BOSS: Tataka ném đá tảng!', total:14, interval:1.7, speed:30, mix:{ground:.5, fast:.2, shield:.3}, sky:'dusk', boss:'tataka',
    story:[['vishwamitra','Tataka — kẻ đã biến khu rừng thành hoang địa — đang tới!'],
           ['rama','Đá tảng của mụ có thể bắn vỡ giữa trời. Lakshmana, giữ vạch phòng thủ!']] },

  { ch:1, name:'Túp lều Panchavati', card:'sita', sub:'Quỷ phân thân tách làm hai khi bị hạ', total:20, interval:1.5, speed:34, mix:{ground:.35, fly:.3, fast:.15, splitter:.2}, sky:'dawn',
    story:[['narrator','Mười bốn năm lưu đày, Rama, Sita và Lakshmana dựng lều bên sông Godavari.'],
           ['sita','Nơi đây thật yên bình… nhưng thiếp nghe tiếng gầm trong rừng.'],
           ['rama','Ta vừa nhận thêm Varunastra — sóng thần đẩy lùi quỷ mặt đất (phím 2).']] },
  { ch:1, name:'Khara & Dushana', sub:'Đại quân quỷ giáp kéo tới', total:24, interval:1.4, speed:35, mix:{ground:.3, fly:.2, fast:.15, armor:.15, splitter:.2}, sky:'day',
    story:[['lakshmana','Khara và Dushana dẫn mười bốn nghìn quỷ tới báo thù!'],
           ['rama','Đưa Sita vào hang đá an toàn. Một mình ta sẽ chặn chúng.']] },
  { ch:1, name:'Bầy quỷ bay Dandaka', sub:'Pháp sư Rakshasa hồi máu cho đồng bọn', total:24, interval:1.35, speed:36, mix:{fly:.45, ground:.2, fast:.2, shaman:.15}, sky:'dusk',
    story:[['narrator','Pháp sư Rakshasa đứng phía sau hồi sức cho bầy quỷ — hãy hạ chúng trước!'],
           ['rama','Vayavyastra — cơn gió thần quét sạch quỷ bay (phím 3).']] },
  { ch:1, name:'Đêm Panchavati', sub:'Mọi loại quỷ cùng xuất trận', total:26, interval:1.3, speed:37, mix:{ground:.25, fly:.25, armor:.15, shield:.15, shaman:.1, splitter:.1}, sky:'night',
    story:[['sita','Rama… thiếp thấy một con nai vàng lấp lánh ngoài bìa rừng.'],
           ['lakshmana','Cẩn thận, anh Rama. Trong rừng này, cái đẹp thường là cạm bẫy.']] },
  { ch:1, name:'Nai vàng Maricha', sub:'BOSS: chỉ một con nai là thật!', total:16, interval:1.5, speed:34, mix:{ground:.4, fly:.3, fast:.3}, sky:'dusk', boss:'maricha',
    story:[['narrator','Con nai vàng thực ra là quỷ Maricha, được Ravana sai tới để dụ Rama rời xa Sita.'],
           ['rama','Ảo ảnh nhấp nháy, còn con thật thì không. Bắn nhầm ảo ảnh sẽ mất combo!']] },

  { ch:2, name:'Đổ bộ Lanka', card:'hanuman', sub:'Vượt cầu Ram Setu, chặn quân tiên phong', total:26, interval:1.3, speed:38, mix:{ground:.25, fly:.2, fast:.15, armor:.15, shield:.15, splitter:.1}, sky:'storm',
    story:[['narrator','Sita đã bị Ravana bắt về Lanka. Đại quân vanara xây cầu Ram Setu vượt biển.'],
           ['hanuman','Thưa chủ nhân, quân ta đã đặt chân lên Lanka!'],
           ['rama','Đạo sĩ Agastya đã trao cho ta Brahmastra — thần tiễn tối thượng (phím 4).']] },
  { ch:2, name:'Cổng thành Lanka', card:'vibhishana', sub:'Quân thủ thành dày đặc', total:28, interval:1.2, speed:39, mix:{ground:.2, fly:.2, fast:.15, armor:.15, shield:.15, shaman:.15}, sky:'sunset',
    story:[['vibhishana','Ta là em trai Ravana, nhưng ta chọn chính nghĩa. Cổng thành phía nam yếu nhất!'],
           ['sugriva','Đại quân vanara sẵn sàng. Xin Rama ra lệnh!']] },
  { ch:2, name:'Gã khổng lồ Kumbhakarna', card:'kumbhakarna', sub:'BOSS: Kumbhakarna thức giấc!', total:18, interval:1.5, speed:36, mix:{ground:.4, armor:.3, splitter:.3}, sky:'sunset', boss:'kumbha',
    story:[['kumbhakarna','Ai dám đánh thức ta? …Được, ta sẽ chiến đấu vì anh trai ta.'],
           ['jambavan','Hắn chậm nhưng cực kỳ trâu. Đừng để hắn chạm vạch — và nhắm vào đầu!']] },
  { ch:2, name:'Lửa thành Lanka', card:'sugriva', sub:'Đợt tấn công tổng lực cuối cùng', total:32, interval:1.1, speed:40, mix:{ground:.2, fly:.2, fast:.15, armor:.15, shield:.1, splitter:.1, shaman:.1}, sky:'lanka',
    story:[['hanuman','Lanka đang bốc cháy! Ravana dồn toàn bộ quân ra trận.'],
           ['rama','Chỉ còn một trận nữa thôi. Sita, đợi ta!']] },
  { ch:2, name:'Quyết chiến Ravana', card:'ravana', sub:'BOSS: quỷ vương mười đầu!', total:16, interval:1.6, speed:38, mix:{ground:.45, fly:.3, armor:.25}, sky:'storm', boss:'ravana',
    story:[['ravana','Mười cái đầu của ta sẽ mọc lại mãi mãi, hoàng tử Ayodhya!'],
           ['vibhishana','Phải hạ cả mười đầu thật nhanh — khi hắn lộ điểm yếu, hãy dùng Brahmastra!'],
           ['rama','Vì Sita, vì chính nghĩa — Kodanda, hãy cất tiếng!']] }
];

var ENDING = [
  ['narrator','Mũi Brahmastra xuyên qua Ravana. Quỷ vương mười đầu gục ngã, Lanka được giải phóng.'],
  ['sita','Rama… thiếp biết chàng sẽ đến.'],
  ['rama','Chúng ta về nhà thôi, Sita. Ayodhya đang thắp đèn chờ đợi.'],
  ['narrator','Hành trình sử thi vẫn còn tiếp diễn — hãy đón xem Ramayana trên màn ảnh rộng!']
];

/* ---------- Boss ----------
   hp: sinh lực ở độ khó Thường (nhân DIFFS.bossHp) · Ravana: hp là mỗi đầu × 10 đầu, core là điểm yếu */
var BOSSES = {
  tataka:  { name:'Tataka',      r:46, hp:14, coin:80,  ground:true,  intro:'👹 Nữ quỷ TATAKA xuất hiện!' },
  maricha: { name:'Maricha',     r:30, hp:10, coin:90,  ground:true,  intro:'🦌 Nai vàng MARICHA — tìm con thật!' },
  kumbha:  { name:'Kumbhakarna', r:62, hp:30, coin:120, ground:true,  intro:'💤 KUMBHAKARNA đã thức giấc!' },
  ravana:  { name:'Ravana',      r:52, hp:2,  core:6, coin:200, ground:false, intro:'👑 Quỷ vương RAVANA xuất hiện!' }
};

/* ---------- Thần tiễn (Astra) ----------
   cost: thần lực cần (0–100) · from: mở khóa từ màn (chỉ số 0) · key: phím tắt */
var ASTRAS = [
  { id:'agneya',  name:'Agneyastra',  icon:'🔥', cost:50,  from:2,  key:'1', color:'#ffb27a', desc:'Mưa tên lửa trút xuống chiến trường' },
  { id:'varuna',  name:'Varunastra',  icon:'🌊', cost:60,  from:5,  key:'2', color:'#7cc8ff', desc:'Sóng thần đẩy lùi quỷ mặt đất' },
  { id:'vayavya', name:'Vayavyastra', icon:'🌪️', cost:40,  from:7,  key:'3', color:'#c8f0e0', desc:'Gió thần quét sạch quỷ bay và cầu lửa' },
  { id:'brahma',  name:'Brahmastra',  icon:'☀️', cost:100, from:10, key:'4', color:'#ffe9a8', desc:'Thần tiễn tối thượng — diệt mọi quỷ thường, trọng thương boss' }
];
var ENERGY = { start:20, hit:6, crit:4, combo5:10 };   // thần lực nhận được

var SKIES = {
  dawn:   ['#2b3a67','#7a5a8c','#e8907c'], day:['#3a6ea8','#7fb2d9','#cfe8f5'],
  dusk:   ['#2e2a5e','#8c4a6e','#f0925c'], sunset:['#3a2350','#a83e5c','#ff8a4d'],
  night:  ['#0a1030','#1d2a55','#3c4a7a'], storm:['#141126','#33244d','#5c3a6e'],
  lanka:  ['#2a0d1f','#8f3426','#ff6a3d']
};

/* ============================================================
   META — cửa hàng, quà ngày, thành tựu, chế độ chơi
   ============================================================ */
var SHARE = { url:'https://tranthanhhai1997.github.io/kodanda/', hashtag:'#KodandaChallenge', ramsetu:'https://tranthanhhai1997.github.io/ram-setu/' };   // url rỗng = dùng địa chỉ trang hiện tại

/* Nâng cấp cung — prices[i]: giá lên cấp i+1 */
var UPGRADES = [
  { id:'hp',     icon:'🛡️', name:'Giáp Ayodhya',     desc:'+1 sinh lực tối đa mỗi cấp.',                 prices:[300, 800] },
  { id:'charge', icon:'🏹', name:'Dây cung thần',    desc:'Dồn lực nhanh hơn 15% mỗi cấp.',               prices:[200, 450, 900] },
  { id:'golden', icon:'✨', name:'Tên vàng',         desc:'Tên vàng xuất hiện sớm hơn 1 phát mỗi cấp.',   prices:[400, 1000] },
  { id:'energy', icon:'🔆', name:'Thiền định',       desc:'+15 thần lực khởi đầu mỗi cấp.',               prices:[250, 600, 1200] },
  { id:'aim',    icon:'🦅', name:'Mắt Garuda',       desc:'Đường ngắm dài thêm 50% mỗi cấp.',             prices:[200, 500] },
  { id:'ally',   icon:'🗡️', name:'Lakshmana trợ chiến', desc:'Lakshmana quỳ cạnh Rama, tự bắn hỗ trợ; cấp 2 bắn nhanh hơn.', prices:[600, 1500] }
];
/* Trang phục Rama — màu cho bản vẽ bằng code, filter (bộ lọc CSS) cho ảnh Rama */
var OUTFITS = [
  { id:'saffron', name:'Áo nghệ hoàng gia', price:0,    torso:'#e8862e', sash:'#c93b2e', dhoti:'#e8dfc8', crown:'#f5b942', filter:null },
  { id:'vanvas',  name:'Áo vỏ cây lưu đày', price:400,  torso:'#8a6a3a', sash:'#5a7a3a', dhoti:'#c8b48a', crown:'#c8a46a', filter:'sepia(.6) saturate(.75) brightness(.9)' },
  { id:'royal',   name:'Hồng ngọc Ayodhya', price:700,  torso:'#d8443a', sash:'#f5b942', dhoti:'#f2ecd9', crown:'#ffd97a', filter:'hue-rotate(-35deg) saturate(1.35)' },
  { id:'victory', name:'Bạch kim khải hoàn',price:1200, torso:'#f2ecd9', sash:'#d6559a', dhoti:'#fff8e8', crown:'#ffe9a8', filter:'saturate(.2) brightness(1.18)', needWin:true }
];
/* Vệt tên */
var TRAILS = [
  { id:'none',  name:'Mặc định',    price:0,   color:null },
  { id:'lotus', name:'Cánh sen',    price:300, color:'#ff8fc8' },
  { id:'azure', name:'Lam thần',    price:500, color:'#7cc8ff' },
  { id:'sun',   name:'Hào quang',   price:900, color:'#ffe066' }
];

var DAILY_REWARDS = [50, 75, 100, 125, 150, 200, 400];   // xu theo ngày liên tiếp (lặp lại sau 7 ngày)

/* Thành tựu — test(s): s là dữ liệu lưu */
var ACHIEVEMENTS = [
  { id:'first',   icon:'🏹', name:'Mũi tên đầu tiên',  desc:'Hoàn thành màn 1.',                    reward:50,  test:function(s){ return (s.stars[0] || 0) > 0; } },
  { id:'kill100', icon:'👹', name:'Trừ tà',            desc:'Diệt 100 quỷ.',                        reward:100, test:function(s){ return s.stats.kills >= 100; } },
  { id:'kill500', icon:'🔱', name:'Thần tiễn thủ',     desc:'Diệt 500 quỷ.',                        reward:300, test:function(s){ return s.stats.kills >= 500; } },
  { id:'perfect', icon:'🎯', name:'Hoàn hảo',          desc:'Bắn 50 phát hoàn hảo.',                reward:120, test:function(s){ return s.stats.perfects >= 50; } },
  { id:'head',    icon:'💥', name:'Chí mạng',          desc:'Bắn trúng đầu 50 lần.',                reward:120, test:function(s){ return s.stats.headshots >= 50; } },
  { id:'combo10', icon:'🔥', name:'Liên hoàn',         desc:'Đạt combo ×10.',                       reward:100, test:function(s){ return s.stats.bestCombo >= 10; } },
  { id:'combo25', icon:'☄️', name:'Mưa tên',           desc:'Đạt combo ×25.',                       reward:250, test:function(s){ return s.stats.bestCombo >= 25; } },
  { id:'astra10', icon:'☀️', name:'Chủ nhân thần tiễn',desc:'Dùng thần tiễn 10 lần.',               reward:120, test:function(s){ return s.stats.astras >= 10; } },
  { id:'ch1',     icon:'🌳', name:'Bảo vệ lễ tế',      desc:'Hoàn thành Chương I.',                 reward:200, test:function(s){ return (s.stars[4] || 0) > 0; } },
  { id:'ch2',     icon:'🦌', name:'Phá ảo ảnh',        desc:'Hoàn thành Chương II.',                reward:300, test:function(s){ return (s.stars[9] || 0) > 0; } },
  { id:'ch3',     icon:'👑', name:'Chiến thắng Lanka', desc:'Hoàn thành Chương III.',               reward:600, test:function(s){ return (s.stars[14] || 0) > 0; } },
  { id:'stars',   icon:'⭐', name:'Toàn mỹ',           desc:'Đạt 3 sao ở cả 15 màn.',               reward:800, test:function(s){ return Object.keys(s.stars).filter(function(k){ return s.stars[k] >= 3; }).length >= LEVELS.length; } },
  { id:'endless5',icon:'♾️', name:'Tường thành Ayodhya',desc:'Trụ qua đợt 5 ở chế độ Vô tận.',      reward:150, test:function(s){ return s.endlessBest >= 5; } },
  { id:'endless15',icon:'🏰',name:'Bất khả xâm phạm',  desc:'Trụ qua đợt 15 ở chế độ Vô tận.',      reward:500, test:function(s){ return s.endlessBest >= 15; } },
  { id:'daily1',  icon:'⚔️', name:'Thử thách ngày',    desc:'Hoàn thành một Thử thách ngày.',       reward:80,  test:function(s){ return s.stats.dailyWins >= 1; } },
  { id:'streak7', icon:'📅', name:'Chuyên cần',        desc:'Nhận quà 7 ngày liên tiếp.',           reward:200, test:function(s){ return s.daily.streak >= 7; } },
  { id:'cards',   icon:'🃏', name:'Nhà sưu tầm',       desc:'Mở toàn bộ thẻ nhân vật.',             reward:300, test:function(s){ return s.cards.length >= CARD_ORDER.length; } }
];
var CARD_ORDER = ['rama', 'lakshmana', 'sita', 'hanuman', 'vibhishana', 'sugriva', 'jambavan', 'kumbhakarna', 'ravana'];
var ENDLESS_CARD = { wave:10, card:'jambavan' };   // thẻ thưởng ở chế độ Vô tận

/* Thử thách ngày: điều kiện đặc biệt chọn theo ngày */
var DAILY_MODS = [
  { id:'swift',   name:'Quỷ cuồng nộ', desc:'Quỷ nhanh hơn 25%.' },
  { id:'golden',  name:'Mưa tên vàng', desc:'Cứ 3 phát lại có 1 tên vàng.' },
  { id:'fragile', name:'Liều lĩnh',    desc:'Chỉ 2 sinh lực — xu nhận được ×2.' },
  { id:'astra',   name:'Thần lực tràn đầy', desc:'Bắt đầu với 100 thần lực.' }
];
var DAILY_WIN_REWARD = 200;

/* ============================================================
   ẢNH MINH HỌA — để trống / thiếu file thì game tự vẽ bằng code
   demons.<type|bossId>: { src, h (chiều cao vẽ), flip (ảnh gốc quay mặt sang phải) }
   bg.<sky>: ảnh nền 960×540 thay cho nền vẽ bằng code
   ============================================================ */
var ART = {
  cover: 'img/ui/cover.webp',
  emblem: 'img/ui/emblem.webp',
  fireball: 'img/ui/fireball.webp',
  // Rama: grip = vị trí tay cầm cung (tỉ lệ theo ảnh), foot = tâm bàn chân theo chiều ngang
  rama: { h:150, idle:  { src:'img/sprites/rama_idle.webp',    foot:.5  },
                 draw:  { src:'img/sprites/rama_draw.webp',    foot:.42, grip:[.88, .29] },
                 release:{ src:'img/sprites/rama_release.webp', foot:.45 } },
  // k: chiều cao vẽ = r × k · flip: ảnh gốc quay mặt sang phải · center: neo giữa (quỷ bay)
  // tints: biến thể màu (bộ lọc CSS) chọn ngẫu nhiên cho từng con · srcs: nhiều ảnh khác nhau, chọn ngẫu nhiên
  demons: {
    ground:   { srcs:['img/sprites/demon_ground_1.webp', 'img/sprites/demon_ground_2.webp', 'img/sprites/demon_ground_3.webp'], k:3.2 },
    armor:    { src:'img/sprites/demon_armor.webp',    k:3.2 },
    fast:     { src:'img/sprites/demon_fast.webp',     k:3.2, tints:[null, 'hue-rotate(-30deg)', 'hue-rotate(250deg) saturate(1.2)'] },
    fly:      { src:'img/sprites/demon_fly.webp',      k:4.2, center:true, tints:[null, 'hue-rotate(160deg)', 'hue-rotate(-90deg)'] },
    shield:   { src:'img/sprites/demon_shield.webp',   k:3.3 },
    splitter: { src:'img/sprites/demon_splitter.webp', k:3.3 },
    shaman:   { src:'img/sprites/demon_shaman.webp',   k:3.6 },
    tataka:   { src:'img/sprites/boss_tataka.webp',    k:3.7 },
    maricha:  { src:'img/sprites/boss_maricha.webp',   k:3.9 },
    decoy:    { src:'img/sprites/boss_maricha.webp',   k:3.9 },
    kumbha:   { src:'img/sprites/boss_kumbhakarna.webp', k:3.2 }
  },
  // Lakshmana trợ chiến (nâng cấp 'ally'): x = tâm chân, grip = tay cầm cung (tỉ lệ ảnh)
  ally: { src:'img/sprites/ally_lakshmana.webp', h:112, x:205, grip:[.93, .33] },
  // Ravana: heads = tâm từng đầu (tỉ lệ theo ảnh), hr = bán kính đầu, chest = điểm yếu
  ravana: { src:'img/sprites/boss_ravana.webp', h:300, hr:.05, chest:[.5, .36],
            heads:[[.144,.145],[.228,.137],[.306,.134],[.389,.122],[.5,.111],[.606,.122],[.683,.134],[.761,.137],[.839,.145]] },
  bg: { dawn:'img/bg/dawn.webp', day:'img/bg/day.webp', dusk:'img/bg/dusk.webp', sunset:'img/bg/sunset.webp',
        night:'img/bg/night.webp', storm:'img/bg/storm.webp', lanka:'img/bg/lanka.webp' }
};
