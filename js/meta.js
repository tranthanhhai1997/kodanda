"use strict";
/* ============================================================
   META — cửa hàng, quà ngày, thành tựu, thẻ nhân vật,
   chế độ Vô tận / Thử thách ngày, chia sẻ, toàn màn hình
   ============================================================ */
OVERLAYS.push('shopOverlay', 'journeyOverlay', 'dailyOverlay');
function modesUnlocked(){ return S.unlocked > 5; }   // sau khi qua Chương I
function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }

/* ---------------- thẻ nhân vật ---------------- */
function unlockCard(id){
  if(S.cards.indexOf(id) >= 0) return;
  S.cards.push(id); saveGame();
  setTimeout(function(){ toast(t('t_card', { n: CHARACTERS[id].name })); }, 1400);
}

/* ---------------- thành tựu: 1 = đã đạt (chờ nhận), 2 = đã nhận ---------------- */
function checkAchievements(){
  var fresh = [];
  ACHIEVEMENTS.forEach(function(a){ if(!S.ach[a.id] && a.test(S)){ S.ach[a.id] = 1; fresh.push(a); } });
  if(fresh.length){ saveGame(); setTimeout(function(){ toast(t('t_ach', { n: fresh.map(function(a){ return a.name; }).join(', ') })); }, 2000); }
  refreshBadges();
}
function claimAch(id){
  var a = ACHIEVEMENTS.filter(function(x){ return x.id === id; })[0];
  if(!a || S.ach[id] !== 1) return;
  S.ach[id] = 2; addCoins(a.reward); sCoin();
  toast(t('t_ach_claim', { n: a.reward, a: a.name }));
  checkAchievements(); renderJourney();
}
function refreshBadges(){
  var n = ACHIEVEMENTS.filter(function(a){ return S.ach[a.id] === 1; }).length;
  el('journeyBadge').textContent = n; el('journeyBadge').hidden = !n;
  el('dailyDot').hidden = S.daily.lastClaim === todayStr();
  el('endlessBtn').disabled = el('dailyBtn').disabled = !modesUnlocked();
  el('endlessBtn').title = el('dailyBtn').title = modesUnlocked() ? '' : t('modes_locked');
  el('dailyBtn').textContent = S.daily.challengeDone === todayStr() ? t('m_dchal_done') : t('m_dchal');
}

var journeyTab = 'ach';
function openJourney(tab){ if(tab) journeyTab = tab; renderJourney(); showOverlay('journeyOverlay'); }
function renderJourney(){
  document.querySelectorAll('#journeyOverlay .chtab').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-tab') === journeyTab); });
  var box = el('journeyList'), h = '';
  if(journeyTab === 'ach'){
    var done = ACHIEVEMENTS.filter(function(a){ return S.ach[a.id]; }).length;
    h += '<p class="meta-sum">' + t('ach_sum', { a: done, b: ACHIEVEMENTS.length, k: fmt(S.stats.kills), c: S.stats.bestCombo, w: S.endlessBest }) + '</p><div class="mlist">';
    ACHIEVEMENTS.forEach(function(a){
      var st = S.ach[a.id] || 0;
      h += '<div class="mitem' + (st ? '' : ' locked') + '"><span class="mi">' + a.icon + '</span><div class="mt"><b>' + esc(a.name) + '</b><small>' + esc(a.desc) + '</small></div>' +
        (st === 1 ? '<button class="btn sm" type="button" data-claim="' + a.id + '">' + t('claim', { n: a.reward }) + '</button>' :
         st === 2 ? '<span class="mtag">' + t('claimed') + '</span>' : '<span class="mtag">🪙 ' + a.reward + '</span>') + '</div>';
    });
    h += '</div>';
  } else {
    h += '<p class="meta-sum">' + t('cards_sum', { a: S.cards.length, b: CARD_ORDER.length }) + '</p><div class="cards">';
    CARD_ORDER.forEach(function(id){
      var C = CHARACTERS[id], has = S.cards.indexOf(id) >= 0;
      h += '<div class="card-c' + (has ? '' : ' locked') + '" style="--cc:' + C.color + '"><div class="cp">' + (has ? '<img src="' + C.img + '" alt="" loading="lazy" />' : '<span>❔</span>') + '</div>' +
        '<b>' + (has ? esc(C.name) : '???') + '</b><small>' + (has ? esc(C.role || '') : t('card_locked')) + '</small></div>';
    });
    h += '</div>';
  }
  box.innerHTML = h;
  box.querySelectorAll('[data-claim]').forEach(function(b){ b.addEventListener('click', function(){ claimAch(b.getAttribute('data-claim')); }); });
}

