"use strict";
/* ============================================================
   GIAO DIỆN — HUD, lớp phủ, luồng màn, quảng cáo (AdMob trong app, quảng cáo chéo trên web)
   ============================================================ */
var winsSinceAd = 0;          // interstitial: mỗi 2 màn thắng, bỏ qua màn 1–2
var OVERLAYS = ['menuOverlay','winOverlay','loseOverlay','pauseOverlay','storyOverlay'];
var selCh = 0;                // chương đang xem ở menu

/* ---------------- HUD / overlays ---------------- */
function heartsStr(){ var s = ''; for(var i = 0; i < G.maxHp; i++) s += i < G.hp ? '❤️' : '🖤'; return s; }
function updateHUD(){
  if(!G) return;
  el('hudHearts').textContent = heartsStr();
  var total = G.lvl.total;
  el('hudKill').textContent = (G.mode === 'endless' ? t('wave', { n: G.wave }) + ' · ' : '') + G.killed + '/' + total;
  el('hudProg').style.width = clamp(G.killed / total * 100, 0, 100) + '%';
  el('hudScore').textContent = fmt(G.score);
  el('hudEnergy').style.width = G.energy + '%';
  document.querySelectorAll('#astraBar button').forEach(function(b){
    var off = G.energy < +b.getAttribute('data-cost');
    if(b.disabled !== off) b.disabled = off;
  });
}
function buildAstraBar(){
  var bar = el('astraBar'); bar.innerHTML = '';
  ASTRAS.forEach(function(A){
    if(!astraUnlocked(A)) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'astra'; b.setAttribute('data-cost', A.cost);
    b.title = t('astra_title', { name: A.name, desc: A.desc, key: A.key });
    b.innerHTML = '<span class="ai">' + A.icon + '</span><span class="an">' + A.name + '</span><span class="ac">' + A.cost + '</span>';
    b.addEventListener('pointerdown', function(e){ e.stopPropagation(); });
    b.addEventListener('click', function(){ castAstra(A.id); });
    bar.appendChild(b);
  });
  bar.hidden = !bar.children.length;
}
function showOverlay(id){
  OVERLAYS.forEach(function(o){ el(o).hidden = (o !== id); });
}
function showWin(){
  if(!G) return;   // người chơi đã rời màn trước khi hẹn giờ kết thúc chạy
  state = 'win';
  S.totalScore += G.score; S.stats.wins++;
  if(mode === 'daily'){ showDailyWin(); return; }
  var L = LEVELS[levelIdx];
  var firstClear = !S.stars[levelIdx];
  var stars = G.hp >= G.maxHp ? 3 : (G.hp >= Math.ceil(G.maxHp / 2) ? 2 : 1);
  if(stars > (S.stars[levelIdx] || 0)) S.stars[levelIdx] = stars;
  if(levelIdx + 2 > S.unlocked) S.unlocked = Math.min(LEVELS.length, levelIdx + 2);
  saveGame();
  el('winLvlName').textContent = (levelIdx + 1) + ' · ' + L.name;
  el('winStars').hidden = false;
  el('winStars').innerHTML = [1,2,3].map(function(i){ return i <= stars ? '★' : '<span class="off">★</span>'; }).join('');
  fillWinStats();
  el('nextBtn').hidden = false;
  el('nextBtn').textContent = levelIdx + 1 < LEVELS.length ? t('next_lvl', { n: levelIdx + 2 }) : t('ending_btn');
  var nextL = LEVELS[levelIdx + 1];
  if(firstClear && nextL && nextL.ch !== L.ch) setTimeout(function(){ toast(t('t_ch_unlock', { n: CHAPTERS[nextL.ch].name })); }, 600);
  if(firstClear && L.card) unlockCard(L.card);
  if(firstClear && levelIdx === 4) setTimeout(function(){ toast(t('t_modes_unlock')); }, 2600);
  sWin();
  buildLevelGrid();
  checkAchievements();
  // interstitial trước, rồi mới hiện panel thắng
  if(levelIdx >= 2) winsSinceAd++;
  presentWin();
}
function fillWinStats(){
  el('winScore').textContent = fmt(G.score);
  el('winCoins').textContent = fmt(G.coinsEarned) + ' ' + t('coin_unit');
  el('winAcc').textContent = G.shots ? Math.round(G.hits / G.shots * 100) + '%' : '—';
  el('doubleBtn').disabled = false;
  el('doubleBtn').textContent = t('double_btn');
}
function presentWin(){
  if(winsSinceAd >= 2){
    winsSinceAd = 0;
    showOverlay(null);
    openInterstitial(function(){ if(state === 'win') showOverlay('winOverlay'); });
  } else showOverlay('winOverlay');
}
function showLose(){
  if(!G) return;   // người chơi đã rời màn trước khi hẹn giờ kết thúc chạy
  state = 'lose';
  var endless = mode === 'endless';
  el('loseKill').textContent = endless ? t('wave', { n: G.wave }) : G.killed + '/' + G.lvl.total;
  el('loseKillLbl').textContent = endless ? t('lose_wave_lbl') : t('lose_kill');
  el('loseScore').textContent = fmt(G.score);
  el('reviveBtn').disabled = false;
  el('reviveBtn').textContent = t('revive');
  el('reviveBtn').hidden = G.revived;   // hồi sinh tối đa 1 lần mỗi lượt chơi màn
  el('loseText').textContent = G.revived ? t('lose_text2') : t('lose_text');
  el('loseShareBtn').hidden = !endless;
  if(endless && G.score > S.endlessScore){ S.endlessScore = G.score; el('loseText').textContent = t('lose_record') + el('loseText').textContent; }
  saveGame();
  checkAchievements();
  music.tense(false); sLose();
  showOverlay('loseOverlay');
}

