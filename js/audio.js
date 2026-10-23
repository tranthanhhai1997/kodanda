"use strict";
/* ============================================================
   ÂM THANH — WebAudio synth (không cần file ngoài)
   - hiệu ứng: nén tiếng + vang, nhiễu lọc, dao động, chuông, gảy dây
   - nhạc nền: drone tanpura + giai điệu ngũ cung + nhịp tabla
   ============================================================ */
var AC = null, soundOn = S.sound, musicOn = S.music;
var sfxBus = null, musicBus = null, fxOut = null, verbIn = null, noiseBuf = null;
function ac(){
  if(!AC){
    try{
      AC = new (window.AudioContext || window.webkitAudioContext)();
      var comp = AC.createDynamicsCompressor();   // nén nhẹ để nhiều âm cùng lúc không rè
      comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .18;
      comp.connect(AC.destination);
      sfxBus = AC.createGain(); sfxBus.connect(comp);
      musicBus = AC.createGain(); musicBus.gain.value = .0001; musicBus.connect(AC.destination);
      fxOut = AC.createGain(); fxOut.gain.value = .9; fxOut.connect(sfxBus);
      // vang: xung phản hồi bằng nhiễu tắt dần (~1,4 giây)
      var len = (AC.sampleRate * 1.4) | 0, ir = AC.createBuffer(2, len, AC.sampleRate);
      for(var ch = 0; ch < 2; ch++){ var d = ir.getChannelData(ch); for(var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      var conv = AC.createConvolver(); conv.buffer = ir;
      verbIn = AC.createGain(); verbIn.gain.value = .3; verbIn.connect(conv); conv.connect(sfxBus);
      noiseBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
      var nd = noiseBuf.getChannelData(0); for(var j = 0; j < nd.length; j++) nd[j] = Math.random() * 2 - 1;
    }catch(e){ AC = null; }
  }
  if(AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function route(node, wet){ node.connect(fxOut); if(wet){ var g = AC.createGain(); g.gain.value = wet; node.connect(g); g.connect(verbIn); } }
function env(g, t0, vol, att, dur){
  g.gain.setValueAtTime(.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t0 + att);
  g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
}
/* nhiễu qua bộ lọc, tần số lọc quét f0 → f1 */
function nz(o){
  if(!soundOn || !ac()) return;
  var t0 = AC.currentTime + (o.delay || 0), dur = o.dur || .2;
  var src = AC.createBufferSource(); src.buffer = noiseBuf;
  var f = AC.createBiquadFilter(); f.type = o.type || 'lowpass'; f.Q.value = o.q || .8; f.frequency.setValueAtTime(o.f0 || 1000, t0);
  if(o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t0 + dur);
  var g = AC.createGain(); env(g, t0, o.vol || .2, o.att || .005, dur);
  src.connect(f); f.connect(g); route(g, o.wet == null ? .15 : o.wet);
  src.start(t0, Math.random() * 1.5); src.stop(t0 + dur + .05);
}
/* dao động có rung giọng (vibrato) và bộ lọc tùy chọn; bus = musicBus cho nhạc nền */
function os(o){
  if(!o.bus && !soundOn) return;
  if(!ac()) return;
  var t0 = o.at || AC.currentTime + (o.delay || 0), dur = o.dur || .2;
  var osc = AC.createOscillator(); osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(o.f0 || 440, t0);
  if(o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t0 + dur);
  if(o.vib){ var l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = o.vibRate || 6; lg.gain.value = o.vib; l.connect(lg); lg.connect(osc.frequency); l.start(t0); l.stop(t0 + dur + .05); }
  var g = AC.createGain(); env(g, t0, o.vol || .15, o.att || .006, dur);
  var head = osc;
  if(o.lp){ var f = AC.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 2; f.frequency.setValueAtTime(o.lp, t0); if(o.lp1) f.frequency.exponentialRampToValueAtTime(o.lp1, t0 + dur * .6); osc.connect(f); head = f; }
  head.connect(g);
  if(o.bus) g.connect(o.bus); else route(g, o.wet == null ? .15 : o.wet);
  osc.start(t0); osc.stop(t0 + dur + .05);
}
/* chuông đền: họa âm không hài hòa tắt dần */
function bell(freq, vol, dur, delay){
  [[1, 1], [2.76, .45], [5.4, .25], [8.93, .12]].forEach(function(p){ os({ f0: freq * p[0], dur: (dur || 1.4) / Math.sqrt(p[0]), vol: (vol || .1) * p[1], att: .002, delay: delay, wet: .45 }); });
}
/* gảy dây kiểu sitar */
function pluck(freq, vol, dur, delay){
  os({ type: 'sawtooth', f0: freq, dur: dur || .5, vol: vol || .1, att: .003, delay: delay, lp: freq * 9, lp1: freq * 1.6, wet: .3 });
  os({ type: 'triangle', f0: freq * 2.003, dur: (dur || .5) * .6, vol: (vol || .1) * .35, att: .003, delay: delay, wet: .3 });
}
function tabla(delay, hi){
  os({ f0: hi ? 420 : 150, f1: hi ? 340 : 70, dur: hi ? .14 : .32, vol: hi ? .12 : .28, att: .002, delay: delay, wet: .12 });
  nz({ type: 'bandpass', f0: hi ? 3200 : 900, q: 1.5, dur: .05, vol: hi ? .08 : .06, delay: delay, wet: .05 });
}
var BHUPALI = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];   // Sa Re Ga Pa Dha… (ngũ cung)
function note(i, base){ return (base || 293.66) * Math.pow(2, BHUPALI[clampN(i, 0, BHUPALI.length - 1)] / 12); }
function clampN(v, a, b){ return v < a ? a : (v > b ? b : v); }
function jit(v, p){ return v * (1 + (Math.random() * 2 - 1) * (p || .08)); }   // lệch nhẹ để mỗi lần nghe khác nhau

/* ---------------- hiệu ứng game ---------------- */
var sDraw = function(){ os({ type: 'sawtooth', f0: 60, f1: 120, dur: .35, vol: .035, lp: 420, wet: 0 }); };   // dây cung căng
var sShoot = function(){   // dây bật + mũi tên xé gió
  os({ type: 'triangle', f0: jit(190), f1: 85, dur: .14, vol: .14, att: .002, wet: .05 });
  nz({ type: 'bandpass', f0: 900, f1: 3800, q: 1.4, dur: .26, vol: .2, att: .02, wet: .08 });
};
var sPerfect = function(){ sShoot(); bell(1174.7, .07, .9, .02); os({ f0: 2400, f1: 3600, dur: .12, vol: .04, delay: .05, wet: .5 }); };
var sHit = function(){ os({ f0: jit(160), f1: 55, dur: .14, vol: .26, att: .002, wet: .04 }); nz({ type: 'bandpass', f0: jit(1500, .2), q: 1.2, dur: .06, vol: .16, wet: .04 }); };
var sCrit = function(){ sHit(); os({ type: 'square', f0: 1320, f1: 1760, dur: .08, vol: .04, delay: .02, wet: .2 }); };
var sKill = function(){   // gầm ngắn tắt dần + tia sáng thiêng
  os({ type: 'sawtooth', f0: jit(150), f1: 70, dur: .32, vol: .1, att: .01, vib: 12, vibRate: 15, lp: 900, wet: .2 });
  nz({ type: 'lowpass', f0: 1400, f1: 200, dur: .3, vol: .16, wet: .15 });
};
var sHurt = function(){ os({ f0: 90, f1: 34, dur: .45, vol: .38, att: .003, wet: .1 }); nz({ type: 'lowpass', f0: 1200, f1: 150, dur: .5, vol: .28, wet: .25 }); };
var sCoin = function(){ os({ type: 'triangle', f0: 1568, dur: .1, vol: .06, wet: .3 }); os({ type: 'triangle', f0: 2093, dur: .24, vol: .06, delay: .06, wet: .35 }); };
var sShield = function(){ [[523, 1], [1410, .5], [2290, .3], [3520, .2]].forEach(function(p){ os({ type: 'triangle', f0: p[0], dur: .45, vol: .08 * p[1], att: .001, wet: .35 }); }); };
var sCombo = function(n){ pluck(note(Math.min(10, n)), .07, .35); if(n >= 5 && n % 5 === 0) bell(note(Math.min(10, n), 587.3), .05, .8); };
var sBoom = function(){   // cầu lửa / đá vỡ
  nz({ type: 'lowpass', f0: 1600, f1: 160, dur: .6, vol: .3, att: .004, wet: .3 });
  os({ f0: 85, f1: 32, dur: .45, vol: .3, att: .003, wet: .1 });
};
var sThrow = function(){ nz({ type: 'bandpass', f0: 200, f1: 900, q: 1, dur: .45, vol: .12, att: .1, wet: .2 }); };   // boss ném / phóng
var sGrowl = function(){ os({ type: 'sawtooth', f0: jit(95), f1: 58, dur: .8, vol: .16, att: .05, vib: 9, vibRate: 13, lp: 700, lp1: 280, wet: .3 }); nz({ type: 'lowpass', f0: 400, dur: .7, vol: .12, att: .06, wet: .25 }); };
var sStomp = function(){ os({ f0: 60, f1: 28, dur: .7, vol: .45, att: .003, wet: .2 }); nz({ type: 'lowpass', f0: 500, f1: 80, dur: .8, vol: .3, wet: .3 }); };
var sMagic = function(){ [0, 2, 4].forEach(function(n, i){ os({ type: 'sine', f0: note(n + 5, 587.3), dur: .5, vol: .04, delay: i * .05, wet: .6 }); }); };   // ảo ảnh / hồi máu
var sPower = function(){ [4, 7, 9].forEach(function(n, i){ bell(note(n, 587.3), .06, .9, i * .06); }); };   // nhặt vật phẩm
var sConch = function(){   // tù và (shankh) — vào màn
  os({ type: 'sawtooth', f0: 196, dur: 1.5, vol: .16, att: .25, vib: 3, vibRate: 5, lp: 500, lp1: 1500, wet: .45 });
  os({ type: 'sawtooth', f0: 392.5, dur: 1.4, vol: .045, att: .3, vib: 5, vibRate: 5, lp: 700, lp1: 2000, wet: .45 });
  nz({ type: 'bandpass', f0: 1200, q: .8, dur: 1.2, vol: .03, att: .3, wet: .3 });
};
var sBoss = function(){ sGrowl(); os({ f0: 55, f1: 40, dur: 1.4, vol: .3, att: .3, wet: .4 }); [0, .35, .7].forEach(function(d){ tabla(.2 + d, false); }); };
var sAstra = function(){
  nz({ type: 'bandpass', f0: 200, f1: 2600, q: .9, dur: .7, vol: .22, att: .2, wet: .4 });
  os({ type: 'sawtooth', f0: 110, f1: 440, dur: .6, vol: .1, lp: 600, lp1: 3000, wet: .4 });
  [0, 4, 7].forEach(function(n, i){ bell(note(n + 3, 587.3), .07, 1.2, .35 + i * .06); });
};
var sWin = function(){
  sConch();
  [0, .12, .24, .36, .42, .48].forEach(function(d, i){ tabla(.15 + d, i % 2 === 1); });
  [0, 2, 4, 5, 7, 9].forEach(function(n, i){ pluck(note(n + 2), .08, .5, .25 + i * .09); });
  bell(1174.7, .09, 2, .85);
};
var sWave = function(){ [0, .12].forEach(function(d){ tabla(d, false); }); [2, 4, 7].forEach(function(n, i){ pluck(note(n), .07, .4, .1 + i * .08); }); };
var sLose = function(){ [5, 4, 2, 0].forEach(function(n, i){ pluck(note(n, 220), .1, .7, i * .16); }); tabla(.7, false); };
var sClick = function(){ nz({ type: 'bandpass', f0: 2200, q: 2, dur: .035, vol: .1, wet: 0 }); os({ f0: 880, f1: 660, dur: .05, vol: .04, wet: 0 }); };
var sStar = function(i){ bell(note(5 + i * 2, 587.3), .09, 1.3); };

/* rung điện thoại: app dùng Haptics native, web dùng navigator.vibrate (iOS Safari không hỗ trợ) */
function buzz(pattern){
  if(!S.haptic) return;
  if(typeof Native !== 'undefined' && Native.vibrate(pattern)) return;
  if(navigator.vibrate) try{ navigator.vibrate(pattern); }catch(e){}
}

/* ---------------- nhạc nền ---------------- */
var music = (function(){
  var SA = 196, SCALE = [0, 2, 4, 7, 9, 12, 14, 16], BEAT = .42;
  var timer = null, nextT = 0, beat = 0, idx = 3, drones = [], tense = false;
  function hz(semi){ return SA * Math.pow(2, semi / 12); }
  function startDrone(){
    [[SA / 2, .05], [SA * .75, .03], [SA, .025]].forEach(function(p){
      var o = AC.createOscillator(), g = AC.createGain(), lf = AC.createOscillator(), lg = AC.createGain(), f = AC.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = p[0];
      f.type = 'lowpass'; f.frequency.value = 520;
      g.gain.value = p[1]; lf.frequency.value = .18 + Math.random() * .1; lg.gain.value = p[1] * .5;
      lf.connect(lg); lg.connect(g.gain); o.connect(f); f.connect(g); g.connect(musicBus);
      o.start(); lf.start(); drones.push(o, lf);
    });
  }
  function schedule(){
    while(nextT < AC.currentTime + .6){
      var b = beat % 16;
      // tabla: dha . ge na | dha . tin na — lúc đánh boss dồn gấp đôi
      if(b % 4 === 0) os({ f0: 110, f1: 70, dur: .22, vol: .16, bus: musicBus, at: nextT });
      if(b % 4 === 2 || (tense && b % 2 === 1)) os({ f0: tense ? 420 : 220, f1: tense ? 340 : 180, dur: .1, vol: tense ? .07 : .05, bus: musicBus, at: nextT });
      if(b % 2 === 0 && Math.random() < .72){
        idx = clampN(idx + [-2, -1, -1, 1, 1, 2][(Math.random() * 6) | 0], 0, SCALE.length - 1);
        os({ type: 'triangle', f0: hz(SCALE[idx] + 12), dur: Math.random() < .25 ? BEAT * 3 : BEAT * 1.6, vol: .04, bus: musicBus, at: nextT });
      }
      nextT += (tense ? BEAT * .8 : BEAT) / 2; beat++;
    }
  }
  return {
    start: function(){
      if(!ac() || timer) return;
      if(!drones.length) startDrone();
      musicBus.gain.cancelScheduledValues(AC.currentTime);
      musicBus.gain.setTargetAtTime(.5, AC.currentTime, .6);
      nextT = AC.currentTime + .1;
      timer = setInterval(schedule, 200);
    },
    stop: function(){
      if(!AC) return;
      clearInterval(timer); timer = null;
      musicBus.gain.setTargetAtTime(.0001, AC.currentTime, .3);
    },
    tense: function(on){ tense = !!on; },
    sync: function(){ if(musicOn) this.start(); else this.stop(); }
  };
})();
// trình duyệt chỉ cho phát âm thanh sau thao tác đầu tiên của người chơi
function firstGesture(){
  document.removeEventListener('pointerdown', firstGesture, true); document.removeEventListener('keydown', firstGesture, true);
  if(musicOn) music.start();
}
document.addEventListener('pointerdown', firstGesture, true);
document.addEventListener('keydown', firstGesture, true);