/* ---------------- cửa hàng ---------------- */
var shopTab = 'up';
function openShop(tab){ if(tab) shopTab = tab; renderShop(); showOverlay('shopOverlay'); }
function renderShop(){
  document.querySelectorAll('#shopOverlay .chtab').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-tab') === shopTab); });
  el('shopCoins').textContent = fmt(S.coins);
  var h = '<div class="mlist">';
  if(shopTab === 'up'){
    UPGRADES.forEach(function(u){
      var lv = upLv(u.id), max = u.prices.length, price = u.prices[lv];
      h += '<div class="mitem"><span class="mi">' + u.icon + '</span><div class="mt"><b>' + esc(u.name) + ' <span class="lv">' + '◆'.repeat(lv) + '◇'.repeat(max - lv) + '</span></b><small>' + esc(u.desc) + '</small></div>' +
        (lv >= max ? '<span class="mtag">' + t('max') + '</span>' : '<button class="btn sm" type="button" data-up="' + u.id + '"' + (S.coins < price ? ' disabled' : '') + '>🪙 ' + fmt(price) + '</button>') + '</div>';
    });
  } else {
    var list = shopTab === 'outfit' ? OUTFITS : TRAILS, cur = shopTab === 'outfit' ? S.outfit : S.trail;
    list.forEach(function(o){
      var own = S.owned.indexOf(o.id) >= 0, locked = o.needWin && !S.stars[LEVELS.length - 1];
      var sw = shopTab === 'outfit' ? '<span class="mi sw" style="background:linear-gradient(135deg,' + o.torso + ' 50%,' + o.sash + ' 50%)"></span>' :
        '<span class="mi sw" style="background:' + (o.color || 'linear-gradient(135deg,#e8e8e8,#9db4d8)') + '"></span>';
      var btn = o.id === cur ? '<span class="mtag">' + t('using') + '</span>' :
        own ? '<button class="btn ghost sm" type="button" data-use="' + o.id + '">' + t('use') + '</button>' :
        locked ? '<span class="mtag">' + t('need_win') + '</span>' :
        '<button class="btn sm" type="button" data-buy="' + o.id + '"' + (S.coins < o.price ? ' disabled' : '') + '>🪙 ' + fmt(o.price) + '</button>';
      h += '<div class="mitem">' + sw + '<div class="mt"><b>' + esc(o.name) + '</b></div>' + btn + '</div>';
    });
  }
  h += '</div>';
  el('shopList').innerHTML = h;
  el('shopList').querySelectorAll('[data-up]').forEach(function(b){ b.addEventListener('click', function(){ buyUpgrade(b.getAttribute('data-up')); }); });
  el('shopList').querySelectorAll('[data-buy]').forEach(function(b){ b.addEventListener('click', function(){ buyCosmetic(b.getAttribute('data-buy')); }); });
  el('shopList').querySelectorAll('[data-use]').forEach(function(b){ b.addEventListener('click', function(){ useCosmetic(b.getAttribute('data-use')); }); });
}
function spend(n){ if(S.coins < n) return false; S.coins -= n; el('coinCount').textContent = fmt(S.coins); saveGame(); return true; }
function buyUpgrade(id){
  var u = UPGRADES.filter(function(x){ return x.id === id; })[0], lv = upLv(id);
  if(!u || lv >= u.prices.length || !spend(u.prices[lv])) return;
  S.upgrades[id] = lv + 1; saveGame(); sCoin();
  toast(u.icon + ' ' + t('t_upgrade', { n: u.name, l: lv + 1 }));
  renderShop();
}
function buyCosmetic(id){
  var o = OUTFITS.concat(TRAILS).filter(function(x){ return x.id === id; })[0];
  if(!o || S.owned.indexOf(id) >= 0 || !spend(o.price)) return;
  S.owned.push(id); sCoin(); useCosmetic(id);
}
function useCosmetic(id){
  if(OUTFITS.some(function(o){ return o.id === id; })) S.outfit = id; else S.trail = id;
  saveGame(); renderShop();
}