/* ---------------- flow ---------------- */
function startLevel(idx){
  var L = LEVELS[idx];
  mode = 'campaign';
  if(L.story && !S.seen[idx]){
    levelIdx = idx;
    showStory(L.story, function(){ S.seen[idx] = 1; saveGame(); beginLevel(idx); });
  } else beginLevel(idx);
}
function beginLevel(idx){
  mode = 'campaign';
  levelIdx = idx; selCh = LEVELS[idx].ch;
  beginSession(LEVELS[idx], (idx + 1) + ' · ' + LEVELS[idx].name, t('lvl_toast', { n: idx + 1, s: LEVELS[idx].sub }));
}
function beginSession(L, label, msg){
  G = newSession(L);
  state = 'playing';
  el('hud').hidden = false; document.body.classList.add('in-game');
  el('hudLevel').textContent = label;
  showOverlay(null);
  buildAstraBar();
  updateHUD();
  toast(msg);
  G.banner = { text: label, sub: L.sub, t: 0, life: 2.2 };
  music.tense(false); sConch();
}
function retry(){
  if(mode === 'endless') startEndless();
  else if(mode === 'daily') startDaily();
  else startLevel(levelIdx);
}
function toMenu(){
  state = 'menu'; G = null; music.tense(false);
  document.body.classList.remove('in-game');
  el('hud').hidden = true; el('astraBar').hidden = true;
  buildLevelGrid();
  if(typeof refreshBadges === 'function') refreshBadges();
  showOverlay('menuOverlay');
}
function setPaused(p){
  if(p && state === 'playing'){ state = 'paused'; showOverlay('pauseOverlay'); }
  else if(!p && state === 'paused'){ state = 'playing'; showOverlay(null); }
}

/* ---------------- hội thoại ---------------- */
var story = null;
function showStory(lines, done){
  story = { lines: lines, i: 0, done: done, prev: state };
  state = 'story';
  el('hud').hidden = true; el('astraBar').hidden = true; document.body.classList.add('in-game');
  showOverlay('storyOverlay');
  renderStory();
}
function renderStory(){
  var ln = story.lines[story.i], C = CHARACTERS[ln[0]] || CHARACTERS.narrator;
  var pic = el('dlgPic');
  pic.innerHTML = C.img ? '<img src="' + C.img + '" alt="" />' : '<span>' + (C.icon || '📜') + '</span>';
  pic.style.borderColor = C.color;
  el('dlgName').textContent = C.name; el('dlgName').style.color = C.color;
  el('dlgText').textContent = ln[1];
  el('dlgStep').textContent = (story.i + 1) + '/' + story.lines.length;
  el('dlgNext').textContent = story.i + 1 < story.lines.length ? t('next') : t('fight');
}
function storyNext(skip){
  if(!story) return;
  story.i++;
  if(skip || story.i >= story.lines.length){ var cb = story.done; story = null; cb(); }
  else renderStory();
}
el('dlgNext').addEventListener('click', function(){ storyNext(false); });
el('dlgSkip').addEventListener('click', function(){ storyNext(true); });

