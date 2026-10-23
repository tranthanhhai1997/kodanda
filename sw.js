/* Service worker — cho phép cài đặt và chơi offline.
   Tăng VERSION mỗi lần phát hành để người chơi nhận bản mới. */
var VERSION = 'kodanda-v5';
var FONT_CACHE = 'kodanda-fonts';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'css/style.css', 'css/fonts.css', 'js/data.js', 'js/save.js', 'js/i18n.js', 'js/platform.js', 'js/audio.js', 'js/game.js', 'js/ui.js', 'js/meta.js', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'img/bg/dawn.webp', 'img/bg/day.webp', 'img/bg/dusk.webp', 'img/bg/lanka.webp', 'img/bg/night.webp', 'img/bg/storm.webp', 'img/bg/sunset.webp', 'img/portraits/hanuman.webp', 'img/portraits/jambavan.webp', 'img/portraits/kumbhakarna.webp', 'img/portraits/lakshmana.webp', 'img/portraits/narrator.webp', 'img/portraits/rama.webp', 'img/portraits/ravana.webp', 'img/portraits/sita.webp', 'img/portraits/sugriva.webp', 'img/portraits/vibhishana.webp', 'img/sprites/ally_lakshmana.webp', 'img/sprites/boss_kumbhakarna.webp', 'img/sprites/boss_maricha.webp', 'img/sprites/boss_ravana.webp', 'img/sprites/boss_tataka.webp', 'img/sprites/demon_armor.webp', 'img/sprites/demon_fast.webp', 'img/sprites/demon_fly.webp', 'img/sprites/demon_ground_1.webp', 'img/sprites/demon_ground_2.webp', 'img/sprites/demon_ground_3.webp', 'img/sprites/demon_shaman.webp', 'img/sprites/demon_shield.webp', 'img/sprites/demon_splitter.webp', 'img/sprites/rama_draw.webp', 'img/sprites/rama_idle.webp', 'img/sprites/rama_release.webp', 'img/ui/cover.webp', 'img/ui/emblem.webp', 'img/ui/fireball.webp', 'fonts/BeVietnamPro-400-latin-ext.woff2', 'fonts/BeVietnamPro-400-latin.woff2', 'fonts/BeVietnamPro-400-vietnamese.woff2', 'fonts/BeVietnamPro-500-latin-ext.woff2', 'fonts/BeVietnamPro-500-latin.woff2', 'fonts/BeVietnamPro-500-vietnamese.woff2', 'fonts/BeVietnamPro-600-latin-ext.woff2', 'fonts/BeVietnamPro-600-latin.woff2', 'fonts/BeVietnamPro-600-vietnamese.woff2', 'fonts/BeVietnamPro-700-latin-ext.woff2', 'fonts/BeVietnamPro-700-latin.woff2', 'fonts/BeVietnamPro-700-vietnamese.woff2', 'fonts/BeVietnamPro-800-latin-ext.woff2', 'fonts/BeVietnamPro-800-latin.woff2', 'fonts/BeVietnamPro-800-vietnamese.woff2', 'fonts/NotoSansDevanagari-400-devanagari.woff2', 'fonts/NotoSansDevanagari-400-latin-ext.woff2', 'fonts/NotoSansDevanagari-400-latin.woff2', 'fonts/PlayfairDisplay-700-latin-ext.woff2', 'fonts/PlayfairDisplay-700-latin.woff2', 'fonts/PlayfairDisplay-700-vietnamese.woff2'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== VERSION && k !== FONT_CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  var url = new URL(req.url);
  // Google Fonts: ưu tiên bộ nhớ đệm (font không đổi)
  if(url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'){
    e.respondWith(caches.open(FONT_CACHE).then(function(c){
      return c.match(req).then(function(hit){
        return hit || fetch(req).then(function(res){ c.put(req, res.clone()); return res; }).catch(function(){ return Response.error(); });
      });
    }));
    return;
  }
  if(url.origin !== location.origin) return;
  // cùng nguồn: ưu tiên mạng (luôn nhận bản mới), mất mạng thì dùng bản đệm
  e.respondWith(caches.open(VERSION).then(function(c){
    return fetch(req).then(function(res){
      if(res && res.ok) c.put(req, res.clone());
      return res;
    }).catch(function(){
      return c.match(req, { ignoreSearch: req.mode === 'navigate' }).then(function(hit){
        return hit || (req.mode === 'navigate' ? c.match('index.html') : Response.error());
      });
    });
  }));
});