/* ---------------- quà hằng ngày ---------------- */
function openDaily(){ renderDaily(); showOverlay('dailyOverlay'); }
function renderDaily(){
  var claimed = S.daily.lastClaim === todayStr();
  var streak = claimed ? S.daily.streak : (S.daily.lastClaim === todayStr(-1) ? S.daily.streak + 1 : 1);
  var day = (streak - 1) % 7;
  el('dailyGrid').innerHTML = DAILY_REWARDS.map(function(c, i){
    var cls = i < day || (i === day && claimed) ? ' got' : (i === day ? ' now' : '');
    return '<div class="dday' + cls + '"><small>' + t('day', { n: i + 1 }) + '</small><b>🪙 ' + c + '</b></div>';
  }).join('');
  el('dailyInfo').textContent = t('daily_streak', { n: streak }) + (claimed ? t('daily_tomorrow') : '');
  el('dailyClaimBtn').disabled = claimed;
  el('dailyClaimBtn').textContent = claimed ? t('daily_claimed') : t('daily_claim', { n: DAILY_REWARDS[day] });
  el('dailyDoubleBtn').hidden = !claimed || S.daily.doubled === todayStr();
}
function claimDaily(){
  var today = todayStr();
  if(S.daily.lastClaim === today) return;
  S.daily.streak = S.daily.lastClaim === todayStr(-1) ? S.daily.streak + 1 : 1;
  S.daily.lastClaim = today;
  var c = DAILY_REWARDS[(S.daily.streak - 1) % 7];
  addCoins(c); sCoin(); toast(t('t_daily', { n: c }));
  checkAchievements(); renderDaily();
}
el('dailyClaimBtn').addEventListener('click', claimDaily);
el('dailyDoubleBtn').addEventListener('click', function(){
  openRewarded(function(){
    var c = DAILY_REWARDS[(S.daily.streak - 1) % 7];
    S.daily.doubled = todayStr(); addCoins(c); toast(t('t_daily_double', { n: c })); renderDaily();
  });
});

/* ---------------- chế độ Vô tận ---------------- */
function startEndless(){
  if(!modesUnlocked()) return;
  mode = 'endless'; levelIdx = 0;
  beginSession(endlessLevel(1), t('endless_label'), t('endless_toast', { n: S.endlessBest }));
}
function onWaveCleared(w){
  el('hudLevel').textContent = t('endless_label');
  if(w >= ENDLESS_CARD.wave) unlockCard(ENDLESS_CARD.card);
  checkAchievements();
}

