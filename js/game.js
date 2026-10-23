"use strict";
/* ============================================================
   BẮN CUNG DIỆT QUỶ — canvas game
   ============================================================ */
var W = 960, H = 540, GROUND = 472, DEF_X = 86;
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
/* độ nét: bộ đệm canvas theo kích thước hiển thị × mật độ điểm ảnh (điện thoại 2–3×), tọa độ game vẫn là 960×540 */
var DPR = 1;
function fitCanvas(){
  var r = canvas.getBoundingClientRect();
  var k = r.width ? clamp(r.width * (window.devicePixelRatio || 1) / W, 1, 2.5) : 1;
  if(Math.abs(k - DPR) < .05 && canvas.width === Math.round(W * DPR)) return;
  DPR = k; canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
}
window.addEventListener('resize', function(){ fitCanvas(); });
document.addEventListener('fullscreenchange', function(){ setTimeout(fitCanvas, 60); });

var state = 'menu';           // menu | story | playing | win | lose | paused
var diffKey = S.diff;          // tiến trình (xu, màn đã mở, sao) nằm trong S — xem save.js
var levelIdx = 0;
var mode = 'campaign';         // campaign | endless | daily
var raf = null, lastT = 0, elapsed = 0;
var PERFECT = 92;              // thả cung khi lực ≥ 92% = phát bắn hoàn hảo

var G = null; // game session
function newSession(L){
  var d = DIFFS[diffKey], mod = L.mod || '';
  var hp = mod === 'fragile' ? 2 : d.hp + upLv('hp');
  return {
    lvl: L, mode: mode, mod: mod, hp: hp, maxHp: hp, wave: 1,
    goldenEvery: mod === 'golden' ? 3 : 5 - upLv('golden'),
    chargeRate: 115 * (1 + .15 * upLv('charge')),
    coinMul: mod === 'fragile' ? 2 : 1, speedMul: mod === 'swift' ? 1.25 : 1,
    toSpawn: L.total, spawned: 0, killed: 0,
    spawnT: 0.6, score: 0, coinsEarned: 0,
    shots: 0, hits: 0, combo: 0, bestCombo: 0,
    arrows: [], demons: [], parts: [], floats: [], powerups: [], fireballs: [], waves: [],
    corpses: [], rings: [], stuck: [], banner: null, comboT: -9,
    angle: -0.32, power: 0, charging: false, chargeDir: 1,
    fireUntil: 0, puT: 6, bossSpawned: false, bossRef: null,
    allyT: 2.5,
    energy: mod === 'astra' ? 100 : Math.min(100, ENERGY.start + 15 * upLv('energy')), rain: null, windFx: 0, bigFlash: 0, hitStop: 0, slowmo: 0,
    shake: 0, flash: 0, time: 0, over: false, revived: false
  };
}

/* ---------------- utils ---------------- */
function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
function rand(a,b){ return a + Math.random()*(b-a); }
function el(id){ return document.getElementById(id); }
function fmt(n){ return Math.round(n).toLocaleString(LOCALE); }

