"use strict";
/* ============================================================
   ÂM THANH — WebAudio synth
   ============================================================ */
var AC = null, soundOn = S.sound;
function beep(freq, dur, type, vol, slide){
  if(!soundOn) return;
  try{
    if(!AC) AC = new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state === 'suspended') AC.resume();
    var o = AC.createOscillator(), g = AC.createGain();
    o.type = type||'sine'; o.frequency.value = freq;
    if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide), AC.currentTime+dur);
    g.gain.setValueAtTime(vol||0.12, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime+dur);
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime+dur);
  }catch(e){}
}
var sShoot = function(){ beep(700,.12,'triangle',.10,-450); };
var sHit   = function(){ beep(220,.09,'square',.08,-90); };
var sKill  = function(){ beep(520,.16,'sawtooth',.07,260); };
var sHurt  = function(){ beep(140,.25,'sawtooth',.12,-60); };
var sCoin  = function(){ beep(1180,.1,'sine',.08,320); };
var sPerfect = function(){ beep(900,.14,'triangle',.11,-500); setTimeout(function(){ beep(1500,.12,'sine',.06,200); }, 40); };
var sAstra = function(){ beep(180,.5,'sawtooth',.1,600); setTimeout(function(){ beep(1200,.35,'triangle',.08,-700); }, 120); };
var sWin   = function(){ beep(660,.14,'triangle',.1); setTimeout(function(){beep(880,.2,'triangle',.1);},130); };