/* ---------------- Thử thách ngày: đề chọn theo ngày, ai cũng như nhau ---------------- */
function seeded(str){
  var h = 2166136261;
  for(var i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function(){ h += 0x6D2B79F5; var t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function dailyLevel(){
  var r = seeded('kodanda-' + todayStr()), pool = ['fly', 'fast', 'armor', 'shield', 'splitter', 'shaman'], mix = { ground: .3 };
  for(var i = 0; i < 3; i++){ var k = pool.splice(Math.floor(r() * pool.length), 1)[0]; mix[k] = .7 / 3; }
  var mod = DAILY_MODS[Math.floor(r() * DAILY_MODS.length)];
  return { ch: Math.floor(r() * 3), name: t('daily_name'), sub: mod.name, total: 22, interval: 1.3, speed: 36, mix: mix,
           sky: ['dawn', 'day', 'dusk', 'sunset', 'night', 'storm', 'lanka'][Math.floor(r() * 7)],
           boss: r() < .5 ? ['tataka', 'maricha', 'kumbha'][Math.floor(r() * 3)] : null, mod: mod.id, modInfo: mod };
}
function startDaily(){
  if(!modesUnlocked()) return;
  var L = dailyLevel();
  mode = 'daily'; levelIdx = 0;
  beginSession(L, t('daily_label'), '⚔️ ' + L.modInfo.name + ' — ' + L.modInfo.desc);
}
function showDailyWin(){
  var first = S.daily.challengeDone !== todayStr();
  if(first){ S.daily.challengeDone = todayStr(); S.stats.dailyWins++; addCoins(DAILY_WIN_REWARD); G.coinsEarned += DAILY_WIN_REWARD; }
  saveGame();
  el('winLvlName').textContent = t('daily_name');
  el('winStars').hidden = true;
  fillWinStats();
  el('nextBtn').hidden = true;
  if(first) setTimeout(function(){ toast(t('t_daily_win', { n: DAILY_WIN_REWARD })); }, 500);
  sWin(); checkAchievements();
  winsSinceAd++;
  presentWin();
}

/* ---------------- chia sẻ ---------------- */
function shareUrl(){ return SHARE.url || (IS_APP ? '' : location.href.split('#')[0]); }
function shareText(text){
  var full = text + ' ' + SHARE.hashtag;
  var nat = Native.share({ title: t('share_title'), text: full, url: shareUrl() });
  if(nat){ nat.catch(function(){}); return; }
  if(navigator.share){ navigator.share({ title: t('share_title'), text: full, url: shareUrl() }).catch(function(){}); return; }
  if(navigator.clipboard){ navigator.clipboard.writeText(full + ' ' + shareUrl()).then(function(){ toast(t('t_copied')); }, function(){ toast(full); }); }
  else toast(full);
}
function resultText(){
  if(mode === 'endless') return t('share_endless', { n: G.wave, s: fmt(G.score) });
  if(mode === 'daily') return t('share_daily', { n: G.lvl.sub, s: fmt(G.score) });
  return t('share_level', { n: levelIdx + 1, l: LEVELS[levelIdx].name, s: fmt(G.score) });
}
// ảnh kết quả 1200×630 từ khung game hiện tại
function shareImage(){
  var c = document.createElement('canvas'); c.width = 1200; c.height = 630;
  var x = c.getContext('2d');
  x.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, -22, 1200, 675);
  var g = x.createLinearGradient(0, 0, 0, 630); g.addColorStop(0, 'rgba(8,10,24,.25)'); g.addColorStop(1, 'rgba(8,10,24,.9)');
  x.fillStyle = g; x.fillRect(0, 0, 1200, 630);
  var em = getImg(ART.emblem); if(em) x.drawImage(em, 40, 40, 120, 120);
  x.fillStyle = '#f5b942'; x.font = '800 64px "Playfair Display",serif'; x.fillText(t('brand'), 180, 118);
  x.fillStyle = '#fff'; x.font = '700 40px "Be Vietnam Pro",sans-serif';
  var line = mode === 'endless' ? t('img_wave', { n: G.wave }) : (mode === 'daily' ? t('img_daily', { n: G.lvl.sub }) : t('img_level', { n: levelIdx + 1, l: LEVELS[levelIdx].name }));
  x.fillText(line, 50, 500);
  x.fillStyle = '#ffd97a'; x.font = '800 54px "Be Vietnam Pro",sans-serif'; x.fillText(t('points', { n: fmt(G.score) }), 50, 570);
  x.fillStyle = '#c9d3ee'; x.font = '600 30px "Be Vietnam Pro",sans-serif'; x.textAlign = 'right'; x.fillText(SHARE.hashtag, 1150, 570);
  c.toBlob(function(blob){
    if(!blob) return;
    var file = new File([blob], 'kodanda.png', { type: 'image/png' });
    if(navigator.canShare && navigator.canShare({ files: [file] })){
      navigator.share({ files: [file], text: resultText() + ' ' + SHARE.hashtag + ' ' + shareUrl() }).catch(function(){});
    } else {
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'kodanda.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
      toast(t('t_img_saved', { n: SHARE.hashtag }));
    }
  }, 'image/png');
}
function shareProgress(){
  var stars = Object.keys(S.stars).reduce(function(a, k){ return a + S.stars[k]; }, 0);
  shareText(t('share_progress', { a: Math.min(S.unlocked, LEVELS.length), b: LEVELS.length, s: stars, c: S.cards.length }));
}

/* ---------------- toàn màn hình (điện thoại: ưu tiên xoay ngang) ---------------- */
function toggleFullscreen(){
  var st = el('stage'), doc = document;
  var fsEl = doc.fullscreenElement || doc.webkitFullscreenElement;
  if(fsEl){ (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc); return; }
  var req = st.requestFullscreen || st.webkitRequestFullscreen;
  if(req){
    var p = req.call(st);
    if(p && p.then) p.then(function(){ if(screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function(){}); }).catch(function(){ document.body.classList.toggle('pseudo-full'); });
  } else document.body.classList.toggle('pseudo-full');   // iPhone: không có API toàn màn hình
}

/* ---------------- gắn nút ---------------- */
el('shopBtn').addEventListener('click', function(){ openShop(); });
el('journeyBtn').addEventListener('click', function(){ openJourney(); });
el('dailyRewardBtn').addEventListener('click', openDaily);
el('endlessBtn').addEventListener('click', startEndless);
el('dailyBtn').addEventListener('click', startDaily);
el('shareBtn').addEventListener('click', shareProgress);
el('shareWinBtn').addEventListener('click', shareImage);
el('loseShareBtn').addEventListener('click', shareImage);
el('fsBtn').addEventListener('click', toggleFullscreen);
el('hudFsBtn').addEventListener('click', toggleFullscreen);
el('rotateClose').addEventListener('click', function(){ document.body.classList.add('no-rotate-hint'); });
document.querySelectorAll('[data-back]').forEach(function(b){ b.addEventListener('click', toMenu); });
document.querySelectorAll('#shopOverlay .chtab').forEach(function(b){ b.addEventListener('click', function(){ openShop(b.getAttribute('data-tab')); }); });
document.querySelectorAll('#journeyOverlay .chtab').forEach(function(b){ b.addEventListener('click', function(){ openJourney(b.getAttribute('data-tab')); }); });

checkAchievements();
if(S.daily.lastClaim !== todayStr()) setTimeout(function(){ if(state === 'menu') openDaily(); }, 700);

/* ---------------- ngôn ngữ ---------------- */
(function(){
  var sel = el('langSel');
  sel.innerHTML = LANGS.map(function(l){ return '<option value="' + l.id + '"' + (l.id === LANG ? ' selected' : '') + '>' + l.label + '</option>'; }).join('');
  sel.addEventListener('change', function(){ S.lang = sel.value; saveGame(); location.reload(); });
})();

/* ---------------- quyền riêng tư & quảng cáo ---------------- */
el('privacyBtn').addEventListener('click', function(){ if(IS_APP) location.href = PRIVACY_URL; else window.open(PRIVACY_URL, '_blank', 'noopener'); });
el('adPrivacyBtn').addEventListener('click', function(){ Ads.showPrivacyOptions(); });
ADS_READY.then(function(){ el('adPrivacyBtn').hidden = !Ads.privacyRequired(); });

/* ---------------- app Android: nút Back = tạm dừng / quay lại / thoát ---------------- */
Native.on('App', 'backButton', function(){
  if(state === 'playing'){ setPaused(true); return; }
  if(state === 'paused'){ setPaused(false); return; }
  if(state === 'story'){ storyNext(true); return; }
  if(el('menuOverlay').hidden){ toMenu(); return; }
  Native.exitApp();
});

/* ---------------- PWA: cài lên màn hình chính, chơi offline ---------------- */
var installEvt = null;
window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); installEvt = e; el('installBtn').hidden = false; });
window.addEventListener('appinstalled', function(){ el('installBtn').hidden = true; installEvt = null; });
el('installBtn').addEventListener('click', function(){
  if(installEvt){ installEvt.prompt(); installEvt = null; el('installBtn').hidden = true; }
  else toast(t('ios_install'));
});
(function(){
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if(IS_APP) return;   // app native: không cần cài PWA / service worker
  if(ios && !standalone) el('installBtn').hidden = false;   // iOS không có sự kiện cài đặt: bấm để xem hướng dẫn
  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(function(){});
})();