var toastT = null;
function toast(msg){
  var t = el('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(function(){ t.classList.remove('show'); }, 2400);
}
function addCoins(n){
  S.coins += n; saveGame();
  el('coinCount').textContent = fmt(S.coins);
  var c = el('coinChip'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
}
function addEnergy(n){ G.energy = Math.min(100, G.energy + n); }
function sprSrc(dm, s){ return dm.src || s.src || (s.srcs && s.srcs[0]); }
function sprOf(dm){ var s = ART.demons[dm.id || dm.type]; return s && getImg(sprSrc(dm, s)) ? s : null; }
function bodyY(dm){ var s = sprOf(dm); return dm.ground ? dm.y - (s ? dm.r * s.k * (dm.scale || 1) * .5 : dm.r) : dm.y; }   // tâm thân để tính va chạm
function hitR(dm){ var s = sprOf(dm); return s ? dm.r * s.k * (dm.scale || 1) * .36 : dm.r; }

/* ---------------- spawning ---------------- */
function pickType(mix){
  var r = Math.random(), acc = 0, k;
  for(k in mix){ acc += mix[k]; if(r <= acc) return k; }
  return 'ground';
}
function makeDemon(type, x, y){
  var d = DIFFS[diffKey], sp = G.lvl.speed * d.speed * G.speedMul;
  var m = { type:type, x:x, y:GROUND, ground:true, dead:false, hitFlash:0, t: rand(0,6) };
  if(type === 'fly'){ m.ground = false; m.y = y || rand(90, 250); m.baseY = m.y; m.r = 22; m.hp = 1; m.spd = sp * 1.25 * rand(.9,1.2); m.coin = 8; m.amp = rand(18,42); }
  else if(type === 'fast'){ m.r = 19; m.hp = 1; m.spd = sp * 1.85; m.coin = 10; }
  else if(type === 'armor'){ m.r = 31; m.hp = 3; m.spd = sp * 0.68; m.coin = 15; }
  else if(type === 'shield'){ m.r = 28; m.hp = 2; m.spd = sp * 0.8; m.coin = 12; }
  else if(type === 'splitter'){ m.r = 28; m.hp = 2; m.spd = sp * 0.9; m.coin = 10; }
  else if(type === 'shaman'){ m.r = 24; m.hp = 2; m.spd = sp * 0.75; m.coin = 14; m.stopX = rand(640, 780); m.healT = 2.5; m.healFx = 0; }
  else { m.type = 'ground'; m.r = 26; m.hp = 1; m.spd = sp * rand(.85,1.15); m.coin = 5; }
  m.maxHp = m.hp;
  var A = ART.demons[m.type];
  if(A && A.tints) m.tint = A.tints[Math.floor(Math.random() * A.tints.length)];   // biến thể màu
  if(A && A.srcs) m.src = A.srcs[Math.floor(Math.random() * A.srcs.length)];      // biến thể ảnh
  m.scale = rand(.92, 1.1);
  return m;
}
function spawnDemon(type){ G.demons.push(makeDemon(type, W + 50)); }
function spawnMinion(type, x, y){
  var m = makeDemon(type, x, y); m.minion = true; m.coin = Math.round(m.coin / 2);
  G.demons.push(m); return m;
}
function spawnBoss(id){
  var d = DIFFS[diffKey], B = BOSSES[id];
  var boss = { type:'boss', id:id, name:B.name, ground:B.ground, x: W + 70, y: GROUND, r:B.r, dead:false, hitFlash:0, t:0,
               coin:B.coin, actT: 2.5, minionT: 4, spd: 0 };
  boss.hp = boss.maxHp = Math.round(B.hp * d.bossHp);
  if(id === 'tataka'){ boss.stopX = 650; boss.spd = 46 * d.speed; }
  if(id === 'kumbha'){ boss.spd = 13 * d.speed; boss.actT = 5; }
  if(id === 'maricha'){ boss.x = W - 150; boss.tx = 700; boss.splitT = 3; boss.hop = 0; }
  if(id === 'ravana'){
    boss.x = W - 150; boss.y = boss.baseY = 225; boss.amp = 50; boss.spd = 26 * d.speed; boss.actT = 2.2;
    var hh = Math.max(1, Math.round(B.hp * d.bossHp));
    boss.heads = [];
    for(var i = 0; i < (ART.ravana ? ART.ravana.heads.length : 10); i++) boss.heads.push({ hp: hh, maxHp: hh, regrow: 0 });
    boss.maxHp = hh * boss.heads.length; boss.hp = boss.maxHp;
    boss.core = boss.coreMax = Math.round(B.core * d.bossHp); boss.exposed = 0;
  }
  var BA = ART.demons[id]; if(BA && BA.tints) boss.tint = BA.tints[0];
  G.bossRef = boss; G.bossSpawned = true;
  G.demons.push(boss);
  toast(B.intro);
  bossBanner(t('f_boss_in'), B.name.toUpperCase()); sBoss(); music.tense(true); G.shake = Math.max(G.shake, 8);
}
function spawnPowerup(){
  var kind = Math.random() < 0.55 ? 'fire' : 'heart';
  if(kind === 'heart' && G.hp >= G.maxHp) kind = 'fire';
  G.powerups.push({ kind:kind, x: W + 30, y: rand(110, 300), r: 17, t: 0, spd: 34 });
}

/* ---------------- shooting ---------------- */
var BOW = { x: 128, y: GROUND - 86 };
if(ART.rama) BOW.y = GROUND - 2 - ART.rama.h * (1 - ART.rama.draw.grip[1]);   // khớp tay cầm cung trong ảnh Rama
function fireArrow(){
  var fire = elapsed < G.fireUntil;
  var golden = (G.shots + 1) % G.goldenEvery === 0;
  var perfect = G.power >= PERFECT;
  var sp = 420 + G.power * 6.4; // power 0..100
  G.arrows.push({
    x: BOW.x + Math.cos(G.angle) * 34, y: BOW.y + Math.sin(G.angle) * 34,
    vx: Math.cos(G.angle) * sp, vy: Math.sin(G.angle) * sp,
    fire: fire, golden: golden, perfect: perfect, pierce: fire ? 1 : 0, dead:false, hitSet: []
  });
  G.shots++; S.stats.shots++; G.lastShot = elapsed;
  burst(BOW.x + Math.cos(G.angle) * 40, BOW.y + Math.sin(G.angle) * 40, perfect ? '#8ff0ff' : '#fff3d0', perfect ? 10 : 5, 90);
  if(perfect){ S.stats.perfects++; floater(BOW.x + 30, BOW.y - 50, t('f_perfect'), '#8ff0ff'); ring(BOW.x, BOW.y, 46, '#8ff0ff', .3); G.shake = Math.max(G.shake, 3); sPerfect(); }
  else sShoot();
}
function burst(x, y, color, n, spd){
  for(var i=0;i<n;i++){
    var a = rand(0, Math.PI*2), s = rand(spd*0.3, spd);
    G.parts.push({ x:x, y:y, vx:Math.cos(a)*s, vy:Math.sin(a)*s - 40, life:rand(.3,.7), t:0, color:color, r:rand(2,4.5) });
  }
}
function floater(x, y, text, color, big){
  G.floats.push({ x:x, y:y, text:text, color:color||'#ffd97a', t:0, life: big ? 1.6 : 1.1, big: big });
}
function ring(x, y, r, color, life){ G.rings.push({ x:x, y:y, r:r, color:color, t:0, life:life || .35 }); }
function sparks(x, y, color, n){   // tàn sáng bay lên (linh hồn quỷ tan biến)
  for(var i = 0; i < n; i++) G.parts.push({ x: x + rand(-14, 14), y: y + rand(-14, 14), vx: rand(-30, 30), vy: rand(-90, -30), g: -40, life: rand(.6, 1.1), t: 0, color: color, r: rand(1.6, 3) });
}
function bossBanner(text, sub){ G.banner = { text: text, sub: sub, t: 0, life: 2.2, boss: true }; }

/* ---------------- damage / kill ---------------- */
function killDemon(dm){
  dm.dead = true;
  if(!dm.minion) G.killed++;   // quỷ gọi thêm / tách ra không tính vào chỉ tiêu màn
  S.stats.kills++; if(dm.type === 'boss') S.stats.bossKills++;
  var d = DIFFS[diffKey];
  var gain = Math.round(dm.coin * d.coinMul * G.coinMul);
  G.coinsEarned += gain; addCoins(gain);
  var pts = dm.coin * 10 + G.combo * 5;
  G.score += Math.round(pts * d.scoreMul);
  burst(dm.x, bodyY(dm), dm.type==='boss' ? '#ff7a45' : '#ff5d6c', dm.type==='boss'?42:16, 190);
  sparks(dm.x, bodyY(dm), '#ffe9a8', dm.type === 'boss' ? 40 : 10);
  ring(dm.x, bodyY(dm), dm.type === 'boss' ? 160 : hitR(dm) + 26, dm.type === 'boss' ? '#ffd97a' : '#ffe9a8', dm.type === 'boss' ? .8 : .4);
  dm.hitFlash = .12; G.corpses.push({ dm: dm, t: 0, life: dm.type === 'boss' ? 1.4 : .5 });
  floater(dm.x, bodyY(dm) - dm.r - 16, '+' + gain + ' ' + t('coin_unit'), '#ffd97a');
  if(dm.type === 'armor') G.hitStop = .05;
  if(dm.type === 'splitter'){
    spawnMinion('fast', dm.x - 14).r = 15;
    spawnMinion('fast', dm.x + 22).r = 15;
    floater(dm.x, bodyY(dm) - dm.r - 34, t('f_split'), '#e0a8ff');
  }
  if(dm.type === 'boss'){
    G.shake = 14; G.hitStop = .08; G.slowmo = 1.2; G.bigFlash = Math.max(G.bigFlash, .4);
    floater(W/2, 180, t('f_killed', { n: dm.name.toUpperCase() }), '#ffd97a', true);
    sBoom(); buzz([60, 40, 120]); music.tense(false);
    if(dm.id === 'maricha') G.demons.forEach(function(o){ if(o.type === 'decoy') o.dead = true; });
  }
  sKill(); sCoin();
}
// src: { astra:true } khi do thần tiễn gây ra (không tính combo / thần lực)
function hitDemon(dd, dmg, src){
  if(dd.dead) return;
  if(dd.type === 'decoy'){ vanishDecoy(dd); return; }
  if(dd.id === 'ravana'){ hitRavana(dd, dmg, src); return; }
  dd.hp -= dmg; dd.hitFlash = .18;
  if(dmg > 1) floater(dd.x + 14, bodyY(dd) - dd.r - 4, '-' + dmg, '#ffe9a8');
  if(dd.hp <= 0) killDemon(dd);
  else sHit();
}
function vanishDecoy(dd){
  dd.dead = true;
  burst(dd.x, bodyY(dd), '#e8d8ff', 18, 140);
  floater(dd.x, bodyY(dd) - dd.r - 10, t('f_illusion'), '#d6c8ff');
  sMagic();
}
function hurtPlayer(){
  G.hp--; G.flash = 0.35; G.shake = Math.max(G.shake, 8);
  burst(DEF_X, GROUND - 60, '#ff5d6c', 18, 170);
  sHurt(); buzz(90); updateHUD();
  if(G.hp <= 0 && !G.over){ G.over = true; setTimeout(showLose, 650); }
}

/* ---------------- Ravana: 10 đầu, đầu mọc lại, lộ điểm yếu ---------------- */
function ravanaSprite(){ return ART.ravana && getImg(ART.ravana.src); }
function ravanaHeads(dm){
  var out = [], R = ART.ravana, im = ravanaSprite(), n = dm.heads.length, k;
  if(im){
    var h = R.h, w = h * im.naturalWidth / im.naturalHeight;
    for(k = 0; k < n; k++) out.push({ x: dm.x + (R.heads[k][0] - .5) * w, y: dm.y - h / 2 + R.heads[k][1] * h, h: dm.heads[k], r: R.hr * w });
    return out;
  }
  for(k = 0; k < n; k++){
    var off = k - (n - 1) / 2;
    out.push({ x: dm.x + off * 19, y: dm.y - dm.r * .95 - ((n - 1) / 2 - Math.abs(off)) * 5, h: dm.heads[k], r: 11 });
  }
  return out;
}
function ravanaChest(dm){
  var im = ravanaSprite(), R = ART.ravana;
  if(!im) return { x: dm.x, y: dm.y, r: dm.r + 7 };
  var w = R.h * im.naturalWidth / im.naturalHeight;
  return { x: dm.x + (R.chest[0] - .5) * w, y: dm.y - R.h / 2 + R.chest[1] * R.h, r: R.h * .2 };
}
function ravanaSync(dm){
  var s = 0; dm.heads.forEach(function(h){ s += h.hp; }); dm.hp = s;
  if(s <= 0 && !dm.exposed){
    dm.exposed = 10;
    G.energy = 100;
    G.shake = 10; G.bigFlash = .3;
    floater(W/2, 200, t('f_exposed'), '#ffe9a8');
    toast(t('t_exposed'));
  }
}
function ravanaLoseHeads(dm, n){
  dm.heads.forEach(function(h){ if(n > 0 && h.hp > 0){ h.hp = 0; h.regrow = 9; n--; } });
  dm.hitFlash = .18; ravanaSync(dm);
}
function hitRavana(dm, dmg, src){
  dm.hitFlash = .18;
  if(dm.exposed){
    dm.core -= dmg; floater(dm.x, dm.y - 10, '-' + dmg, '#ff9a6a');
    if(dm.core <= 0) killDemon(dm); else sHit();
  } else if(src && src.head){
    src.head.hp -= dmg;
    if(src.head.hp <= 0){ src.head.hp = 0; src.head.regrow = 9; burst(src.hx, src.hy, '#b07ad8', 14, 150); floater(src.hx, src.hy - 16, t('f_head_down'), '#ffd97a'); }
    ravanaSync(dm); sHit();
  } else {
    ravanaLoseHeads(dm, Math.max(1, Math.ceil(dmg / 2))); sHit();
  }
}
// trả về: null (trượt) | { head, hx, hy } | { body:true }
function ravanaHitTest(dm, x, y){
  if(!dm.exposed){
    var hs = ravanaHeads(dm);
    for(var i = 0; i < hs.length; i++) if(hs[i].h.hp > 0 && Math.hypot(x - hs[i].x, y - hs[i].y) < hs[i].r + 5) return { head: hs[i].h, hx: hs[i].x, hy: hs[i].y };
  }
  var c = ravanaChest(dm);
  if(Math.hypot(x - c.x, y - c.y) < c.r) return { body: true };
  return null;
}

/* ---------------- thần tiễn (Astra) ---------------- */
// chiến dịch: theo màn đang chơi · Vô tận / Thử thách ngày: theo tiến độ chiến dịch
function astraUnlocked(A){ return (mode === 'campaign' ? levelIdx : S.unlocked - 1) >= A.from; }
function castAstra(id){
  if(state !== 'playing' || !G || G.over) return;
  var A = ASTRAS.filter(function(a){ return a.id === id; })[0];
  if(!A || !astraUnlocked(A) || G.energy < A.cost) return;
  G.energy -= A.cost; S.stats.astras++; saveGame();
  floater(W / 2, 150, A.icon + ' ' + A.name.toUpperCase() + '!', A.color);
  var src = { astra: true };
  if(id === 'agneya') G.rain = { n: 18, t: 0 };
  if(id === 'varuna') G.waves.push({ x: DEF_X, hitSet: [] });
  if(id === 'vayavya'){
    G.windFx = .9; G.fireballs = [];
    G.demons.slice().forEach(function(dm){
      if(dm.ground) return;
      if(dm.type === 'boss') hitDemon(dm, 3, src); else hitDemon(dm, 99, src);
    });
  }
  if(id === 'brahma'){
    G.bigFlash = .9; G.shake = 16; G.fireballs = [];
    G.demons.slice().forEach(function(dm){
      if(dm.type !== 'boss'){ hitDemon(dm, 99, src); return; }
      if(dm.id === 'ravana'){ if(dm.exposed){ dm.core = 0; killDemon(dm); } else ravanaLoseHeads(dm, 5); }
      else hitDemon(dm, Math.max(8, Math.ceil(dm.maxHp * .4)), src);
    });
  }
  sAstra();
}

/* ---------------- boss AI ---------------- */
function updateBoss(dm, dt){
  var d = DIFFS[diffKey];
  if(dm.id === 'ravana'){
    dm.y = dm.baseY + Math.sin(dm.t * 0.9) * dm.amp;
    dm.x += Math.sin(dm.t * 0.45) * 14 * dt;
    if(dm.exposed){
      dm.exposed -= dt;
      if(dm.exposed <= 0){
        dm.exposed = 0;
        for(var k = 0, n = 0; k < dm.heads.length && n < 3; k++) if(dm.heads[k].hp <= 0){ dm.heads[k].hp = dm.heads[k].maxHp; n++; }
        dm.core = dm.coreMax; ravanaSync(dm);
        floater(dm.x, dm.y - 90, t('f_3heads'), '#ffb3ba');
      }
      return;   // lộ điểm yếu: ngừng tấn công
    }
    dm.heads.forEach(function(h){
      if(h.hp <= 0){ h.regrow -= dt; if(h.regrow <= 0){ h.hp = h.maxHp; ravanaSync(dm); floater(dm.x, dm.y - 90, t('f_head_back'), '#ffb3ba'); } }
    });
    dm.actT -= dt;
    if(dm.actT <= 0){
      dm.actT = rand(2.0, 2.8);
      G.fireballs.push({ x: dm.x - 60, y: dm.y - 20, vx: -235, vy: (BOW.y - dm.y + 20) * 0.55, r: 11, t: 0 }); sThrow();
    }
    dm.minionT -= dt;
    if(dm.minionT <= 0 && G.demons.length < 7){
      dm.minionT = 4.5;
      spawnMinion('fly', dm.x - 30, dm.y + 40).amp = 26;
      floater(dm.x, dm.y - 110, t('f_ravana_call'), '#ffb3ba');
    }
  } else if(dm.id === 'tataka'){
    if(dm.x > dm.stopX) dm.x -= dm.spd * dt;
    else {
      dm.x += Math.sin(dm.t * 1.3) * 10 * dt;
      dm.actT -= dt;
      if(dm.actT <= 0){
        dm.actT = rand(2.6, 3.4) / d.speed;
        // đá tảng bay theo đường cầu, tới vị trí Rama sau ~1,7 giây
        var T = 1.7, sx = dm.x - 20, sy = dm.y - dm.r * 2.4, tx = DEF_X + 10, ty = GROUND - 100, g = 300;
        G.fireballs.push({ x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy - .5 * g * T * T) / T, g: g, r: 15, t: 0, rock: true }); sThrow();
      }
    }
  } else if(dm.id === 'kumbha'){
    dm.x -= dm.spd * dt;
    dm.actT -= dt;
    if(dm.actT <= 0){
      dm.actT = rand(4.5, 6);
      G.shake = Math.max(G.shake, 10); G.charging = false; G.power = 0;
      burst(dm.x, GROUND, '#9db4d8', 20, 200);
      floater(dm.x, dm.y - dm.r * 2.4, t('f_kumbha_stomp'), '#ffb3ba');
      ring(dm.x, GROUND, 220, '#9db4d8', .6); sStomp(); buzz(120);
    }
    if(dm.x - dm.r < DEF_X + 24){
      dm.x += 300; hurtPlayer();
      floater(DEF_X + 60, GROUND - 160, t('f_kumbha_break'), '#ff8f9a');
    }
  } else if(dm.id === 'maricha'){
    marichaMove(dm, dt);
    dm.splitT -= dt;
    if(dm.splitT <= 0){
      dm.splitT = 6;
      G.demons.forEach(function(o){ if(o.type === 'decoy') vanishDecoy(o); });
      for(var j = 0; j < 2; j++){
        G.demons.push({ type:'decoy', ground:true, minion:true, x: rand(420, 860), y: GROUND, tx: rand(420, 860), r: dm.r,
                        hp:1, maxHp:1, dead:false, hitFlash:0, t: rand(0, 6), life: 5.6, coin: 0, phase: rand(0, 6) });
      }
      burst(dm.x, bodyY(dm), '#ffe9a8', 16, 140);
      dm.x = rand(420, 860); dm.tx = rand(420, 860);
      floater(W / 2, 220, t('f_maricha_split'), '#ffe9a8'); sMagic();
    }
    dm.minionT -= dt;
    if(dm.minionT <= 0 && G.demons.length < 8){ dm.minionT = 5; spawnMinion('ground', W + 40); }
  }
}
function marichaMove(dm, dt){
  var dir = dm.tx > dm.x ? 1 : -1;
  dm.x += dir * 170 * dt;
  dm.face = dir;
  if(Math.abs(dm.tx - dm.x) < 8) dm.tx = rand(420, 860);
  dm.y = GROUND - Math.abs(Math.sin(dm.t * 5)) * 34;
}

/* ---------------- chế độ Vô tận: đợt quỷ tăng dần, boss mỗi 5 đợt ---------------- */
var ENDLESS_TYPES = ['ground', 'fly', 'fast', 'armor', 'shield', 'splitter', 'shaman'];
var ENDLESS_BOSSES = ['tataka', 'maricha', 'kumbha', 'ravana'];
function endlessLevel(wave){
  var mix = {}, n = Math.min(ENDLESS_TYPES.length, 1 + Math.floor((wave + 1) / 2)), i;
  for(i = 0; i < n; i++) mix[ENDLESS_TYPES[i]] = 1 / n;
  return { ch: Math.min(2, Math.floor((wave - 1) / 5) % 3), name: t('endless_name'), sub: t('wave', { n: wave }),
           total: 8 + wave * 2, interval: Math.max(.7, 1.7 - wave * .06), speed: Math.min(48, 27 + wave * 1.4), mix: mix,
           sky: ['dawn', 'day', 'dusk', 'sunset', 'night', 'storm', 'lanka'][(wave - 1) % 7],
           boss: wave % 5 === 0 ? ENDLESS_BOSSES[(wave / 5 - 1) % 4] : null };
}
function nextWave(){
  var bonus = 10 * G.wave;
  G.coinsEarned += bonus; addCoins(bonus);
  G.wave++;
  var L = endlessLevel(G.wave);
  G.lvl = L; G.toSpawn = L.total; G.spawned = 0; G.killed = 0; G.spawnT = 2.2;
  G.bossSpawned = false; G.bossRef = null;
  if(G.wave % 5 === 1 && G.hp < G.maxHp){ G.hp++; floater(DEF_X + 40, GROUND - 170, t('f_hp'), '#8ff0b3'); }
  if(G.wave - 1 > S.endlessBest){ S.endlessBest = G.wave - 1; saveGame(); }
  floater(W / 2, 200, t('f_wave', { n: G.wave }) + (L.boss ? t('f_boss') : '') + '  +' + bonus + ' ' + t('coin_unit'), '#ffe9a8');
  sWave();
  if(typeof onWaveCleared === 'function') onWaveCleared(G.wave - 1);
}

/* ---------------- Lakshmana trợ chiến: tự ngắm quỹ đạo cầu vào quỷ gần vạch nhất ---------------- */
function allyGrip(){
  var A = ART.ally, im = getImg(A.src);
  if(!im) return null;
  var w = A.h * im.naturalWidth / im.naturalHeight;
  return { x: A.x - w / 2 + A.grip[0] * w, y: GROUND - 2 - A.h + A.grip[1] * A.h };
}
function fireAlly(){
  var g = allyGrip(); if(!g) return;
  var tg = null;
  G.demons.forEach(function(d){ if(!d.dead && d.type !== 'decoy' && d.x > g.x + 40 && (!tg || d.x < tg.x)) tg = d; });
  if(!tg) return;
  var tx = tg.x, ty = bodyY(tg);
  if(tg.id === 'ravana'){ var hd = tg.exposed ? null : ravanaHeads(tg).filter(function(h){ return h.h.hp > 0; })[0]; var c = hd || ravanaChest(tg); tx = c.x; ty = c.y; }
  var v = 880, gr = 620, dx = tx - g.x;
  dx -= (tg.spd || 0) * dx / v * (tg.type === 'boss' ? 0 : 1);   // đón đầu quỷ đang tiến tới
  var dy = g.y - ty, disc = v * v * v * v - gr * (gr * dx * dx + 2 * dy * v * v);
  if(disc < 0 || dx <= 0) return;
  var th = Math.atan((v * v - Math.sqrt(disc)) / (gr * dx));
  G.arrows.push({ x: g.x, y: g.y, vx: v * Math.cos(th), vy: -v * Math.sin(th), astra: true, ally: true, pierce: 0, dead: false, hitSet: [] });
  G.allyShot = elapsed; sShoot();
}

/* ---------------- update ---------------- */
function update(dt){
  if(G.hitStop > 0){ G.hitStop -= dt; return; }          // khựng hình khi trúng đòn nặng
  if(G.slowmo > 0){ G.slowmo -= dt; dt *= .3; }          // quay chậm khi hạ boss
  G.time += dt;
  if(G.shake > 0) G.shake = Math.max(0, G.shake - dt * 26);
  if(G.flash > 0) G.flash -= dt;
  if(G.bigFlash > 0) G.bigFlash -= dt;
  if(G.windFx > 0) G.windFx -= dt;
  if(G.banner){ G.banner.t += dt; if(G.banner.t >= G.banner.life) G.banner = null; }
  for(var ri = G.rings.length - 1; ri >= 0; ri--){ G.rings[ri].t += dt; if(G.rings[ri].t >= G.rings[ri].life) G.rings.splice(ri, 1); }
  for(var ci = G.corpses.length - 1; ci >= 0; ci--){ G.corpses[ci].t += dt; if(G.corpses[ci].t >= G.corpses[ci].life) G.corpses.splice(ci, 1); }
  for(var sti = G.stuck.length - 1; sti >= 0; sti--){ G.stuck[sti].t += dt; if(G.stuck[sti].t >= 2.4) G.stuck.splice(sti, 1); }

  // charging (ping-pong power)
  if(G.charging){
    G.power += G.chargeDir * dt * G.chargeRate;
    if(G.power >= 100){ G.power = 100; G.chargeDir = -1; }
    if(G.power <= 8){ G.power = 8; G.chargeDir = 1; }
  }

  // spawning — màn boss: boss ra sau 3 con quỷ đầu
  if(G.toSpawn > 0){
    G.spawnT -= dt;
    if(G.spawnT <= 0){
      G.spawnT = G.lvl.interval * DIFFS[diffKey].spawn * rand(.75, 1.25);
      if(G.lvl.boss && !G.bossSpawned && G.spawned >= 3) spawnBoss(G.lvl.boss);
      else spawnDemon(pickType(G.lvl.mix));
      G.spawned++; G.toSpawn--;
    }
  }

  if(upLv('ally') > 0){ G.allyT -= dt; if(G.allyT <= 0){ G.allyT = upLv('ally') >= 2 ? 1.6 : 2.6; fireAlly(); } }

  // Agneyastra: mưa tên lửa
  if(G.rain){
    G.rain.t -= dt;
    if(G.rain.t <= 0){
      G.rain.t = .06; G.rain.n--;
      G.arrows.push({ x: rand(250, W - 20), y: -20, vx: -70, vy: 640, fire: true, golden: false, astra: true, pierce: 1, dead: false, hitSet: [] });
      if(G.rain.n <= 0) G.rain = null;
    }
  }
  // Varunastra: sóng thần quét từ trái sang phải
  for(var wi = G.waves.length - 1; wi >= 0; wi--){
    var wv = G.waves[wi]; wv.x += 640 * dt;
    G.demons.slice().forEach(function(dm){
      if(!dm.ground || dm.dead || wv.hitSet.indexOf(dm) >= 0 || Math.abs(dm.x - wv.x) > dm.r + 24) return;
      wv.hitSet.push(dm);
      if(dm.type === 'boss'){ dm.x += 90; hitDemon(dm, 2, { astra:true }); }
      else { dm.x = Math.min(W + 40, dm.x + 220); hitDemon(dm, 1, { astra:true }); }
    });
    if(wv.x > W + 80) G.waves.splice(wi, 1);
  }

  // powerups
  G.puT -= dt;
  if(G.puT <= 0){ G.puT = rand(11, 17); spawnPowerup(); }
  for(var pi = G.powerups.length - 1; pi >= 0; pi--){
    var pu = G.powerups[pi]; pu.t += dt; pu.x -= pu.spd * dt;
    if(pu.x < -40) G.powerups.splice(pi, 1);
  }

  // demons
  for(var i = G.demons.length - 1; i >= 0; i--){
    var dm = G.demons[i];
    dm.t += dt; if(dm.hitFlash > 0) dm.hitFlash -= dt;
    if(dm.type === 'boss') updateBoss(dm, dt);
    else if(dm.type === 'decoy'){ marichaMove(dm, dt); dm.life -= dt; if(dm.life <= 0) dm.dead = true; }
    else if(dm.type === 'fly'){
      dm.x -= dm.spd * dt;
      dm.y = dm.baseY + Math.sin(dm.t * 3.1) * dm.amp;
    } else if(dm.type === 'shaman'){
      if(dm.x > dm.stopX) dm.x -= dm.spd * dt;
      if(dm.healFx > 0) dm.healFx -= dt;
      dm.healT -= dt;
      if(dm.healT <= 0){
        dm.healT = 3.2; dm.healFx = .6; var healed = false;
        G.demons.forEach(function(o){
          if(o === dm || o.dead || o.type === 'decoy' || o.id === 'ravana' || o.hp >= o.maxHp) return;
          if(Math.hypot(o.x - dm.x, o.y - dm.y) > 260) return;
          o.hp++; floater(o.x, bodyY(o) - o.r - 20, '+1', '#7be3a0'); healed = true;
        });
        if(healed) sMagic();
      }
    } else {
      dm.x -= dm.spd * dt;
    }
    if(dm.dead){ G.demons.splice(i, 1); continue; }
    if(dm.type !== 'boss' && dm.type !== 'decoy' && dm.x - dm.r < DEF_X){
      G.demons.splice(i, 1);
      G.combo = 0;
      floater(DEF_X + 26, GROUND - 120, t('f_break'), '#ff8f9a');
      hurtPlayer();
    }
  }

  // fireballs & đá tảng
  for(var fi = G.fireballs.length - 1; fi >= 0; fi--){
    var fb = G.fireballs[fi]; fb.t += dt;
    if(fb.g) fb.vy += fb.g * dt;
    fb.x += fb.vx * dt; fb.y += fb.vy * dt;
    if(!fb.rock && Math.random() < .5) G.parts.push({ x: fb.x + 8, y: fb.y + rand(-4,4), vx: rand(10,40), vy: rand(-14,14), life: .3, t: 0, color: '#ff9a3d', r: rand(2,4) });
    if(fb.x < DEF_X + 16 && fb.y > GROUND - 150){
      G.fireballs.splice(fi, 1); burst(fb.x, fb.y, fb.rock ? '#b8a890' : '#ff9a3d', 20, 200); hurtPlayer(); floater(DEF_X + 30, GROUND - 150, fb.rock ? t('f_hit_rock') : t('f_hit_fire'), '#ff8f9a');
    } else if(fb.x < -30 || fb.y > H){ G.fireballs.splice(fi, 1); }
  }

  // arrows
  var GRAV = 620;
  for(var ai = G.arrows.length - 1; ai >= 0; ai--){
    var ar = G.arrows[ai];
    ar.vy += GRAV * dt; ar.x += ar.vx * dt; ar.y += ar.vy * dt;
    var trail = ar.golden ? '#ffd97a' : (ar.perfect ? '#8ff0ff' : (ar.fire ? '#ff8a3d' : (ar.astra ? null : trailColor())));
    if(trail) G.parts.push({ x: ar.x, y: ar.y, vx: rand(-8,8), vy: rand(-8,8), life: .25, t: 0, color: trail, r: 2.4 });
    var hitSomething = false;

    // vs powerups
    for(var qi = G.powerups.length - 1; qi >= 0 && !ar.astra; qi--){
      var q = G.powerups[qi];
      if(Math.hypot(ar.x - q.x, ar.y - q.y) < q.r + 8){
        G.powerups.splice(qi, 1); hitSomething = true; G.hits++;
        if(q.kind === 'fire'){ G.fireUntil = elapsed + 12; floater(q.x, q.y - 26, t('f_fire_arrow'), '#ffb27a'); }
        else { G.hp = Math.min(G.maxHp, G.hp + 1); floater(q.x, q.y - 26, t('f_hp'), '#8ff0b3'); updateHUD(); }
        burst(q.x, q.y, q.kind === 'fire' ? '#ff9a3d' : '#ff8fab', 16, 150); ring(q.x, q.y, 50, q.kind === 'fire' ? '#ffb27a' : '#ff8fab', .4); sPower();
        break;
      }
    }
    // vs fireballs / đá tảng
    if(!hitSomething){
      for(var bi = G.fireballs.length - 1; bi >= 0; bi--){
        var b2 = G.fireballs[bi];
        if(Math.hypot(ar.x - b2.x, ar.y - b2.y) < b2.r + 9){
          G.fireballs.splice(bi, 1); hitSomething = true; if(!ar.astra) G.hits++;
          G.score += 25; burst(b2.x, b2.y, b2.rock ? '#b8a890' : '#ffb27a', 14, 160);
          floater(b2.x, b2.y - 20, (b2.rock ? t('f_shoot_rock') : t('f_shoot_fire')) + ' +25', '#ffd97a'); ring(b2.x, b2.y, 40, '#ffb27a', .3); sBoom();
          break;
        }
      }
    }
    // vs demons
    if(!hitSomething){
      for(var di = 0; di < G.demons.length; di++){
        var dd = G.demons[di];
        if(dd.dead || ar.hitSet.indexOf(dd) >= 0) continue;
        var cy = bodyY(dd), rh = null;
        if(dd.id === 'ravana'){ rh = ravanaHitTest(dd, ar.x, ar.y); if(!rh) continue; }
        else if(Math.hypot(ar.x - dd.x, ar.y - cy) >= hitR(dd) + 7) continue;
        hitSomething = true; ar.hitSet.push(dd);
        if(dd.type === 'decoy'){ vanishDecoy(dd); G.combo = 0; ar.dead = true; break; }
        // quỷ khiên: chặn tên bay thẳng, chỉ trúng khi tên rơi dốc từ trên xuống (hoặc tên vàng / thần tiễn)
        if(dd.type === 'shield' && !ar.golden && !ar.astra && Math.atan2(ar.vy, Math.abs(ar.vx)) < 0.55){
          ar.dead = true; G.combo = 0; sShield();
          burst(ar.x, ar.y, '#c7d0e0', 8, 120);
          floater(dd.x, cy - dd.r - 18, t('f_shield'), '#c7d0e0');
          break;
        }
        if(rh && rh.body && !dd.exposed){
          ar.dead = true; dd.hitFlash = .1;
          floater(dd.x, dd.y + 10, t('f_heads'), '#ffb3ba');
          break;
        }
        var head = !ar.astra && !rh && ar.y < cy - hitR(dd) * .35;
        var dmg = (ar.golden ? 2 : 1) + (ar.fire ? 1 : 0) + (ar.perfect ? 1 : 0) + (head ? 1 : 0);
        if(!ar.astra){
          G.hits++;
          G.combo++; G.bestCombo = Math.max(G.bestCombo, G.combo); if(G.combo > S.stats.bestCombo) S.stats.bestCombo = G.combo;
          if(G.combo >= 2){ G.comboT = elapsed; sCombo(G.combo); }
          addEnergy(ENERGY.hit + (head || ar.perfect ? ENERGY.crit : 0));
          if(G.combo % 5 === 0){ var bonus = 10; G.coinsEarned += bonus; addCoins(bonus); addEnergy(ENERGY.combo5); floater(dd.x, cy - dd.r - 30, t('f_combo', { n: G.combo }) + ' +' + bonus + ' ' + t('coin_unit'), '#7be3c3'); }
          if(head){ S.stats.headshots++; floater(dd.x - 10, cy - dd.r - 46, t('f_crit'), '#ff9a6a'); sCrit(); G.shake = Math.max(G.shake, 4); }
        }
        burst(ar.x, ar.y, ar.golden ? '#ffd97a' : '#ffe9a8', 8, 130);
        ring(ar.x, ar.y, head || ar.golden ? 34 : 22, ar.golden ? '#ffd97a' : (head ? '#ff9a6a' : '#fff3d0'), .25);
        if(rh && rh.head) hitRavana(dd, dmg, rh); else hitDemon(dd, dmg, ar);
        if(ar.pierce > 0){ ar.pierce--; hitSomething = false; }
        else ar.dead = true;
        break;
      }
    }
    if(ar.y > GROUND + 4 && ar.vy > 0){
      burst(ar.x, GROUND, '#9db4d8', 4, 60);
      if(!ar.dead && !ar.ally){ G.stuck.push({ x: ar.x, a: Math.atan2(ar.vy, ar.vx), col: ar.golden ? '#ffd97a' : (ar.fire ? '#ff9a3d' : (ar.perfect ? '#8ff0ff' : '#e8e8e8')), t: 0 }); if(G.stuck.length > 30) G.stuck.shift(); }
      if(!hitSomething && !ar.astra){ G.combo = 0; }
      ar.dead = true;
    }
    if(ar.x > W + 40 || ar.y > H + 30 || ar.x < -20) { if(!hitSomething && !ar.dead && !ar.astra) G.combo = 0; ar.dead = true; }
    if(ar.dead) G.arrows.splice(ai, 1);
  }

  // particles & floaters
  for(var ppi = G.parts.length - 1; ppi >= 0; ppi--){
    var p = G.parts[ppi]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g == null ? 300 : p.g) * dt;
    if(p.t >= p.life) G.parts.splice(ppi, 1);
  }
  for(var fli = G.floats.length - 1; fli >= 0; fli--){
    var f = G.floats[fli]; f.t += dt; f.y -= 34 * dt;
    if(f.t >= f.life) G.floats.splice(fli, 1);
  }

  updateHUD();
  // win check (ảo ảnh của Maricha không tính) — Vô tận: sang đợt mới
  if(!G.over && G.toSpawn === 0 && !G.demons.some(function(o){ return o.type !== 'decoy'; })){
    if(G.mode === 'endless') nextWave();
    else {
      G.over = true; G.banner = { text: t('f_victory'), t: 0, life: 1.4, win: true };
      sparks(W / 2, 200, '#ffd97a', 40); music.tense(false);
      setTimeout(showWin, 1200);
    }
  }
}
/* ---------------- input ---------------- */
function canvasPos(e){
  var r = canvas.getBoundingClientRect();
  var cx = (e.touches ? e.touches[0].clientX : e.clientX);
  var cy = (e.touches ? e.touches[0].clientY : e.clientY);
  return { x: (cx - r.left) * W / r.width, y: (cy - r.top) * H / r.height };
}
var aiming = false;
function aimAt(p){
  var dx = p.x - BOW.x, dy = p.y - BOW.y;
  if(dx < 12) dx = 12;
  G.angle = clamp(Math.atan2(dy, dx), -1.25, 0.35);
}
canvas.addEventListener('pointerdown', function(e){
  if(state !== 'playing' || !G) return;
  e.preventDefault();
  aiming = true; canvas.setPointerCapture(e.pointerId);
  aimAt(canvasPos(e));
  G.charging = true; G.power = 8; G.chargeDir = 1; sDraw();
});
canvas.addEventListener('pointermove', function(e){
  if(!aiming || state !== 'playing' || !G) return;
  aimAt(canvasPos(e));
});
function releaseShot(){
  if(state === 'playing' && G && G.charging){
    fireArrow();
  }
  if(G){ G.charging = false; G.power = 0; }
  aiming = false;
}
canvas.addEventListener('pointerup', releaseShot);
canvas.addEventListener('pointercancel', releaseShot);