function buildLevelGrid(){
  var tabs = el('chTabs'); tabs.innerHTML = '';
  CHAPTERS.forEach(function(C, ci){
    var first = LEVELS.findIndex(function(L){ return L.ch === ci; });
    var tb = document.createElement('button');
    tb.type = 'button'; tb.className = 'chtab' + (ci === selCh ? ' on' : '');
    tb.disabled = first >= S.unlocked;
    tb.textContent = (first >= S.unlocked ? '🔒 ' : '') + C.name.split(' · ')[0];
    tb.addEventListener('click', function(){ selCh = ci; buildLevelGrid(); });
    tabs.appendChild(tb);
  });
  el('chDesc').innerHTML = '<b>' + CHAPTERS[selCh].name + '</b> — ' + CHAPTERS[selCh].desc;
  var grid = el('lvlGrid'); grid.innerHTML = '';
  LEVELS.forEach(function(L, i){
    if(L.ch !== selCh) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'lvl' + (L.boss ? ' boss' : '');
    var locked = i >= S.unlocked, st = S.stars[i] || 0;
    b.disabled = locked;
    var starsHtml = st ? '<span class="stars">' + '★'.repeat(st) + '☆'.repeat(3 - st) + '</span>' : '<span class="stars" style="color:var(--faint)">☆☆☆</span>';
    b.innerHTML = '<span class="nm">' + t('lvl_label', { n: i + 1 }) + ' · ' + L.name + '</span>' +
      '<span class="ds">' + L.sub + '<br/>' + t('lvl_meta', { n: L.total, d: DIFFS[diffKey].name, h: DIFFS[diffKey].hp + upLv('hp') }) + '</span>' +
      starsHtml + (locked ? '<span class="lock">🔒</span>' : '');
    b.addEventListener('click', function(){ startLevel(i); });
    grid.appendChild(b);
  });
  el('playBtn').textContent = t('play_lvl', { n: Math.min(S.unlocked, LEVELS.length) });
}
/* ---------------- toolbar & buttons ---------------- */
document.querySelectorAll('.seg button').forEach(function(b){
  b.addEventListener('click', function(){
    document.querySelectorAll('.seg button').forEach(function(x){ x.classList.remove('on'); });
    b.classList.add('on'); diffKey = S.diff = b.getAttribute('data-diff'); saveGame();
    buildLevelGrid();
    toast(t('t_diff', { n: DIFFS[diffKey].name }));
  });
});
el('soundBtn').addEventListener('click', function(){
  soundOn = S.sound = !soundOn; saveGame(); el('soundBtn').textContent = soundOn ? '🔊' : '🔇';
  sClick();
});
el('musicBtn').addEventListener('click', function(){
  musicOn = S.music = !musicOn; saveGame(); el('musicBtn').classList.toggle('off', !musicOn);
  music.sync();
});
el('playBtn').addEventListener('click', function(){ startLevel(Math.min(S.unlocked, LEVELS.length) - 1); });
el('pauseBtn').addEventListener('click', function(){ setPaused(true); });
el('resumeBtn').addEventListener('click', function(){ setPaused(false); });
el('pauseMenuBtn').addEventListener('click', toMenu);
el('winMenuBtn').addEventListener('click', toMenu);
el('loseMenuBtn').addEventListener('click', toMenu);
el('retryBtn').addEventListener('click', retry);
el('nextBtn').addEventListener('click', function(){
  if(levelIdx + 1 < LEVELS.length) startLevel(levelIdx + 1);
  else showStory(ENDING, toMenu);
});
el('bannerCta').addEventListener('click', function(){ window.open(SHARE.ramsetu, '_blank', 'noopener'); });

/* ============================================================
   QUẢNG CÁO — app: AdMob thật (platform.js) · web: quảng cáo chéo game Ram Setu
   ============================================================ */
