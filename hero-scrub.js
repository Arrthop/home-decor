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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    handleScrollUpdate();
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function drawFrame(index) {
    if (!ready) return;
    var img = images[index];
    if (!img || !img.complete) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var cW = canvas.width, cH = canvas.height;
    var iW = img.naturalWidth, iH = img.naturalHeight;
    var scale = Math.max(cW / iW, cH / iH);
    var drawW = iW * scale, drawH = iH * scale;
    var drawX = (cW - drawW) / 2, drawY = (cH - drawH) / 2;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  function handleScrollUpdate() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    // 1. Scrub Phase
    var SCRUB_HEIGHT = window.innerHeight * 2.5; // Video animation duration
    var SPREAD_HEIGHT = window.innerHeight * 1.5; // Card spread duration

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
    // Because it's natively centered in Flexbox now, we only need translateY
    branding.style.opacity = ease;
    branding.style.transform = `translateY(${40 * (1 - ease)}px)`;

    // Vast, expansive spread for the cards
    cardLeft.style.transform = `rotate(${-8 * ease}deg) translateX(${-300 * ease}px) translateY(${25 * ease}px)`;
    cardLeft.style.opacity = 0.4 + (0.48 * ease);

    cardRight.style.transform = `rotate(${6 * ease}deg) translateX(${300 * ease}px) translateY(${15 * ease}px)`;
    cardRight.style.opacity = 0.4 + (0.48 * ease);

    cardFarLeft.style.transform = `rotate(${-14 * ease}deg) translateX(${-560 * ease}px) translateY(${40 * ease}px)`;
    cardFarLeft.style.opacity = 0.1 + (0.55 * ease);

    cardFarRight.style.transform = `rotate(${11 * ease}deg) translateX(${560 * ease}px) translateY(${35 * ease}px)`;
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