var spaceHeld = false;
document.addEventListener('keydown', function(e){
  if(e.code === 'Space'){
    e.preventDefault();
    if(state === 'playing' && G && !spaceHeld){ spaceHeld = true; G.charging = true; G.power = 8; G.chargeDir = 1; sDraw(); }
  }
  if(state === 'playing' && G){
    if(e.code === 'ArrowUp' || e.code === 'KeyW') G.angle = clamp(G.angle - 0.045, -1.25, 0.35);
    if(e.code === 'ArrowDown' || e.code === 'KeyS') G.angle = clamp(G.angle + 0.045, -1.25, 0.35);
  }
  if(state === 'playing' && /^Digit[1-4]$/.test(e.code)){
    var A = ASTRAS.filter(function(a){ return a.key === e.code.slice(5); })[0];
    if(A) castAstra(A.id);
  }
  if(e.code === 'KeyP' || e.code === 'Escape'){
    if(state === 'playing') setPaused(true);
    else if(state === 'paused') setPaused(false);
  }
});
document.addEventListener('keyup', function(e){
  if(e.code === 'Space'){ spaceHeld = false; releaseShot(); }
});
/* ============================================================
   VẼ CANVAS
   ============================================================ */
/* ---------------- ảnh minh họa (tải lười, thiếu ảnh thì vẽ bằng code) ---------------- */
var IMG = {};
function getImg(src){
  if(!src) return null;
  var im = IMG[src];
  if(!im){ im = IMG[src] = new Image(); im.src = src; }
  return im.complete && im.naturalWidth ? im : null;
}
var WHITE = {};   // bản trắng của sprite để nháy khi trúng đòn
function whiteOf(im){
  var c = WHITE[im.src];
  if(!c){
    c = WHITE[im.src] = document.createElement('canvas');
    c.width = im.naturalWidth; c.height = im.naturalHeight;
    var x = c.getContext('2d'); x.drawImage(im, 0, 0);
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  }
  return c;
}
function outfit(){ return OUTFITS.filter(function(o){ return o.id === S.outfit; })[0] || OUTFITS[0]; }
function trailColor(){ var t = TRAILS.filter(function(o){ return o.id === S.trail; })[0]; return t ? t.color : null; }

