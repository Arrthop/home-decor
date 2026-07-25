(function () {
  "use strict";

  var TOTAL_FRAMES = 240;
  var FRAME_DIR = "hero_section_video-2_frames";
  var isMobileDevice = window.innerWidth <= 768;

  var canvas = document.getElementById("heroCanvas");
  var ctx = canvas.getContext("2d");
  var heroSection = document.getElementById("heroSection");
  var branding = document.querySelector(".hero-branding");

  var cardLeft = document.querySelector(".card-left");
  var cardRight = document.querySelector(".card-right");
  var cardFarLeft = document.querySelector(".card-far-left");
  var cardFarRight = document.querySelector(".card-far-right");

  var images = [];
  var FRAME_COUNT = 0;
  var loaderDone = !isMobileDevice; // Desktop: true immediately. Mobile: false until loaded.

  // ── Canvas sizing (same for both, original logic) ──
  function resizeCanvas() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    handleScrollUpdate();
  }

  // ── Draw a single frame ──
  function drawFrame(index) {
    var img = images[index];
    if (!img || !img.complete) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var cW = canvas.width, cH = canvas.height;
    var iW = img.naturalWidth, iH = img.naturalHeight;

    if (isMobileDevice) {
      // MOBILE: cover mode so earth fills the entire screen on every phone
      var scale = Math.max(cW / iW, cH / iH);
      var drawW = iW * scale;
      var drawH = iH * scale;
      var drawX = (cW - drawW) / 2;
      var drawY = (cH - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      // DESKTOP: original cover + 0.88 aspect correction (unchanged)
      var scale = Math.max(cW / iW, cH / iH);
      var drawW = iW * scale;
      var drawH = iH * scale;
      drawH = drawH * 0.88;
      var drawX = (cW - drawW) / 2;
      var drawY = (cH - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  }

  // ── Scroll handler (shared) ──
  function handleScrollUpdate() {
    if (!loaderDone) return;

    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var vw = window.innerWidth;
    var isMobile = vw <= 768;

    var SCRUB_HEIGHT = isMobile ? window.innerHeight * 1.8 : window.innerHeight * 2.5;
    var SPREAD_HEIGHT = isMobile ? window.innerHeight * 1.0 : window.innerHeight * 1.5;

    var scrubProgress = Math.min(scrollTop / SCRUB_HEIGHT, 1);
    var frameIndex = Math.floor(scrubProgress * (FRAME_COUNT - 1));
    drawFrame(frameIndex);

    if (scrubProgress > 0.9) {
      var fadeProgress = (scrubProgress - 0.9) / 0.1;
      canvas.style.opacity = 1 - Math.min(fadeProgress, 1);
    } else {
      canvas.style.opacity = 1;
    }

    var spreadScrollTop = Math.max(scrollTop - SCRUB_HEIGHT, 0);
    var spreadProgress = Math.min(spreadScrollTop / SPREAD_HEIGHT, 1);
    var ease = 1 - Math.pow(1 - spreadProgress, 3);

    var brandingShift = isMobile ? 20 : 40;
    branding.style.opacity = ease;
    branding.style.transform = "translateY(" + (brandingShift * (1 - ease)) + "px)";

    var spreadNear, spreadFar;
    var rotL, rotR, rotFL, rotFR;
    var yNearL, yNearR, yFarL, yFarR;

    if (vw <= 480) {
      spreadNear = vw * 0.17;
      spreadFar = vw * 0.31;
      rotL = -3; rotR = 3; rotFL = -5; rotFR = 5;
      yNearL = 10; yNearR = 8; yFarL = 15; yFarR = 12;
    } else if (vw <= 768) {
      spreadNear = vw * 0.18;
      spreadFar = vw * 0.33;
      rotL = -4; rotR = 4; rotFL = -7; rotFR = 6;
      yNearL = 15; yNearR = 10; yFarL = 25; yFarR = 20;
    } else if (vw <= 1024) {
      spreadNear = vw * 0.22;
      spreadFar = vw * 0.36;
      rotL = -6; rotR = 5; rotFL = -10; rotFR = 9;
      yNearL = 20; yNearR = 12; yFarL = 30; yFarR = 28;
    } else {
      spreadNear = 300;
      spreadFar = 560;
      rotL = -8; rotR = 6; rotFL = -14; rotFR = 11;
      yNearL = 25; yNearR = 15; yFarL = 40; yFarR = 35;
    }

    cardLeft.style.transform = "rotate(" + (rotL * ease) + "deg) translateX(" + (-spreadNear * ease) + "px) translateY(" + (yNearL * ease) + "px)";
    cardLeft.style.opacity = 0.4 + (0.48 * ease);

    cardRight.style.transform = "rotate(" + (rotR * ease) + "deg) translateX(" + (spreadNear * ease) + "px) translateY(" + (yNearR * ease) + "px)";
    cardRight.style.opacity = 0.4 + (0.48 * ease);

    cardFarLeft.style.transform = "rotate(" + (rotFL * ease) + "deg) translateX(" + (-spreadFar * ease) + "px) translateY(" + (yFarL * ease) + "px)";
    cardFarLeft.style.opacity = 0.1 + (0.55 * ease);

    cardFarRight.style.transform = "rotate(" + (rotFR * ease) + "deg) translateX(" + (spreadFar * ease) + "px) translateY(" + (yFarR * ease) + "px)";
    cardFarRight.style.opacity = 0.1 + (0.55 * ease);

    if (spreadProgress >= 1) {
      heroSection.classList.add('spread-done');
    } else {
      heroSection.classList.remove('spread-done');
    }
  }

  // ══════════════════════════════════════════════════════
  //  INIT: Desktop vs Mobile setup
  // ══════════════════════════════════════════════════════

  if (!isMobileDevice) {
    // ── DESKTOP: original behavior, no loading screen ──
    var ls = document.getElementById("loadingScreen");
    if (ls) ls.style.display = "none";

    // ── DESKTOP: skip every other frame for faster load ──
    var desktopFrameIndices = [];
    for (var i = 1; i <= TOTAL_FRAMES; i += 2) {
      desktopFrameIndices.push(i);
    }
    if (desktopFrameIndices[desktopFrameIndices.length - 1] !== TOTAL_FRAMES) {
      desktopFrameIndices.push(TOTAL_FRAMES);
    }
    FRAME_COUNT = desktopFrameIndices.length;

    for (var i = 0; i < desktopFrameIndices.length; i++) {
      var img = new Image();
      img.src = FRAME_DIR + "/frame_" + String(desktopFrameIndices[i]).padStart(3, "0") + ".jpg";
      img.onload = function () { handleScrollUpdate(); };
      images.push(img);
    }

    requestAnimationFrame(handleScrollUpdate);

  } else {
    // ── MOBILE: loading screen + compressed frames ──
    document.body.classList.add("is-loading");
    window.scrollTo(0, 0);

    var loadingScreen = document.getElementById("loadingScreen");
    var progressBar = document.getElementById("loaderProgressBar");
    var percentageText = document.getElementById("loaderPercentage");
    var loadedCount = 0;

    // Build list of every 3rd frame
    var frameIndices = [];
    for (var m = 1; m <= TOTAL_FRAMES; m += 3) {
      frameIndices.push(m);
    }
    if (frameIndices[frameIndices.length - 1] !== TOTAL_FRAMES) {
      frameIndices.push(TOTAL_FRAMES);
    }
    FRAME_COUNT = frameIndices.length;

    var dismissLoader = function () {
      if (loaderDone) return;
      loaderDone = true;
      setTimeout(function () {
        if (loadingScreen) loadingScreen.classList.add("hidden");
        document.body.classList.remove("is-loading");
        handleScrollUpdate();
      }, 300);
    };

    var onFrameLoaded = function () {
      loadedCount++;
      var pct = Math.round((loadedCount / FRAME_COUNT) * 100);
      if (progressBar) progressBar.style.width = pct + "%";
      if (percentageText) percentageText.textContent = pct + "%";
      if (loadedCount >= FRAME_COUNT) dismissLoader();
    };

    // Safety timeout
    setTimeout(function () { if (!loaderDone) dismissLoader(); }, 12000);

    // Load compressed mobile frames
    for (var j = 0; j < frameIndices.length; j++) {
      (function (idx) {
        var img = new Image();
        var counted = false;
        var countOnce = function () {
          if (counted) return;
          counted = true;
          onFrameLoaded();
        };
        img.onload = countOnce;
        img.onerror = countOnce;
        img.src = FRAME_DIR + "/mobile/frame_" + String(frameIndices[idx]).padStart(3, "0") + ".jpg";
        if (img.complete) countOnce();
        images.push(img);
      })(j);
    }
  }

  // Init canvas and start listening
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        handleScrollUpdate();
        ticking = false;
      });
      ticking = true;
    }
  });

})();
