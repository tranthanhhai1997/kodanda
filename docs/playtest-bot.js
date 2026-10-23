/* Bot chơi thử tự động — dán vào DevTools Console khi game đang mở (ở menu).
   Chạy mô phỏng nhanh (không theo thời gian thực) 15 màn + Vô tận + Thử thách ngày,
   máu đặt 999 để đo "máu bị mất" thay vì thua; in ra lỗi JS nếu có.
   ⚠️ Bot ghi vào bản lưu (xu, mở hết màn) — chạy ở cửa sổ ẩn danh hoặc xóa `kodanda_save_v1` sau đó.
   Tải lại trang sau khi chạy (showWin/showLose bị tắt tạm). */
(function(){
  window.showWin = function(){}; window.showLose = function(){};
  function bot(setup, maxT){
    var errs = [], T = 0, dt = 1 / 60, shotT = 0, dts = [];
    setup();
    G.hp = G.maxHp = 999;
    while(T < maxT){
      T += dt; elapsed += dt; shotT -= dt;
      if(shotT <= 0){
        shotT = 0.45;
        // ngắm quỷ gần vạch nhất bằng công thức quỹ đạo cầu (lực tối đa)
        var tg = null;
        G.demons.forEach(function(d){ if(!d.dead && d.type !== 'decoy' && (!tg || d.x < tg.x)) tg = d; });
        if(tg){
          var tx = tg.x, ty = bodyY(tg);
          if(tg.id === 'ravana'){ var hd = tg.exposed ? null : ravanaHeads(tg).filter(function(h){ return h.h.hp > 0; })[0]; var c = hd || ravanaChest(tg); tx = c.x; ty = c.y; }
          var v = 1060, g = 620, dx = tx - BOW.x, dy = BOW.y - ty, disc = v * v * v * v - g * (g * dx * dx + 2 * dy * v * v), hi = tg.type === 'shield';
          if(disc >= 0){ G.angle = clamp(-Math.atan((v * v + (hi ? 1 : -1) * Math.sqrt(disc)) / (g * dx)), -1.25, .35); G.power = 100; G.charging = true; fireArrow(); G.charging = false; G.power = 0; }
        }
        ASTRAS.forEach(function(A){ if(G.energy >= A.cost && astraUnlocked(A) && Math.random() < .3) castAstra(A.id); });
      }
      try{ update(dt); }catch(e){ errs.push(e.message + ' @' + (e.stack || '').split('\n')[1]); if(errs.length > 5) break; }
      var a = performance.now();
      try{ draw(); }catch(e){ errs.push('draw:' + e.message); if(errs.length > 5) break; }
      dts.push(performance.now() - a);
      if(G.over && !G.banner) break;
    }
    dts.sort(function(a, b){ return a - b; });
    var r = { T: Math.round(T), over: G.over, hpLost: 999 - G.hp, killed: G.killed + '/' + G.lvl.total, wave: G.wave, drawP95ms: dts[Math.floor(dts.length * .95)].toFixed(2), errs: errs };
    G.over = true;
    return r;
  }
  var out = [];
  for(var i = 0; i < LEVELS.length; i++) out.push((i + 1) + ' ' + JSON.stringify(bot(function(){ beginLevel(i); }, 400)));
  out.push('endless ' + JSON.stringify(bot(function(){ S.unlocked = LEVELS.length; startEndless(); }, 400)));
  out.push('daily ' + JSON.stringify(bot(function(){ startDaily(); }, 400)));
  toMenu();
  console.log(out.join('\n'));
  console.log('Xong — tải lại trang (F5) trước khi chơi tiếp.');
})();