/* ---------------- nền nhiều lớp theo chương ---------------- */
function hills(baseY, amp, step, seed, color, drift){
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-10, GROUND);
  for(var x = -10 - (drift % step); x <= W + step; x += step){
    var k = Math.round((x + drift) / step) + seed;
    ctx.lineTo(x, baseY - amp * (.5 + .5 * Math.sin(k * 2.17) * Math.cos(k * 1.31)));
  }
  ctx.lineTo(W + 10, GROUND); ctx.closePath(); ctx.fill();
}
function treeRow(y, size, gap, color, drift, round){
  ctx.fillStyle = color;
  for(var x = -gap - (drift % gap); x < W + gap; x += gap){
    var k = Math.round((x + drift) / gap), h = size * (.75 + ((k * 37) % 10) / 20);
    if(round){
      ctx.fillRect(x + gap * .45, y - h * .5, 4, h * .5);
      ctx.beginPath(); ctx.arc(x + gap * .47, y - h * .75, h * .38, 0, 7); ctx.arc(x + gap * .3, y - h * .55, h * .28, 0, 7); ctx.arc(x + gap * .65, y - h * .55, h * .28, 0, 7); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + gap * .25, y - h); ctx.lineTo(x + gap * .5, y); ctx.closePath(); ctx.fill();
    }
  }
}
function temple(x, y, s, color){
  ctx.fillStyle = color;
  ctx.fillRect(x - 22 * s, y - 30 * s, 44 * s, 30 * s);
  ctx.beginPath(); ctx.moveTo(x - 18 * s, y - 30 * s); ctx.quadraticCurveTo(x - 10 * s, y - 70 * s, x, y - 86 * s); ctx.quadraticCurveTo(x + 10 * s, y - 70 * s, x + 18 * s, y - 30 * s); ctx.closePath(); ctx.fill();
  ctx.fillRect(x - 1.5 * s, y - 98 * s, 3 * s, 14 * s);
}
var STAR_POS = [], EMBERS = [];
for(var si = 0; si < 70; si++) STAR_POS.push({ x: Math.random() * W, y: Math.random() * 240, r: Math.random() * 1.6 + .4, p: Math.random() * 6 });
for(var ei = 0; ei < 40; ei++) EMBERS.push({ x: Math.random() * W, y: Math.random() * H, s: 20 + Math.random() * 40, p: Math.random() * 6 });

