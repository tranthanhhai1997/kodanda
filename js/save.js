"use strict";
/* ============================================================
   LƯU TIẾN TRÌNH — localStorage, khóa `kodanda_save_v1`
   ============================================================ */
var SAVE_KEY = 'kodanda_save_v1';
function defaultSave(){
  return {
    v: 1, lang: '', coins: 0, unlocked: 1, stars: {}, seen: {}, diff: 'normal', sound: true, totalScore: 0,
    upgrades: {}, outfit: 'saffron', trail: 'none', owned: ['saffron', 'none'],
    daily: { lastClaim: null, streak: 0, challengeDone: null, doubled: null },
    ach: {}, cards: [], endlessBest: 0, endlessScore: 0,
    stats: { kills: 0, bossKills: 0, shots: 0, bestCombo: 0, wins: 0, revives: 0, perfects: 0, headshots: 0, astras: 0, dailyWins: 0 }
  };
}
// gộp dữ liệu đã lưu vào mặc định: chỉ nhận giá trị cùng kiểu, bỏ khóa lạ
function mergeSave(def, o){
  for(var k in def){
    if(!o || !(k in o)) continue;
    var a = def[k], b = o[k];
    if(Array.isArray(a)){ if(Array.isArray(b)) def[k] = b; }
    else if(a && typeof a === 'object'){ if(b && typeof b === 'object') def[k] = Object.keys(a).length ? mergeSave(a, b) : b; }
    else if(a === null || typeof a === typeof b) def[k] = b;
  }
  return def;
}
function loadSave(){
  var s = defaultSave();
  try{ mergeSave(s, JSON.parse(localStorage.getItem(SAVE_KEY) || 'null')); }catch(e){}
  s.unlocked = Math.max(1, Math.min(LEVELS.length, Math.floor(s.unlocked) || 1));
  if(!DIFFS[s.diff]) s.diff = 'normal';
  if(s.coins < 0) s.coins = 0;
  return s;
}
var S = loadSave();
function saveGame(){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }catch(e){}
}
function upLv(id){ return S.upgrades[id] || 0; }
function todayStr(off){
  var d = new Date(); d.setDate(d.getDate() + (off || 0));
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}