var realAdOn = false;         // đang hiện quảng cáo AdMob: dừng vòng lặp game & âm thanh
function openRealAd(kind, onDone){
  realAdOn = true;
  if(AC) AC.suspend();
  Ads.show(kind).then(function(ok){
    realAdOn = false;
    if(AC) AC.resume();
    if(kind === 'interstitial' || ok){ if(onDone) onDone(); }
    else toast(t('t_ad_skipped'));   // đóng rewarded sớm: không thưởng
  });
}
var adTimer = null;
function runAdTimer(barEl, btnEl, secs, doneLabel, onDone){
  var step = 0, total = secs * 10;
  btnEl.disabled = true;
  barEl.style.width = '0%';
  clearInterval(adTimer);
  adTimer = setInterval(function(){
    step++;
    barEl.style.width = (step / total * 100) + '%';
    var remain = Math.ceil((total - step) / 10);
    if(step < total){ btnEl.textContent = t('ad_close_in', { n: remain }); }
    else {
      clearInterval(adTimer);
      btnEl.disabled = false;
      btnEl.textContent = doneLabel;
      btnEl.onclick = function(){ onDone(); };
    }
  }, 100);
}
function openInterstitial(cb){
  if(Ads.ready('interstitial')){ openRealAd('interstitial', cb); return; }
  if(IS_APP){ if(cb) cb(); return; }   // app: chưa tải được thì bỏ qua, không bắt người chơi chờ
  var m = el('interstitialModal'); m.hidden = false;
  runAdTimer(el('interBar'), el('interClose'), 5, t('ad_close'), function(){
    m.hidden = true; el('interClose').onclick = null; if(cb) cb();
  });
  el('interClose').textContent = t('ad_close_in', { n: 5 });
}
// freeIfNoAd: app không có quảng cáo (mất mạng / hết hàng) thì vẫn trao thưởng — dùng cho hồi sinh
function openRewarded(onReward, freeIfNoAd){
  if(Ads.ready('rewarded')){ openRealAd('rewarded', onReward); return; }
  if(IS_APP){
    if(freeIfNoAd){ toast(t('t_ad_free')); if(onReward) onReward(); }
    else toast(t('t_ad_unavail'));
    return;
  }
  var m = el('rewardedModal'); m.hidden = false;
  el('rewardFoot').textContent = t('ad_reward_wait');
  runAdTimer(el('rewardBar'), el('rewardClose'), 4, t('ad_claim'), function(){
    m.hidden = true; el('rewardClose').onclick = null;
    el('rewardFoot').textContent = t('ad_reward_done');
    if(onReward) onReward();
  });
  el('rewardClose').textContent = t('ad_playing');
}
function rewardCoins30(){
  openRewarded(function(){ addCoins(30); toast(t('t_ad_coins')); sCoin(); });
}
el('rewardMenuBtn').addEventListener('click', rewardCoins30);
el('rewardMenuBtn2').addEventListener('click', rewardCoins30);
el('doubleBtn').addEventListener('click', function(){
  if(!G) return;
  var amount = G.coinsEarned;
  openRewarded(function(){
    addCoins(amount); G.coinsEarned += amount;
    el('winCoins').textContent = fmt(G.coinsEarned) + ' ' + t('coin_unit');
    el('doubleBtn').disabled = true; el('doubleBtn').textContent = t('double_done');
    toast(t('t_double', { n: fmt(amount) }));
  });
});
el('reviveBtn').addEventListener('click', function(){
  if(!G || G.revived) return;
  openRewarded(function(){
    G.hp = Math.min(G.maxHp, 3); G.over = false; G.flash = 0; G.revived = true;
    S.stats.revives++; saveGame();
    G.fireballs = [];
    // quỷ thường bị quét sạch khi hồi sinh: tính là đã diệt để thanh tiến độ khớp chỉ tiêu màn
    G.demons.forEach(function(dm){ if(dm.type !== 'boss' && !dm.minion) G.killed++; });
    G.demons = G.demons.filter(function(dm){ return dm.type === 'boss'; });
    state = 'playing';
    showOverlay(null);
    updateHUD();
    toast(t('t_revive')); sPower();
    if(G.bossRef && !G.bossRef.dead) music.tense(true);
    // nếu không còn gì để bắn mà vẫn còn quỷ chưa spawn, game tiếp tục spawn bình thường
    if(G.toSpawn === 0 && G.demons.length === 0){ G.over = true; setTimeout(showWin, 400); }
  }, true);
});
/* ---------------- main loop ---------------- */
var lastDraw = 0;
function loop(ts){
  var dt = Math.min(.033, (ts - lastT) / 1000 || 0);
  lastT = ts; elapsed += dt;
  raf = requestAnimationFrame(loop);   // đặt khung kế trước: lỗi trong một khung không làm đứng cả game
  try{
    var live = state === 'playing' && G && !realAdOn && el('interstitialModal').hidden && el('rewardedModal').hidden;
    if(live) update(dt);
    // menu / tạm dừng / bảng kết quả: chỉ vẽ ~20 khung/giây để đỡ tốn pin, đỡ nóng máy
    if(live || ts - lastDraw > 48){ lastDraw = ts; draw(); }
  }catch(e){ console.error(e); }
}
/* chuyển tab / tắt màn hình / ra ngoài app: tự tạm dừng, tắt tiếng */
document.addEventListener('visibilitychange', function(){
  if(document.hidden){ setPaused(true); if(AC && !realAdOn) AC.suspend(); }
  else if(AC && !realAdOn) AC.resume();
});
/* ---------------- khởi động: áp dụng dữ liệu đã lưu ---------------- */
document.querySelectorAll('.seg button').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-diff') === diffKey); b.textContent = DIFFS[b.getAttribute('data-diff')].name; });
el('soundBtn').textContent = soundOn ? '🔊' : '🔇';
el('musicBtn').classList.toggle('off', !musicOn);
el('coinCount').textContent = fmt(S.coins);
selCh = LEVELS[Math.min(S.unlocked, LEVELS.length) - 1].ch;
buildLevelGrid();
raf = requestAnimationFrame(loop);
document.addEventListener('keydown', function(e){
  if(state === 'story' && (e.code === 'Enter' || e.code === 'Space')){ e.preventDefault(); storyNext(false); }
});
