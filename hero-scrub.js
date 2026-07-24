(function () {
  "use strict";

  var TOTAL_FRAMES = 240;
  var FRAME_DIR = "hero_section_video-2_frames";

  // Detect mobile once at startup
  var isMobileDevice = window.innerWidth <= 768;
  // On mobile, load every 3rd frame (80 frames ≈ 40MB instead of 240 ≈ 120MB)
  var FRAME_SKIP = isMobileDevice ? 3 : 1;

  function framePath(index) {
    var padded = String(index).padStart(3, "0");
    return FRAME_DIR + "/frame_" + padded + ".jpg";
  }

  var canvas = document.getElementById("heroCanvas");
  var ctx = canvas.getContext("2d");
  var heroSection = document.getElementById("heroSection");
  var branding = document.querySelector(".hero-branding");

  var cardLeft = document.querySelector(".card-left");
  var cardRight = document.querySelector(".card-right");
  var cardFarLeft = document.querySelector(".card-far-left");
  var cardFarRight = document.querySelector(".card-far-right");

  // Loading screen elements
  var loadingScreen = document.getElementById("loadingScreen");
  var progressBar = document.getElementById("loaderProgressBar");
  var percentageText = document.getElementById("loaderPercentage");

  // Scroll to top while loading
  window.scrollTo(0, 0);

  // Build the list of frame indices to load
  var frameIndices = [];
  for (var i = 1; i <= TOTAL_FRAMES; i += FRAME_SKIP) {
    frameIndices.push(i);
  }
  // Always include the very last frame
  if (frameIndices[frameIndices.length - 1] !== TOTAL_FRAMES) {
    frameIndices.push(TOTAL_FRAMES);
  }

  var FRAME_COUNT = frameIndices.length;
  var images = [];
  var loadedCount = 0;
  var loaderDismissed = false;
  var lastDrawnIndex = -1;

  // ── Dismiss the loading screen ──
  function dismissLoader() {
    if (loaderDismissed) return;
    loaderDismissed = true;
    setTimeout(function () {
      if (loadingScreen) loadingScreen.classList.add("hidden");
      document.body.classList.remove("is-loading");
      lastDrawnIndex = -1;
      handleScrollUpdate();
    }, 300);
  }

  // ── Loading progress tracker ──
  function onFrameLoaded() {
    loadedCount++;
    var pct = Math.round((loadedCount / FRAME_COUNT) * 100);

    if (progressBar) progressBar.style.width = pct + "%";
    if (percentageText) percentageText.textContent = pct + "%";

    if (loadedCount >= FRAME_COUNT) {
      dismissLoader();
    }
  }

  // ── Safety timeout: dismiss loader after 12s no matter what ──
  setTimeout(function () {
    if (!loaderDismissed) {
      dismissLoader();
    }
  }, 12000);

  // ── Preload all frames ──
  // IMPORTANT: Set onload/onerror BEFORE setting src to catch cached images
  for (var j = 0; j < frameIndices.length; j++) {
    (function (idx) {
      var img = new Image();
      var counted = false;

      function countOnce() {
        if (counted) return;
        counted = true;
        onFrameLoaded();
      }

      img.onload = countOnce;
      img.onerror = countOnce;
      img.src = framePath(frameIndices[idx]);

      // Handle images that loaded from cache before handlers attached
      if (img.complete) {
        countOnce();
      }

      images.push(img);
    })(j);
  }

  // ── Canvas sizing ──
  function resizeCanvas() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    if (isMobileDevice) {
      // 1x canvas on mobile — much cheaper drawImage calls
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      // DPR-aware on desktop (capped at 2x)
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    lastDrawnIndex = -1; // force redraw after resize
    if (loaderDismissed) handleScrollUpdate();
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // ── Draw a single frame ──
  function drawFrame(index) {
    if (index === lastDrawnIndex) return; // skip redundant draws
    lastDrawnIndex = index;

    var img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    var dpr = isMobileDevice ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    // Clear in device pixels
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Work in CSS pixel space
    var cW = canvas.width / dpr;
    var cH = canvas.height / dpr;
    var iW = img.naturalWidth, iH = img.naturalHeight;

    if (isMobileDevice) {
      // ── MOBILE: "contain" so the full earth is always visible ──
      var scale = Math.min(cW / iW, cH / iH);
      var drawW = iW * scale;
      var drawH = iH * scale;
      var drawX = (cW - drawW) / 2;
      var drawY = (cH - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      // ── DESKTOP: original cover + aspect-ratio correction (unchanged) ──
      var scale = Math.max(cW / iW, cH / iH);
      var drawW = iW * scale;
      var drawH = iH * scale;
      // Correct the 1.13x vertical stretch in the source frames
      drawH = drawH * 0.88;
      var drawX = (cW - drawW) / 2;
      var drawY = (cH - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  }

  // ── Main scroll handler ──
  function handleScrollUpdate() {
    if (!loaderDismissed) return;

    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var vw = window.innerWidth;
    var isMobile = vw <= 768;

    // 1. Scrub Phase — shorter scroll distance on mobile
    var SCRUB_HEIGHT = isMobile ? window.innerHeight * 1.8 : window.innerHeight * 2.5;
    var SPREAD_HEIGHT = isMobile ? window.innerHeight * 1.0 : window.innerHeight * 1.5;

    var scrubProgress = Math.min(scrollTop / SCRUB_HEIGHT, 1);
    var frameIndex = Math.floor(scrubProgress * (FRAME_COUNT - 1));
    drawFrame(frameIndex);

    // Fade canvas out at the end of the scrub
    if (scrubProgress > 0.9) {
      var fadeProgress = (scrubProgress - 0.9) / 0.1;
      canvas.style.opacity = 1 - Math.min(fadeProgress, 1);
    } else {
      canvas.style.opacity = 1;
    }

    // 2. Spread Phase
    var spreadScrollTop = Math.max(scrollTop - SCRUB_HEIGHT, 0);
    var spreadProgress = Math.min(spreadScrollTop / SPREAD_HEIGHT, 1);

    var ease = 1 - Math.pow(1 - spreadProgress, 3);

    // Fade and translate the branding
    var brandingShift = isMobile ? 20 : 40;
    branding.style.opacity = ease;
    branding.style.transform = "translateY(" + (brandingShift * (1 - ease)) + "px)";

    // Card spread — proportional to viewport width
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

  // ── Scroll listener with rAF throttle ──
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
