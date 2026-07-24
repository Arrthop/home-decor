(function () {
  "use strict";

  const FRAME_COUNT = 240;
  const FRAME_DIR = "hero_section_video-2_frames";

  function framePath(index) {
    const padded = String(index).padStart(3, "0");
    return FRAME_DIR + "/frame_" + padded + ".jpg";
  }

  const canvas = document.getElementById("heroCanvas");
  const ctx = canvas.getContext("2d");
  const heroSection = document.getElementById("heroSection");
  const branding = document.querySelector(".hero-branding");
  
  const cardLeft = document.querySelector(".card-left");
  const cardRight = document.querySelector(".card-right");
  const cardFarLeft = document.querySelector(".card-far-left");
  const cardFarRight = document.querySelector(".card-far-right");

  var images = [];
  var ready = true;

  for (var i = 1; i <= FRAME_COUNT; i++) {
    var img = new Image();
    img.src = framePath(i);
    img.onload = function () {
      handleScrollUpdate();
    };
    images.push(img);
  }

  requestAnimationFrame(handleScrollUpdate);

  function resizeCanvas() {
    var dpr = window.devicePixelRatio || 1;
    var w = window.innerWidth;
    var h = window.innerHeight;
    // Use CSS pixels for display size
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    // Use device pixels for sharp rendering (capped at 2x to save memory on mobile)
    var effectiveDpr = Math.min(dpr, 2);
    canvas.width = w * effectiveDpr;
    canvas.height = h * effectiveDpr;
    ctx.setTransform(effectiveDpr, 0, 0, effectiveDpr, 0, 0);
    handleScrollUpdate();
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function drawFrame(index) {
    if (!ready) return;
    var img = images[index];
    if (!img || !img.complete) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Work in CSS pixel space (the dpr transform handles the rest)
    var cW = canvas.width / dpr;
    var cH = canvas.height / dpr;
    var iW = img.naturalWidth, iH = img.naturalHeight;
    var vw = window.innerWidth;

    if (vw <= 768) {
      // ── MOBILE: use "contain" so the full earth is always visible ──
      var scale = Math.min(cW / iW, cH / iH);
      var drawW = iW * scale;
      var drawH = iH * scale;
      // No 0.88 squish on mobile — it pushes the earth off-screen on portrait
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

  function handleScrollUpdate() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var vw = window.innerWidth;
    var isMobile = vw <= 768;
    
    // 1. Scrub Phase — shorter scroll on mobile for faster animation
    var SCRUB_HEIGHT = isMobile ? window.innerHeight * 1.8 : window.innerHeight * 2.5;
    var SPREAD_HEIGHT = isMobile ? window.innerHeight * 1.0 : window.innerHeight * 1.5;

    var scrubProgress = Math.min(scrollTop / SCRUB_HEIGHT, 1);
    var frameIndex = Math.floor(scrubProgress * (FRAME_COUNT - 1));
    drawFrame(frameIndex);

    // Fade canvas out exactly at the end of the scrub
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
    branding.style.transform = `translateY(${brandingShift * (1 - ease)}px)`;

    // Card spread — proportional to viewport width
    var spreadNear, spreadFar;
    var rotL, rotR, rotFL, rotFR;
    var yNearL, yNearR, yFarL, yFarR;

    if (vw <= 480) {
      // Small mobile
      spreadNear = vw * 0.17;
      spreadFar = vw * 0.31;
      rotL = -3; rotR = 3; rotFL = -5; rotFR = 5;
      yNearL = 10; yNearR = 8; yFarL = 15; yFarR = 12;
    } else if (vw <= 768) {
      // Mobile
      spreadNear = vw * 0.18;
      spreadFar = vw * 0.33;
      rotL = -4; rotR = 4; rotFL = -7; rotFR = 6;
      yNearL = 15; yNearR = 10; yFarL = 25; yFarR = 20;
    } else if (vw <= 1024) {
      // Tablet
      spreadNear = vw * 0.22;
      spreadFar = vw * 0.36;
      rotL = -6; rotR = 5; rotFL = -10; rotFR = 9;
      yNearL = 20; yNearR = 12; yFarL = 30; yFarR = 28;
    } else {
      // Desktop
      spreadNear = 300;
      spreadFar = 560;
      rotL = -8; rotR = 6; rotFL = -14; rotFR = 11;
      yNearL = 25; yNearR = 15; yFarL = 40; yFarR = 35;
    }

    cardLeft.style.transform = `rotate(${rotL * ease}deg) translateX(${-spreadNear * ease}px) translateY(${yNearL * ease}px)`;
    cardLeft.style.opacity = 0.4 + (0.48 * ease);

    cardRight.style.transform = `rotate(${rotR * ease}deg) translateX(${spreadNear * ease}px) translateY(${yNearR * ease}px)`;
    cardRight.style.opacity = 0.4 + (0.48 * ease);

    cardFarLeft.style.transform = `rotate(${rotFL * ease}deg) translateX(${-spreadFar * ease}px) translateY(${yFarL * ease}px)`;
    cardFarLeft.style.opacity = 0.1 + (0.55 * ease);

    cardFarRight.style.transform = `rotate(${rotFR * ease}deg) translateX(${spreadFar * ease}px) translateY(${yFarR * ease}px)`;
    cardFarRight.style.opacity = 0.1 + (0.55 * ease);

    if (spreadProgress >= 1) {
       heroSection.classList.add('spread-done');
    } else {
       heroSection.classList.remove('spread-done');
    }
  }

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
