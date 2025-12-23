// ===============================
// ページ読み込み後にスクロール位置を再調整
// ===============================
// デフォルトのアンカースクロールを抑止
if (location.hash) {
  window.scrollTo(0, 0);
}

const adjustScroll = () => {
  if (!location.hash) return;

  const target = document.querySelector(location.hash);
  if (!target) return;

  const header = document.querySelector("header");
  const headerHeight = header ? header.offsetHeight : 0;

  const rect = target.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const targetPosition = rect.top + scrollTop - headerHeight - 10;

  window.scrollTo({
      top: targetPosition,
      behavior: "auto"
  });
};

window.addEventListener("load", adjustScroll);

// bfcache（戻る/進む）対策
window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
      adjustScroll();
  }
});


// ===============================
// ハンバーガーメニュー　メニュー外タップでもクローズ
// ===============================
const bodyElement = document.querySelector('body');
const hamBtn = document.getElementById('hamBtn');
const siteMenu = document.getElementById('siteMenu');

// ハンバーガークリックでトグル
hamBtn.addEventListener('click', function(e){
    bodyElement.classList.toggle('menu-open');
    e.stopPropagation(); // クリックイベントが body にバブリングするのを防ぐ
});

// メニュー内クリックはバブリング停止（外側判定を無効化）
siteMenu.addEventListener('click', function(e){
  e.stopPropagation();
});

// bodyクリックで外側クリック判定
bodyElement.addEventListener('click', function(e){
    if(bodyElement.classList.contains('menu-open')){
        // クリックした場所が siteMenu でも hamBtn でもない場合
        if(!siteMenu.contains(e.target) && !hamBtn.contains(e.target)){
            bodyElement.classList.remove('menu-open');
        }
    }
});

// メニュー内リンクで閉じる
document.querySelectorAll('.siteMenu-list a').forEach(link => {
  link.addEventListener('click', () => {
    bodyElement.classList.remove('menu-open');
  });
});


// ===============================
// 上へボタン　スクロール停止で出現 → アニメ開始
// ===============================
document.addEventListener('DOMContentLoaded', function() {
  const footerButton = document.getElementById('footerButton');
  let scrollTimeout;

  // 初期状態：完全非表示
  footerButton.classList.add('hidden');

  window.addEventListener('scroll', function() {

      // -------------------------
      // ページトップなら 非表示 & アニメリセット
      // -------------------------
      if (window.scrollY === 0) {
          footerButton.classList.add('hidden');
          footerButton.classList.remove('appear');
          return;
      }

      // スクロール中は非表示
      footerButton.classList.add('hidden');
      footerButton.classList.remove('appear');

      // 前回の停止タイマーをクリア
      clearTimeout(scrollTimeout);

      // -------------------------
      // スクロール停止判定
      // -------------------------
      scrollTimeout = setTimeout(function() {

          if (window.scrollY === 0) return;

          // ふわっと表示（opacity制御）
          footerButton.classList.remove('hidden');

          // 300ms後にアニメ開始（CSSの遅延と同期）
          setTimeout(() => {
              footerButton.classList.add('appear');
          }, 300);

      }, 300); // 停止判定：300ms
  });
});



// ===============================
// 動画sp、pc出し分け
// ===============================
document.addEventListener('DOMContentLoaded', (event) => {
  const videoElement = document.getElementById('background-video');
  
  // PC用とSP用の動画ファイルパスを定義
  // 適切な動画ファイル（MP4形式など）をサーバーにアップロードしてください。
  const videoSources = {
      desktop: './video/omusubi_pc_7.mp4',
      mobile: './video/omusubi_sp_3.mp4'
  };

  function setVideoSource() {
      // 例: 画面幅が768px以下をモバイルと判定
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      
      const newSrc = isMobile ? videoSources.mobile : videoSources.desktop;

      // 現在のsrcと異なる場合のみ更新
      if (videoElement.src !== newSrc) {
          console.log(`Loading video for: ${isMobile ? 'Mobile' : 'Desktop'}`);
          videoElement.src = newSrc;
          
          // ソースを変更したら、video.load()を呼び出して新しいソースを読み込ませる
          videoElement.load();
          
          // 自動再生を試みる（play()はPromiseを返す）
          const playPromise = videoElement.play();

          if (playPromise !== undefined) {
              playPromise.then(() => {
                  // 自動再生が開始された場合の処理
                  console.log("Autoplay started!");
              }).catch(error => {
                  // 自動再生がブロックされた場合の処理 (例: 音声付きの場合など)
                  console.warn("Autoplay was prevented:", error);
                  // ユーザーに再生ボタンのクリックを促すUIを表示するなど
              });
          }
      }
  }

  // ページ読み込み時とウィンドウリサイズ時に実行
  setVideoSource();
  window.addEventListener('resize', setVideoSource);
});




// ===============================
// お知らせ　モーダル要素取得
// ===============================
const modal = document.querySelector(".modal");
const modalContent = document.querySelector(".modal-content");
const modalText = document.querySelector(".modal-text");
const modalTitle = document.querySelector(".modal-title");
const closeBtn = document.querySelector(".close-btn");

// ===============================
// お知らせ情報 json 読み込み
// ===============================
fetch('./oshirase/news.json')
  .then(response => response.json())
  .then(data => {
    const listContainer = document.getElementById('news-list');

    data.news.forEach(item => {
      const li = document.createElement('li');
      li.classList.add('news-item', 'open-modal');
      li.dataset.title = item.title;
      li.dataset.text = item.text;

      // 左側
      const left = document.createElement('div');
      left.classList.add('news-left');

      const prefix = document.createElement('span');
      prefix.classList.add('year-prefix');
      prefix.textContent = item.year_prefix;

      const time = document.createElement('time');
      time.setAttribute('datetime', item.date_iso);
      time.textContent = item.date_display;

      left.appendChild(prefix);
      left.appendChild(time);

      // ラベル
      const p = document.createElement('p');
      p.textContent = item.label;

      // LI 組み立て
      li.appendChild(left);
      li.appendChild(p);
      listContainer.appendChild(li);

      // ===============================
      // モーダルイベント（ここに1回だけ登録）
      // ===============================
      li.addEventListener("click", () => {
        modalTitle.textContent = item.title;
        modalText.innerHTML = item.text.replace(/\n/g, "<br>");
        modal.classList.add("open");
      });
    });
  });

// ===============================
// モーダル共通処理
// ===============================

// Closeボタン
closeBtn.addEventListener("click", () => {
  modal.classList.remove("open");
});

// 背景クリックで閉じる
modal.addEventListener("click", () => {
  modal.classList.remove("open");
});

// コンテンツ部分クリックは閉じない
modalContent.addEventListener("click", (e) => {
  e.stopPropagation();
});



// ===============================
// スクロールでふわっとスライドアップ
// ===============================
const fadeUps = document.querySelectorAll('.fade-up-scroll');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
});

fadeUps.forEach(el => observer.observe(el));