function drawBackground(L, t){
  var skyKey = L.sky, ch = L.ch || 0;
  var art = getImg(ART.bg[skyKey]);
  if(art){ ctx.drawImage(art, 0, 0, W, H); drawDefense(t); return; }
  var c = SKIES[skyKey] || SKIES.night;
  var dark = skyKey === 'night' || skyKey === 'storm' || skyKey === 'lanka';
  var gr = ctx.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, c[0]); gr.addColorStop(.62, c[1]); gr.addColorStop(1, c[2]);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  // sao
  if(dark || skyKey === 'dusk'){
    for(var i = 0; i < STAR_POS.length; i++){
      var st = STAR_POS[i];
      ctx.globalAlpha = .45 + .4 * Math.sin(t * 1.6 + st.p);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  // mặt trời / trăng có quầng
  var mx = W - 170, my = 74, sun = !dark && skyKey !== 'dusk';
  var halo = ctx.createRadialGradient(mx, my, 10, mx, my, 120);
  halo.addColorStop(0, sun ? 'rgba(255,220,120,.45)' : 'rgba(240,235,210,.25)'); halo.addColorStop(1, 'rgba(255,220,120,0)');
  ctx.fillStyle = halo; ctx.fillRect(mx - 120, my - 120, 240, 240);
  ctx.beginPath(); ctx.arc(mx, my, sun ? 30 : 24, 0, 7);
  ctx.fillStyle = sun ? '#ffd94d' : '#f4ecd8'; ctx.fill();
  if(!sun){ ctx.beginPath(); ctx.arc(mx + 9, my - 5, 5, 0, 7); ctx.arc(mx - 7, my + 8, 3.6, 0, 7); ctx.fillStyle = 'rgba(160,150,120,.35)'; ctx.fill(); }
  // mây trôi
  if(!dark){
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    for(var ci = 0; ci < 5; ci++){
      var cx = ((ci * 230 + t * (8 + ci * 3)) % (W + 240)) - 120, cy = 60 + ci * 28;
      ctx.beginPath(); ctx.ellipse(cx, cy, 70, 14, 0, 0, 7); ctx.ellipse(cx + 30, cy - 8, 40, 12, 0, 0, 7); ctx.fill();
    }
  }
  var drift = t * 4;
  // lớp xa: núi
  hills(300, 70, 90, 3, dark ? 'rgba(14,16,36,.6)' : 'rgba(60,50,90,.35)', drift * .3);
  // lớp giữa theo chương
  if(ch === 0){
    temple(250, 360, .9, dark ? 'rgba(10,12,28,.55)' : 'rgba(70,40,60,.35)');
    hills(375, 40, 70, 9, dark ? 'rgba(10,22,24,.75)' : 'rgba(34,70,48,.6)', drift * .6);
    treeRow(400, 70, 46, dark ? 'rgba(6,16,18,.85)' : 'rgba(22,52,34,.85)', drift * .8, true);
  } else if(ch === 1){
    hills(370, 34, 80, 5, dark ? 'rgba(12,20,30,.7)' : 'rgba(40,74,60,.55)', drift * .6);
    // sông Godavari
    var rv = ctx.createLinearGradient(0, 405, 0, 430);
    rv.addColorStop(0, dark ? 'rgba(70,100,150,.5)' : 'rgba(140,200,230,.55)'); rv.addColorStop(1, 'rgba(60,110,150,.2)');
    ctx.fillStyle = rv; ctx.fillRect(0, 405, W, 25);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1.5;
    for(var r2 = 0; r2 < 6; r2++){ var rx = (r2 * 170 + t * 20) % (W + 60) - 30; ctx.beginPath(); ctx.moveTo(rx, 416); ctx.lineTo(rx + 34, 416); ctx.stroke(); }
    // túp lều
    ctx.fillStyle = dark ? 'rgba(20,16,12,.85)' : 'rgba(90,64,36,.85)';
    ctx.beginPath(); ctx.moveTo(300, 440); ctx.lineTo(340, 392); ctx.lineTo(380, 440); ctx.closePath(); ctx.fill();
    treeRow(450, 64, 58, dark ? 'rgba(6,14,16,.85)' : 'rgba(26,58,34,.85)', drift * .9, true);
  } else {
    // biển & thành Lanka
    ctx.fillStyle = dark ? 'rgba(20,30,60,.6)' : 'rgba(40,90,140,.5)'; ctx.fillRect(0, 380, W, 40);
    var gold = skyKey === 'lanka' ? 'rgba(60,14,10,.9)' : 'rgba(12,12,30,.8)';
    ctx.fillStyle = gold;
    [[W - 300, 110, 30], [W - 255, 160, 38], [W - 200, 210, 34], [W - 150, 150, 40], [W - 95, 190, 30], [W - 50, 120, 28]].forEach(function(tw){
      ctx.fillRect(tw[0], 420 - tw[1], tw[2], tw[1]);
      ctx.beginPath(); ctx.moveTo(tw[0] - 6, 420 - tw[1]); ctx.lineTo(tw[0] + tw[2] / 2, 420 - tw[1] - 38); ctx.lineTo(tw[0] + tw[2] + 6, 420 - tw[1]); ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = skyKey === 'lanka' ? '#ffb04a' : '#ffca6a';
    [[W - 285, 340], [W - 240, 300], [W - 236, 350], [W - 185, 260], [W - 135, 320], [W - 130, 280], [W - 80, 330], [W - 40, 330]].forEach(function(wp){ ctx.fillRect(wp[0], wp[1], 5, 8); });
    treeRow(440, 40, 64, dark ? 'rgba(8,10,20,.85)' : 'rgba(30,40,40,.8)', drift * .9, false);
  }
  // Lanka bốc cháy: ánh lửa & tàn tro bay lên
  if(skyKey === 'lanka'){
    var fg = ctx.createLinearGradient(0, 300, 0, GROUND);
    fg.addColorStop(0, 'rgba(255,90,40,0)'); fg.addColorStop(1, 'rgba(255,90,40,' + (.25 + .08 * Math.sin(t * 3)) + ')');
    ctx.fillStyle = fg; ctx.fillRect(0, 300, W, GROUND - 300);
    ctx.fillStyle = '#ffb04a';
    EMBERS.forEach(function(e){ var y = (e.y - t * e.s) % H; if(y < 0) y += H; ctx.globalAlpha = .7; ctx.fillRect(e.x + Math.sin(t + e.p) * 8, y, 2.2, 2.2); });
    ctx.globalAlpha = 1;
  }
  // mặt đất & cỏ
  var gg = ctx.createLinearGradient(0, GROUND, 0, H);
  gg.addColorStop(0, ch === 2 ? '#3a3328' : '#2c4632'); gg.addColorStop(1, ch === 2 ? '#1a1610' : '#15251b');
  ctx.fillStyle = gg; ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.strokeStyle = ch === 2 ? 'rgba(120,100,70,.5)' : 'rgba(90,150,90,.5)'; ctx.lineWidth = 2;
  ctx.beginPath();
  for(var gx = 4; gx < W; gx += 13){ var sw = Math.sin(t * 2 + gx * .05) * 3; ctx.moveTo(gx, GROUND + 2); ctx.lineTo(gx + sw, GROUND - 7 - (gx * 7) % 6); }
  ctx.stroke();
  // mưa & chớp
  if(skyKey === 'storm'){
    ctx.strokeStyle = 'rgba(180,200,255,.28)'; ctx.lineWidth = 1.2; ctx.beginPath();
    for(var ri = 0; ri < 70; ri++){ var x0 = (ri * 53 + t * 260) % (W + 60) - 30, y0 = (ri * 97 + t * 620) % H; ctx.moveTo(x0, y0); ctx.lineTo(x0 - 6, y0 + 16); }
    ctx.stroke();
    if(Math.sin(t * .9) > .985){ ctx.fillStyle = 'rgba(220,220,255,.25)'; ctx.fillRect(0, 0, W, H); }
  }
  drawDefense(t);
}
function drawDefense(t){
  ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(0, GROUND, W, 3);
  ctx.strokeStyle = 'rgba(255,93,108,.85)'; ctx.lineWidth = 3; ctx.setLineDash([9, 7]);
  ctx.beginPath(); ctx.moveTo(DEF_X, 150); ctx.lineTo(DEF_X, GROUND); ctx.stroke(); ctx.setLineDash([]);
  [196, 330].forEach(function(ty, ti){
    ctx.fillStyle = '#5a4028'; ctx.fillRect(DEF_X - 3, ty, 6, GROUND - ty);
    var fl = 9 + Math.sin(t * 11 + ti * 2.4) * 2.4;
    ctx.beginPath(); ctx.arc(DEF_X, ty - 8, fl, 0, 7); ctx.fillStyle = 'rgba(255,150,50,.9)';
    ctx.shadowColor = '#ff9a3d'; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(DEF_X, ty - 8, fl * .5, 0, 7); ctx.fillStyle = '#ffe9a8'; ctx.fill();
  });
}

function drawRama(tm){
  var O = outfit();
  var x = 52, gy = GROUND;
  if(drawRamaSprite(tm)) return;
  var ang = G ? G.angle : -0.3 + Math.sin(tm * .7) * .07;
  var charging = G && G.charging;
  // rock platform
  ctx.fillStyle = '#3d4b63'; ctx.beginPath();
  ctx.moveTo(x - 42, gy); ctx.lineTo(x - 26, gy - 20); ctx.lineTo(x + 66, gy - 20); ctx.lineTo(x + 84, gy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2e3a50'; ctx.fillRect(x - 42, gy - 4, 126, 4);
  var by = gy - 20; // feet line
  // legs (dhoti trắng viền vàng)
  ctx.strokeStyle = O.dhoti; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 8, by - 34); ctx.lineTo(x + 2, by); ctx.moveTo(x + 8, by - 34); ctx.lineTo(x + 22, by); ctx.stroke();
  // torso (áo cam saffron)
  ctx.fillStyle = O.torso;
  ctx.beginPath(); ctx.moveTo(x - 2, by - 78); ctx.lineTo(x + 20, by - 78); ctx.lineTo(x + 17, by - 32); ctx.lineTo(x + 1, by - 32); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f5b942'; ctx.fillRect(x - 2, by - 46, 22, 5); // đai vàng
  // sash chéo
  ctx.strokeStyle = O.sash; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(x, by - 76); ctx.lineTo(x + 18, by - 36); ctx.stroke();
  // head + crown
  ctx.fillStyle = '#c98a5a'; ctx.beginPath(); ctx.arc(x + 9, by - 92, 12, 0, 7); ctx.fill();
  ctx.fillStyle = '#2a2018'; ctx.beginPath(); ctx.arc(x + 6, by - 97, 11, Math.PI * .95, Math.PI * 1.95); ctx.fill(); // tóc búi
  ctx.fillStyle = O.crown;
  ctx.beginPath(); ctx.moveTo(x - 1, by - 100); ctx.lineTo(x + 19, by - 100); ctx.lineTo(x + 15, by - 108); ctx.lineTo(x + 9, by - 114); ctx.lineTo(x + 3, by - 108); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff5d6c'; ctx.beginPath(); ctx.arc(x + 9, by - 104, 2.4, 0, 7); ctx.fill(); // ngọc trán
  // quiver sau lưng
  ctx.save(); ctx.translate(x - 6, by - 66); ctx.rotate(.5);
  ctx.fillStyle = '#7a4a22'; ctx.fillRect(-4, -16, 8, 30);
  ctx.strokeStyle = '#d8d8d8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-2, -16); ctx.lineTo(-4, -26); ctx.moveTo(2, -15); ctx.lineTo(3, -26); ctx.stroke();
  ctx.restore();
  // bow arm + bow
  var bx = BOW.x, byy = BOW.y;
  ctx.strokeStyle = '#c98a5a'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(x + 14, by - 70); ctx.lineTo(bx - 6, byy + 4); ctx.stroke();
  ctx.save(); ctx.translate(bx, byy); ctx.rotate(ang);
  // cung vàng Kodanda
  ctx.strokeStyle = '#8a5a1d'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(0, 0, 46, -Math.PI / 2.25, Math.PI / 2.25); ctx.stroke();
  ctx.strokeStyle = '#f5b942'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 46, -Math.PI / 2.25, Math.PI / 2.25); ctx.stroke();
  var tipX = Math.sin(Math.PI / 2.25) * 46, tipY = Math.cos(Math.PI / 2.25) * 46;
  var pull = charging ? 10 + G.power * .22 : 2;
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(tipX, -tipY); ctx.lineTo(-pull, 0); ctx.lineTo(tipX, tipY); ctx.stroke();
  if(charging || state === 'playing'){
    // mũi tên đang lắp
    var col = G && ((G.shots + 1) % 5 === 0) ? '#ffd97a' : (G && elapsed < G.fireUntil ? '#ff8a3d' : (charging && G.power >= PERFECT ? '#8ff0ff' : '#e8e8e8'));
    ctx.strokeStyle = col; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(-pull, 0); ctx.lineTo(40, 0); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(52, 0); ctx.lineTo(38, -5); ctx.lineTo(38, 5); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  drawRamaHud(x, by);
}
// thanh lực + thời gian tên lửa phía trên đầu Rama
function drawRamaHud(x, by){
  var charging = G && G.charging;
  if(charging){
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(x - 6, by - 148, 92, 10);
    ctx.fillStyle = 'rgba(143,240,255,.35)'; ctx.fillRect(x - 4 + 88 * PERFECT / 100, by - 146, 88 * (100 - PERFECT) / 100, 6);
    ctx.fillStyle = G.power >= PERFECT ? '#8ff0ff' : '#f5b942'; ctx.fillRect(x - 4, by - 146, 88 * G.power / 100, 6);
    ctx.fillStyle = '#fff'; ctx.font = '700 11px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(t('c_power', { n: Math.round(G.power) }), x - 4, by - 154);
  }
  if(G && elapsed < G.fireUntil){
    ctx.font = '700 12px "Be Vietnam Pro",sans-serif'; ctx.fillStyle = '#ffb27a'; ctx.textAlign = 'left';
    ctx.fillText(t('c_fire', { n: Math.ceil(G.fireUntil - elapsed) }), x - 8, by - 166);
  }
}

/* Rama bằng ảnh: tay cầm cung của tư thế giương trùng điểm BOW, chân đứng trên mặt đất */
var TINT = {};
function ramaImg(pose){ var P = ART.rama && ART.rama[pose]; return P ? getImg(P.src) : null; }
function tinted(im, filter){   // trang phục = bộ lọc màu trên ảnh Rama (trình duyệt không hỗ trợ thì giữ ảnh gốc)
  if(!filter) return im;
  var key = im.src + '|' + filter;
  if(!TINT[key]){
    var c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
    var x = c.getContext('2d');
    if('filter' in x){ x.filter = filter; x.drawImage(im, 0, 0); TINT[key] = c; } else TINT[key] = im;
  }
  return TINT[key];
}
function drawRamaSprite(tm){
  var R = ART.rama, dIm = ramaImg('draw');
  if(!dIm) return false;
  var charging = G && G.charging;
  var pose = charging ? 'draw' : (G && G.lastShot != null && elapsed - G.lastShot < .3 ? 'release' : 'idle');
  var im = ramaImg(pose) || dIm, P = R[pose] || R.draw;
  var h = R.h, dw = h * dIm.naturalWidth / dIm.naturalHeight, w = h * im.naturalWidth / im.naturalHeight;
  var feetX = BOW.x - (R.draw.grip[0] - R.draw.foot) * dw, top = BOW.y - R.draw.grip[1] * h;
  ctx.drawImage(tinted(im, outfit().filter), feetX - P.foot * w, top + (pose === 'idle' ? Math.sin(tm * 2) : 0), w, h);
  if(charging){   // màu mũi tên sắp bắn: vàng / lửa / hoàn hảo
    var col = (G.shots + 1) % G.goldenEvery === 0 ? '#ffd97a' : (elapsed < G.fireUntil ? '#ff8a3d' : (G.power >= PERFECT ? '#8ff0ff' : null));
    if(col){ ctx.beginPath(); ctx.arc(BOW.x + 6, BOW.y, 7 + Math.sin(tm * 12) * 2, 0, 7); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0; }
  }
  drawRamaHud(feetX - 40, top + 8 + 148);
  return true;
}

function drawAlly(){
  var A = ART.ally, im = getImg(A.src);
  if(!im) return;
  var w = A.h * im.naturalWidth / im.naturalHeight;
  ctx.drawImage(im, A.x - w / 2, GROUND - 2 - A.h, w, A.h);
  if(G.allyShot != null && elapsed - G.allyShot < .15){ var g = allyGrip(); ctx.beginPath(); ctx.arc(g.x, g.y, 7, 0, 7); ctx.fillStyle = '#ffe9a8'; ctx.fill(); }
}

function hpBar(x, y, w, frac){
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x - w / 2, y, w, 6);
  ctx.fillStyle = frac > .5 ? '#43d68a' : (frac > .25 ? '#f5b942' : '#ff5d6c');
  ctx.fillRect(x - w / 2 + 1, y + 1, (w - 2) * clamp(frac, 0, 1), 4);
}
var SKINS = { ground:'#7d8a4a', fly:'#4f7a52', fast:'#b0563a', armor:'#8a5a48', shield:'#6f7d58', splitter:'#9a4d8c', shaman:'#3f7a74',
              tataka:'#6b4a3a', kumbha:'#5b4a6a', ravana:'#7a4fa3' };
function drawDemon(dm, t){
  if(dm.id === 'maricha' || dm.type === 'decoy'){ var ds = sprOf(dm); if(ds) drawSprite(dm, ds, getImg(sprSrc(dm, ds)), t); else drawDeer(dm, t); return; }
  if(dm.id === 'ravana'){ drawRavana(dm, t); return; }
  var spr = sprOf(dm), sim = spr && getImg(sprSrc(dm, spr));
  if(sim){ drawSprite(dm, spr, getImg(sprSrc(dm, spr)), t); return; }
  var groundType = dm.ground;
  var cy = bodyY(dm);
  var flash = dm.hitFlash > 0;
  var skin = SKINS[dm.id || dm.type] || SKINS.ground;
  if(flash) skin = '#ffffff';
  if(dm.type === 'shaman' && dm.healFx > 0){
    ctx.beginPath(); ctx.arc(dm.x, cy, 260 * (1 - dm.healFx / .6), 0, 7);
    ctx.strokeStyle = 'rgba(123,227,160,' + dm.healFx + ')'; ctx.lineWidth = 3; ctx.stroke();
  }
  ctx.save(); ctx.translate(dm.x, cy);
  if(dm.type === 'fly'){
    var flap = Math.sin(t * 14 + dm.t * 4) * .55;
    ctx.fillStyle = flash ? '#fff' : 'rgba(30,26,44,.9)';
    [-1, 1].forEach(function(s){
      ctx.save(); ctx.rotate(s * flap * .6); ctx.scale(s, 1);
      ctx.beginPath(); ctx.moveTo(6, -6); ctx.quadraticCurveTo(34, -26, 46, -8); ctx.quadraticCurveTo(32, -2, 8, 4); ctx.closePath(); ctx.fill();
      ctx.restore();
    });
  }
  var R = dm.r;
  // thân
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.ellipse(0, 6, R * .78, R * .95, 0, 0, 7); ctx.fill();
  // đầu
  ctx.beginPath(); ctx.arc(0, -R * .78, R * .58, 0, 7); ctx.fill();
  // sừng
  ctx.strokeStyle = flash ? '#fff' : '#e8dcc0'; ctx.lineWidth = Math.max(2.4, R * .11); ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-R * .4, -R * 1.1); ctx.quadraticCurveTo(-R * .75, -R * 1.5, -R * .5, -R * 1.62);
  ctx.moveTo(R * .4, -R * 1.1); ctx.quadraticCurveTo(R * .75, -R * 1.5, R * .5, -R * 1.62);
  ctx.stroke();
  // mắt đỏ
  ctx.fillStyle = '#ff2e3e';
  ctx.beginPath(); ctx.arc(-R * .22, -R * .82, R * .09 + 1, 0, 7); ctx.arc(R * .22, -R * .82, R * .09 + 1, 0, 7); ctx.fill();
  // nanh
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(-R * .3, -R * .52); ctx.lineTo(-R * .2, -R * .3); ctx.lineTo(-R * .1, -R * .52); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(R * .1, -R * .52); ctx.lineTo(R * .2, -R * .3); ctx.lineTo(R * .3, -R * .52); ctx.closePath(); ctx.fill();
  // chân đi bộ
  if(groundType){
    var step = Math.sin(dm.t * 9) * R * .34;
    ctx.strokeStyle = skin; ctx.lineWidth = R * .26;
    ctx.beginPath(); ctx.moveTo(-R * .25, R * .8); ctx.lineTo(-R * .25 + step, R * 1.28); ctx.moveTo(R * .3, R * .8); ctx.lineTo(R * .3 - step, R * 1.28); ctx.stroke();
  }
  if(dm.type === 'armor'){
    ctx.fillStyle = flash ? '#fff' : '#9aa7bd';
    ctx.beginPath(); ctx.arc(0, -R * .95, R * .5, Math.PI, 0); ctx.fill(); // mũ giáp
    ctx.fillRect(-R * .52, -R * .98, R * 1.04, 5);
    ctx.beginPath(); ctx.ellipse(-R * .85, R * .15, R * .3, R * .48, 0, 0, 7); ctx.fill(); // khiên
    ctx.fillStyle = '#5d6a82'; ctx.beginPath(); ctx.arc(-R * .85, R * .15, R * .13, 0, 7); ctx.fill();
    ctx.strokeStyle = flash ? '#fff' : '#c7d0e0'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(R * .62, -R * .1); ctx.lineTo(R * 1.05, -R * .55); ctx.stroke(); // gươm
  }
  if(dm.type === 'shield'){
    // khiên lớn che phía trước (bên trái)
    ctx.fillStyle = flash ? '#fff' : '#8d6a3a';
    ctx.beginPath(); ctx.ellipse(-R * .95, -R * .1, R * .42, R * 1.05, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = flash ? '#fff' : '#f5b942'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#f5b942'; ctx.beginPath(); ctx.arc(-R * .95, -R * .1, R * .14, 0, 7); ctx.fill();
  }
  if(dm.type === 'splitter'){
    ctx.strokeStyle = flash ? '#fff' : '#f0c8ff'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(0, -R * 1.3); ctx.lineTo(-R * .12, -R * .6); ctx.lineTo(R * .1, -R * .1); ctx.lineTo(-R * .08, R * .7); ctx.stroke();
  }
  if(dm.type === 'shaman'){
    ctx.strokeStyle = flash ? '#fff' : '#8a6a3a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-R * .7, R * 1.2); ctx.lineTo(-R * .9, -R * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(-R * .92, -R * 1.62, 6 + Math.sin(t * 6) * 1.5, 0, 7);
    ctx.fillStyle = '#7be3a0'; ctx.shadowColor = '#7be3a0'; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;
  }
  if(dm.id === 'tataka'){
    // tóc rối
    ctx.strokeStyle = flash ? '#fff' : '#1e1612'; ctx.lineWidth = 5;
    for(var hk = -3; hk <= 3; hk++){
      ctx.beginPath(); ctx.moveTo(hk * R * .12, -R * 1.2);
      ctx.quadraticCurveTo(hk * R * .3, -R * 1.6, hk * R * .38 + Math.sin(t * 4 + hk) * 4, -R * .5); ctx.stroke();
    }
    ctx.fillStyle = flash ? '#fff' : '#e8dcc0';
    ctx.beginPath(); ctx.arc(-R * .5, -R * .1, R * .1, 0, 7); ctx.arc(R * .5, -R * .1, R * .1, 0, 7); ctx.fill(); // vòng xương
  }
  if(dm.id === 'kumbha'){
    ctx.fillStyle = flash ? '#fff' : '#f5b942';
    ctx.beginPath(); ctx.moveTo(-R * .4, -R * 1.25); ctx.lineTo(-R * .2, -R * 1.6); ctx.lineTo(0, -R * 1.3); ctx.lineTo(R * .2, -R * 1.6); ctx.lineTo(R * .4, -R * 1.25); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = flash ? '#fff' : '#3a3040'; ctx.lineWidth = 12;   // chùy
    ctx.beginPath(); ctx.moveTo(-R * .6, R * .2); ctx.lineTo(-R * 1.3, -R * .7); ctx.stroke();
    ctx.fillStyle = flash ? '#fff' : '#6a5a72'; ctx.beginPath(); ctx.arc(-R * 1.35, -R * .8, R * .26, 0, 7); ctx.fill();
  }
  ctx.restore();
  if(dm.maxHp > 1 && dm.type !== 'boss' && !dm.dead) hpBar(dm.x, cy - dm.r * 1.95 - 8, 56, dm.hp / dm.maxHp);
}

/* quỷ dùng ảnh minh họa: neo chân giữa đáy ảnh, lắc nhẹ khi bước */
function drawSprite(dm, spr, im, t){
  var h = dm.r * spr.k * (dm.scale || 1), w = h * im.naturalWidth / im.naturalHeight;
  ctx.save();
  if(dm.type === 'decoy') ctx.globalAlpha = Math.sin(t * 2.2 + dm.phase) > .82 ? .3 : .95;   // ảo ảnh nhấp nháy
  ctx.translate(dm.x, spr.center ? dm.y + h / 2 : dm.y + 2);
  if(!spr.center) ctx.rotate(Math.sin(dm.t * 8) * .05);
  else ctx.translate(0, Math.sin(dm.t * 6) * 3);
  if(!!spr.flip !== (dm.face > 0)) ctx.scale(-1, 1);   // ảnh quay trái; Maricha chạy sang phải thì lật
  ctx.drawImage(dm.hitFlash > 0 ? whiteOf(im) : tinted(im, dm.tint), -w / 2, -h - (spr.center ? 0 : Math.abs(Math.sin(dm.t * 8)) * 3), w, h);
  ctx.restore();
  if(dm.type === 'shaman' && dm.healFx > 0){ ctx.globalAlpha = dm.healFx; ctx.fillStyle = '#7be3a0'; ctx.beginPath(); ctx.arc(dm.x, dm.y - h, 8, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  if(dm.maxHp > 1 && dm.type !== 'boss' && !dm.dead) hpBar(dm.x, (spr.center ? dm.y - h / 2 : dm.y - h) - 12, 56, dm.hp / dm.maxHp);
}

/* nai vàng Maricha & ảo ảnh — ảo ảnh thỉnh thoảng nhấp nháy */
function drawDeer(dm, t){
  var flash = dm.hitFlash > 0, R = dm.r;
  var alpha = 1;
  if(dm.type === 'decoy') alpha = Math.sin(t * 2.2 + dm.phase) > .82 ? .3 : .95;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(dm.x, dm.y - R * 1.3);
  ctx.scale(dm.face > 0 ? -1 : 1, 1);
  var body = flash ? '#fff' : '#e9b949', spot = '#fff3c8';
  var step = Math.sin(dm.t * 12) * 6;
  ctx.strokeStyle = body; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-R * .6, R * .3); ctx.lineTo(-R * .6 + step, R * 1.3); ctx.moveTo(R * .6, R * .3); ctx.lineTo(R * .6 - step, R * 1.3); ctx.stroke();
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 0, R, R * .55, 0, 0, 7); ctx.fill();
  ctx.fillStyle = spot; [[-.4,-.1],[.1,-.2],[.4,.1],[-.1,.2]].forEach(function(s){ ctx.beginPath(); ctx.arc(R * s[0], R * s[1], 3, 0, 7); ctx.fill(); });
  ctx.strokeStyle = body; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-R * .7, -R * .2); ctx.lineTo(-R * 1.05, -R * 1.0); ctx.stroke();
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(-R * 1.2, -R * 1.1, R * .32, R * .2, -.3, 0, 7); ctx.fill();
  ctx.strokeStyle = flash ? '#fff' : '#fff0b0'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(-R * 1.05, -R * 1.25); ctx.lineTo(-R * .9, -R * 1.8); ctx.lineTo(-R * .7, -R * 1.95);
  ctx.moveTo(-R * .95, -R * 1.6); ctx.lineTo(-R * 1.2, -R * 1.85); ctx.stroke();
  ctx.fillStyle = '#2a1a08'; ctx.beginPath(); ctx.arc(-R * 1.28, -R * 1.14, 2, 0, 7); ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
}

/* Ravana mười đầu */
function drawRavana(dm, t){
  var flash = dm.hitFlash > 0, R = dm.r, skin = flash ? '#fff' : SKINS.ravana;
  var rim = ravanaSprite();
  if(rim){
    var RH = ART.ravana.h, RW = RH * rim.naturalWidth / rim.naturalHeight;
    ctx.drawImage(flash ? whiteOf(rim) : rim, dm.x - RW / 2, dm.y - RH / 2, RW, RH);
    if(dm.exposed){
      var c = ravanaChest(dm), glow = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, c.r);
      glow.addColorStop(0, 'rgba(255,233,168,' + (.75 + .2 * Math.sin(t * 10)) + ')'); glow.addColorStop(1, 'rgba(255,93,61,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 7); ctx.fill();
    }
    ravanaHeads(dm).forEach(function(h){
      if(h.h.hp > 0){
        if(h.h.hp < h.h.maxHp){ ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(h.x - 9, h.y + h.r + 3, 18, 3); ctx.fillStyle = '#ffb3ba'; ctx.fillRect(h.x - 9, h.y + h.r + 3, 18 * h.h.hp / h.h.maxHp, 3); }
        return;
      }
      // đầu đã hạ: phủ khói tím, vòng đếm thời gian mọc lại
      ctx.fillStyle = 'rgba(30,14,46,.82)'; ctx.beginPath(); ctx.arc(h.x, h.y, h.r * 1.15, 0, 7); ctx.fill();
      ctx.strokeStyle = '#b07ad8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(h.x, h.y, h.r * 1.15, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - Math.max(0, h.h.regrow) / 9)); ctx.stroke();
    });
    return;
  }
  ctx.save(); ctx.translate(dm.x, dm.y);
  var flap = Math.sin(t * 6) * .4;
  ctx.fillStyle = flash ? '#fff' : 'rgba(30,26,44,.9)';
  [-1, 1].forEach(function(s){
    ctx.save(); ctx.rotate(s * flap * .5); ctx.scale(s, 1);
    ctx.beginPath(); ctx.moveTo(R * .4, -R * .3); ctx.quadraticCurveTo(R * 1.8, -R * 1.4, R * 2.2, -R * .3); ctx.quadraticCurveTo(R * 1.5, -R * .1, R * .5, R * .3); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, 6, R * .8, R * .95, 0, 0, 7); ctx.fill();
  ctx.fillStyle = flash ? '#fff' : '#f5b942'; ctx.fillRect(-R * .8, -R * .1, R * 1.6, 6);   // giáp vàng
  ctx.strokeStyle = skin; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-R * .7, 0); ctx.lineTo(-R * 1.25, 16); ctx.moveTo(R * .7, 0); ctx.lineTo(R * 1.25, 16); ctx.stroke();
  if(dm.exposed){
    var pulse = 10 + Math.sin(t * 10) * 3;
    ctx.beginPath(); ctx.arc(0, 4, pulse, 0, 7); ctx.fillStyle = '#ffe9a8'; ctx.shadowColor = '#ff5d3d'; ctx.shadowBlur = 24; ctx.fill(); ctx.shadowBlur = 0;
  }
  ctx.restore();
  ravanaHeads(dm).forEach(function(h){
    ctx.save(); ctx.translate(h.x, h.y);
    if(h.h.hp > 0){
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fill();
      ctx.fillStyle = flash ? '#fff' : '#f5b942';
      ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(-4, -17); ctx.lineTo(0, -10); ctx.lineTo(4, -17); ctx.lineTo(8, -8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff2e3e'; ctx.beginPath(); ctx.arc(-4, -1, 1.8, 0, 7); ctx.arc(4, -1, 1.8, 0, 7); ctx.fill();
      if(h.h.hp < h.h.maxHp){ ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(-9, 13, 18, 3); ctx.fillStyle = '#ffb3ba'; ctx.fillRect(-9, 13, 18 * h.h.hp / h.h.maxHp, 3); }
    } else {
      ctx.globalAlpha = .45; ctx.strokeStyle = '#b07ad8'; ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.arc(0, 0, 9 * (1 - Math.max(0, h.h.regrow) / 9) + 2, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  });
}

/* thanh máu boss lớn ở giữa trên cùng */
function drawBossBar(dm){
  var w = 360, x = W / 2 - w / 2, y = 84;
  var frac = dm.id === 'ravana' && dm.exposed ? dm.core / dm.coreMax : dm.hp / dm.maxHp;
  ctx.fillStyle = 'rgba(8,12,24,.75)'; ctx.fillRect(x - 4, y - 4, w + 8, 18);
  ctx.fillStyle = dm.exposed ? '#ffe9a8' : '#ff5d6c'; ctx.fillRect(x, y, w * clamp(frac, 0, 1), 10);
  ctx.textAlign = 'center'; ctx.font = '800 13px "Be Vietnam Pro",sans-serif'; ctx.fillStyle = '#fff';
  var label = dm.name.toUpperCase();
  if(dm.id === 'ravana') label += dm.exposed ? t('c_exposed', { n: Math.ceil(dm.exposed) }) : t('c_heads', { n: dm.heads.filter(function(h){ return h.hp > 0; }).length, m: dm.heads.length });
  ctx.fillText(label, W / 2, y - 8);
}

function drawTrajectory(){
  if(!G || !G.charging) return;
  var sp = 420 + G.power * 6.4;
  var x = BOW.x + Math.cos(G.angle) * 40, y = BOW.y + Math.sin(G.angle) * 40;
  var vx = Math.cos(G.angle) * sp, vy = Math.sin(G.angle) * sp;
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  var dots = 16 + 8 * upLv('aim');
  for(var i = 1; i <= dots; i++){
    var tt = i * .09;
    var px = x + vx * tt, py = y + vy * tt + 310 * tt * tt;
    if(py > GROUND || px > W) break;
    ctx.globalAlpha = 1 - i / (dots + 4);
    ctx.beginPath(); ctx.arc(px, py, 3.2, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* bóng đổ dưới chân: nhân vật "đứng" trên mặt đất */
function drawShadows(){
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  G.demons.forEach(function(dm){
    var w, a = 1;
    if(dm.ground){ w = hitR(dm) * 1.5; }
    else { w = hitR(dm) * 1.1; a = clamp(1 - (GROUND - dm.y) / 420, .25, .7); }   // quỷ bay: bóng mờ theo độ cao
    ctx.globalAlpha = a; ctx.beginPath(); ctx.ellipse(dm.x, GROUND + 2, w, w * .22, 0, 0, 7); ctx.fill();
  });
  ctx.globalAlpha = .35; ctx.beginPath(); ctx.ellipse(BOW.x - 50, GROUND + 2, 46, 8, 0, 0, 7); ctx.fill();
  ctx.globalAlpha = 1;
}
/* xác quỷ: nháy trắng, ngã ngửa, chìm xuống và mờ dần */
function drawCorpse(c){
  var dm = c.dm, k = c.t / c.life, boss = dm.type === 'boss';
  ctx.save();
  ctx.globalAlpha = 1 - k * k;
  var px = dm.x, py = dm.ground ? GROUND : dm.y;
  ctx.translate(px, py + (dm.ground ? 0 : k * 60));
  if(!boss) ctx.rotate(k * (dm.ground ? .9 : 1.4));
  var sc = boss ? 1 + k * .08 : 1 - k * .25;
  ctx.scale(sc, boss ? 1 - k * .3 : sc);
  ctx.translate(-px, -py);
  drawDemon(dm, elapsed);
  ctx.restore();
}
/* tên cắm xuống đất, mờ dần */
function drawStuck(){
  G.stuck.forEach(function(s){
    ctx.save(); ctx.globalAlpha = clamp((2.4 - s.t) / .6, 0, .9);
    ctx.translate(s.x, GROUND + 3); ctx.rotate(s.a);
    ctx.strokeStyle = s.col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-4, 0); ctx.stroke();
    ctx.fillStyle = s.col; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-36, -5); ctx.lineTo(-34, 0); ctx.lineTo(-36, 5); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
}
function drawRings(){
  G.rings.forEach(function(r){
    var k = r.t / r.life;
    ctx.globalAlpha = (1 - k) * .9; ctx.strokeStyle = r.color; ctx.lineWidth = 4 * (1 - k) + 1;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r * (.3 + .7 * Math.sqrt(k)), 0, 7); ctx.stroke();
  });
  ctx.globalAlpha = 1;
}
/* sắp thua: viền đỏ nhịp tim */
function drawLowHp(){
  if(G.hp !== 1 || G.maxHp < 2 || G.over) return;
  var a = .28 + .14 * Math.sin(elapsed * 6);
  var g = ctx.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .62);
  g.addColorStop(0, 'rgba(200,20,40,0)'); g.addColorStop(1, 'rgba(200,20,40,' + a + ')');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
/* băng chữ lớn: vào màn · boss xuất hiện · chiến thắng */
function drawBanner(){
  var b = G.banner; if(!b) return;
  var inK = Math.min(1, b.t / .25), outK = Math.min(1, (b.life - b.t) / .35), a = Math.min(inK, outK);
  var y = b.win ? H / 2 - 40 : 196, slide = (1 - inK) * 120;
  ctx.save(); ctx.globalAlpha = a;
  var band = ctx.createLinearGradient(0, 0, W, 0);
  var tone = b.boss ? '120,10,20' : '10,12,30';
  band.addColorStop(0, 'rgba(' + tone + ',0)'); band.addColorStop(.25, 'rgba(' + tone + ',.78)'); band.addColorStop(.75, 'rgba(' + tone + ',.78)'); band.addColorStop(1, 'rgba(' + tone + ',0)');
  ctx.fillStyle = band; ctx.fillRect(0, y - 42, W, b.sub ? 86 : 70);
  ctx.fillStyle = 'rgba(245,185,66,.8)'; ctx.fillRect(W * .2, y - 42, W * .6, 2); ctx.fillRect(W * .2, y + (b.sub ? 42 : 26), W * .6, 2);
  ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  var sc = b.win ? 1 + .25 * (1 - inK) : 1;
  ctx.translate(W / 2 + (b.win ? 0 : slide), y); ctx.scale(sc, sc);
  ctx.font = (b.win ? '900 46px' : '900 34px') + ' "Playfair Display","Be Vietnam Pro",serif';
  ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.strokeText(b.text, 0, b.sub ? 0 : 6);
  ctx.fillStyle = b.boss ? '#ffb3ba' : '#ffd97a'; ctx.fillText(b.text, 0, b.sub ? 0 : 6);
  if(b.sub){ ctx.font = '700 17px "Be Vietnam Pro",sans-serif'; ctx.fillStyle = '#fff3d0'; ctx.fillText(b.sub, 0, 30); }
  ctx.restore();
}
/* màn 1: hướng dẫn kéo – thả cho người chơi mới */
function drawTutorial(){
  if(G.mode !== 'campaign' || levelIdx !== 0 || G.shots > 1 || G.charging || S.stats.shots > 3) return;
  var k = (elapsed % 1.6) / 1.6, hx = 330 - k * 60, hy = 300 + k * 40;
  ctx.save(); ctx.globalAlpha = .9 * Math.sin(Math.PI * Math.min(1, k * 1.2));
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(330, 300); ctx.lineTo(hx, hy); ctx.stroke(); ctx.setLineDash([]);
  ctx.font = '34px serif'; ctx.textAlign = 'center'; ctx.fillText('👆', hx, hy + 30);
  ctx.restore();
  ctx.font = '800 16px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.6)';
  ctx.strokeText(t('tut_aim'), 330, 250); ctx.fillStyle = '#fff3d0'; ctx.fillText(t('tut_aim'), 330, 250);
}

function draw(){
  var bgL = G ? G.lvl : LEVELS[Math.min(S.unlocked - 1, LEVELS.length - 1)];
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.save();
  if(G && G.shake > 0) ctx.translate(rand(-G.shake, G.shake) * .5, rand(-G.shake, G.shake) * .5);
  drawBackground(bgL, elapsed);
  drawRama(elapsed);
  if(G && upLv('ally') > 0) drawAlly();
  if(G){
    // powerups
    G.powerups.forEach(function(q){
      var bob = Math.sin(q.t * 3) * 5;
      ctx.save(); ctx.translate(q.x, q.y + bob);
      ctx.beginPath(); ctx.arc(0, 0, q.r + 5 + Math.sin(q.t * 5) * 2, 0, 7);
      ctx.fillStyle = q.kind === 'fire' ? 'rgba(255,140,50,.25)' : 'rgba(255,110,150,.25)'; ctx.fill();
      ctx.font = (q.r + 8) + 'px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(q.kind === 'fire' ? '🔥' : '❤️', 0, 1);
      ctx.restore();
    });
    drawShadows();
    drawStuck();
    G.corpses.forEach(drawCorpse);
    G.demons.forEach(function(dm){ drawDemon(dm, elapsed); });
    // arrows
    G.arrows.forEach(function(ar){
      var a = Math.atan2(ar.vy, ar.vx);
      ctx.save(); ctx.translate(ar.x, ar.y); ctx.rotate(a);
      ctx.strokeStyle = ar.golden ? '#ffd97a' : (ar.fire ? '#ff9a3d' : (ar.perfect ? '#8ff0ff' : '#e8e8e8')); ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(13, 0); ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(11, -4.6); ctx.lineTo(11, 4.6); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(-21, -5); ctx.lineTo(-19, 0); ctx.lineTo(-21, 5); ctx.closePath(); ctx.fill();
      ctx.restore();
    });
    // fireballs
    G.fireballs.forEach(function(fb){
      if(fb.rock){
        ctx.save(); ctx.translate(fb.x, fb.y); ctx.rotate(fb.t * 5);
        ctx.fillStyle = '#7a6a58'; ctx.beginPath(); ctx.moveTo(-fb.r, -4); ctx.lineTo(-5, -fb.r); ctx.lineTo(fb.r, -6); ctx.lineTo(fb.r - 2, 8); ctx.lineTo(-4, fb.r); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#9c8a72'; ctx.beginPath(); ctx.arc(-3, -3, 4, 0, 7); ctx.fill();
        ctx.restore(); return;
      }
      var fim = getImg(ART.fireball);
      if(fim){
        ctx.save(); ctx.translate(fb.x, fb.y); ctx.rotate(Math.atan2(fb.vy, fb.vx) - Math.PI / 2);
        var fw = fb.r * 3.4, fh = fw * fim.naturalHeight / fim.naturalWidth;
        ctx.drawImage(fim, -fw / 2, -fh + fw * .55, fw, fh); ctx.restore(); return;
      }
      ctx.beginPath(); ctx.arc(fb.x, fb.y, fb.r, 0, 7);
      ctx.fillStyle = '#ff7a45'; ctx.shadowColor = '#ff5d3d'; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(fb.x, fb.y, fb.r * .55, 0, 7); ctx.fillStyle = '#ffd97a'; ctx.fill();
    });
    // particles
    G.parts.forEach(function(p){
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;
    G.waves.forEach(function(wv){
      var gw = ctx.createLinearGradient(wv.x - 90, 0, wv.x + 10, 0);
      gw.addColorStop(0, 'rgba(60,140,220,0)'); gw.addColorStop(1, 'rgba(124,200,255,.85)');
      ctx.fillStyle = gw; ctx.beginPath(); ctx.moveTo(wv.x - 90, GROUND);
      ctx.quadraticCurveTo(wv.x - 20, GROUND - 150, wv.x + 10, GROUND - 120); ctx.lineTo(wv.x + 10, GROUND); ctx.closePath(); ctx.fill();
    });
    if(G.windFx > 0){
      ctx.strokeStyle = 'rgba(220,255,240,' + G.windFx * .7 + ')'; ctx.lineWidth = 2;
      for(var wl = 0; wl < 14; wl++){
        var wy = 70 + wl * 24, wx = ((1 - G.windFx) * 1400 + wl * 137) % (W + 200) - 100;
        ctx.beginPath(); ctx.moveTo(wx, wy); ctx.quadraticCurveTo(wx + 60, wy - 12, wx + 140, wy); ctx.stroke();
      }
    }
    drawRings();
    drawTrajectory();
    drawTutorial();
    // floaters: bật to rồi thu lại, viền tối để đọc rõ trên mọi nền
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    G.floats.forEach(function(f){
      var pop = 1 + .45 * Math.max(0, 1 - f.t / .14);
      ctx.save(); ctx.translate(f.x, f.y); ctx.scale(pop, pop);
      ctx.globalAlpha = Math.min(1, 2.5 * (1 - f.t / f.life));
      ctx.font = f.big ? '900 26px "Be Vietnam Pro",sans-serif' : '800 14px "Be Vietnam Pro",sans-serif';
      ctx.lineWidth = f.big ? 5 : 3.5; ctx.strokeStyle = 'rgba(10,8,20,.7)'; ctx.strokeText(f.text, 0, 0);
      ctx.fillStyle = f.color; ctx.fillText(f.text, 0, 0);
      ctx.restore();
    });
    ctx.globalAlpha = 1;
    // combo: nảy lên mỗi lần trúng liên tiếp
    if(G.combo >= 2){
      var cp = 1 + .35 * Math.max(0, 1 - (elapsed - G.comboT) / .2);
      ctx.save(); ctx.translate(W - 16, 108); ctx.scale(cp, cp);
      ctx.textAlign = 'right'; ctx.font = '900 21px "Be Vietnam Pro",sans-serif';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(10,8,20,.6)'; ctx.strokeText(t('f_combo', { n: G.combo }), 0, 0);
      ctx.fillStyle = G.combo >= 10 ? '#ffd97a' : '#7be3c3'; ctx.fillText(t('f_combo', { n: G.combo }), 0, 0);
      ctx.restore();
    }
    if(G.bossRef && !G.bossRef.dead) drawBossBar(G.bossRef);
    drawLowHp();
    drawBanner();
    if(G.bigFlash > 0){ ctx.fillStyle = 'rgba(255,248,220,' + Math.min(.85, G.bigFlash) + ')'; ctx.fillRect(0, 0, W, H); }
    if(G.flash > 0){
      ctx.fillStyle = 'rgba(255,40,60,' + (G.flash * .55) + ')'; ctx.fillRect(0, 0, W, H);
    }
  } else {
    ctx.textAlign = 'center';
    ctx.font = '700 15px "Be Vietnam Pro",sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.fillText(t('c_hint'), W / 2, H - 18);
  }
  ctx.restore();
}

fitCanvas();
/* tải trước ảnh minh họa */
for(var ak in ART.demons) (ART.demons[ak].srcs || [ART.demons[ak].src]).forEach(getImg);
['idle', 'draw', 'release'].forEach(function(p){ ramaImg(p); });
if(ART.ravana) getImg(ART.ravana.src);
if(ART.ally) getImg(ART.ally.src);
for(var bk in ART.bg) getImg(ART.bg[bk]);
