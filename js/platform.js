"use strict";
/* ============================================================
   NỀN TẢNG: web (trình duyệt / PWA) hay app native (Capacitor: Android, iOS)
   - IS_APP: đang chạy trong app; plugin native gọi qua window.Capacitor.Plugins
   - Native.*: hàm tiện ích, tự rơi về API web khi không có plugin
   ============================================================ */
var IS_APP = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
if(IS_APP) document.body.classList.add('app');

var Native = {
  plugin: function(name){ return IS_APP && window.Capacitor.Plugins ? window.Capacitor.Plugins[name] : null; },
  /* rung: mảng kiểu navigator.vibrate ([rung, nghỉ, rung…]) được quy về tổng thời gian rung */
  vibrate: function(pattern){
    var H = this.plugin('Haptics');
    if(!H) return false;
    var ms = Array.isArray(pattern) ? pattern.reduce(function(a, v, i){ return i % 2 === 0 ? a + v : a; }, 0) : pattern;
    H.vibrate({ duration: Math.max(10, Math.min(400, ms)) }).catch(function(){});
    return true;
  },
  /* chia sẻ: bảng chia sẻ của hệ điều hành */
  share: function(data){
    var Sh = this.plugin('Share');
    if(!Sh) return null;
    return Sh.share({ title: data.title, text: data.text, url: data.url, dialogTitle: data.title });
  },
  on: function(pluginName, event, cb){ var P = this.plugin(pluginName); if(P && P.addListener) P.addListener(event, cb); },
  exitApp: function(){ var A = this.plugin('App'); if(A) A.exitApp(); }
};

/* ============================================================
   QUẢNG CÁO THẬT (AdMob, chỉ trong app): interstitial + rewarded
   - testing = true: dùng ID mẫu của Google (luôn có "Test Ad", không tính tiền,
     an toàn khi tự bấm). Phát hành lên Google Play: testing = false.
     App ID nằm ở app/android/app/src/main/res/values/strings.xml
   - Web / chưa tải xong quảng cáo: Ads.ready() = false → UI dùng bản mô phỏng
   ============================================================ */
var AD_CONFIG = {
  testing: false,
  interstitial: 'ca-app-pub-6386233826905968/6785947268',
  rewarded: 'ca-app-pub-6386233826905968/6934121077'
};
var AD_TEST_IDS = {   // ID mẫu chính thức của Google
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917'
};

var Ads = (function(){
  var loaded = { interstitial: false, rewarded: false };
  var A = null, onDismiss = null, rewarded = false, privacyRequired = false;
  var testing = AD_CONFIG.testing || !AD_CONFIG.interstitial || !AD_CONFIG.rewarded;   // chưa điền ID thật thì luôn dùng ID mẫu
  function opts(kind){ return { adId: (testing ? AD_TEST_IDS : AD_CONFIG)[kind], isTesting: testing, immersiveMode: true }; }
  function prepare(kind){
    if(!A || loaded[kind]) return;
    var p = kind === 'rewarded' ? A.prepareRewardVideoAd(opts(kind)) : A.prepareInterstitial(opts(kind));
    p.then(function(){ loaded[kind] = true; })
     .catch(function(){ setTimeout(function(){ prepare(kind); }, 30000); });   // lỗi mạng / hết quảng cáo: thử lại sau 30s
  }
  function finish(ok){ var cb = onDismiss; onDismiss = null; if(cb) cb(ok); }

  return {
    init: function(){
      A = Native.plugin('AdMob');
      if(!A) return Promise.resolve();
      return A.initialize({ initializeForTesting: testing })
        .then(function(){ return A.requestConsentInfo(); })
        .then(function(info){   // form đồng ý GDPR (UMP): chỉ hiện ở vùng bắt buộc (EU/UK…)
          privacyRequired = info.privacyOptionsRequirementStatus === 'REQUIRED';
          if(info.isConsentFormAvailable && info.status === 'REQUIRED') return A.showConsentForm();
        })
        .catch(function(){})   // vẫn thử tải quảng cáo
        .then(function(){
          A.addListener('interstitialAdDismissed', function(){ finish(true); });
          A.addListener('interstitialAdFailedToShow', function(){ finish(true); });
          A.addListener('onRewardedVideoAdReward', function(){ rewarded = true; });
          A.addListener('onRewardedVideoAdDismissed', function(){ finish(rewarded); });
          A.addListener('onRewardedVideoAdFailedToShow', function(){ finish(false); });
          prepare('interstitial'); prepare('rewarded');
        });
    },
    ready: function(kind){ return !!A && loaded[kind]; },
    /* vùng GDPR: phải có nút để người dùng đổi lựa chọn đồng ý */
    privacyRequired: function(){ return privacyRequired; },
    showPrivacyOptions: function(){ return A ? A.showPrivacyOptionsForm().catch(function(){}) : Promise.resolve(); },
    /* hiện quảng cáo; resolve(true) = interstitial đã đóng / rewarded đã xem đủ để nhận thưởng */
    show: function(kind){
      return new Promise(function(resolve){
        loaded[kind] = false; rewarded = false;
        onDismiss = function(ok){ prepare(kind); resolve(ok); };
        (kind === 'rewarded' ? A.showRewardVideoAd() : A.showInterstitial()).catch(function(){ finish(false); });
      });
    }
  };
})();
var ADS_READY = Ads.init();
var PRIVACY_URL = 'https://tranthanhhai1997.github.io/kodanda/privacy.html';
