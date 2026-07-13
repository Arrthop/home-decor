document.addEventListener('DOMContentLoaded', () => {
  /* ═══════════════════════════════════════════════════
     SCROLL REVEAL (Intersection Observer)
     ═══════════════════════════════════════════════════ */
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // If it's the about section, trigger the counter animation
        if (entry.target.id === 'about') {
          triggerCounters();
        }
      } else {
        // Remove the class so it animates again next time you scroll to it
        entry.target.classList.remove('visible');
        
        // Reset counters if scrolling away from the about section
        if (entry.target.id === 'about') {
          resetCounters();
        }
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -10% 0px', // Trigger slightly before it hits the bottom
    threshold: 0.1
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ═══════════════════════════════════════════════════
     NUMBER COUNTER ANIMATION
     ═══════════════════════════════════════════════════ */
  let countersTriggered = false;
  
  function triggerCounters() {
    if (countersTriggered) return;
    countersTriggered = true;
    
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // lower is faster
    
    counters.forEach(counter => {
      const updateCount = () => {
        if (!countersTriggered) return; // Halt if reset was called during animation
        
        const target = +counter.getAttribute('data-target');
        let current = +counter.innerText.replace(/\D/g, ''); // strip non-digits
        
        const inc = target / speed;
        
        if (current < target) {
          // If it has a '+', append it back
          const hasPlus = counter.getAttribute('data-target').includes('+');
          const hasPercent = counter.getAttribute('data-target').includes('%');
          
          let nextValue = Math.ceil(current + inc);
          
          let formattedValue = nextValue;
          if (hasPlus) formattedValue = '+' + nextValue;
          if (hasPercent) formattedValue = nextValue + '%';
          
          counter.innerText = formattedValue;
          setTimeout(updateCount, 20);
        } else {
          // Ensure it ends perfectly on target
          const hasPlus = counter.getAttribute('data-target').includes('+');
          const hasPercent = counter.getAttribute('data-target').includes('%');
          
          let finalVal = target;
          if (hasPlus) finalVal = '+' + target;
          if (hasPercent) finalVal = target + '%';
          
          counter.innerText = finalVal;
        }
      };
      
      updateCount();
    });
  }

  function resetCounters() {
    countersTriggered = false;
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
      const hasPlus = counter.getAttribute('data-target').includes('+');
      const hasPercent = counter.getAttribute('data-target').includes('%');
      
      let zeroVal = '0';
      if (hasPlus) zeroVal = '+0';
      if (hasPercent) zeroVal = '0%';
      
      counter.innerText = zeroVal;
    });
  }

  /* ═══════════════════════════════════════════════════
     BACK TO TOP
     ═══════════════════════════════════════════════════ */
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     CUSTOM INTERACTIVE CURSOR
     ═══════════════════════════════════════════════════ */
  const cursor = document.getElementById('customCursor');
  if (cursor) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    const interactiveElements = document.querySelectorAll('a, button, .collection-card, .industry-item, .why-card');
    
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
    });
  }

  /* ═══════════════════════════════════════════════════
     WHATSAPP INQUIRY REDIRECT
     ═══════════════════════════════════════════════════ */
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(inquiryForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const subject = formData.get('subject');
      const message = formData.get('message');
      
      const text = `*New Project Inquiry*
*Name:* ${name}
*Email:* ${email}
*Subject:* ${subject || 'N/A'}

*Message:*
${message}`;

      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `https://wa.me/919890191919?text=${encodedText}`;
      
      window.open(whatsappUrl, '_blank');
      inquiryForm.reset();
    });
  }
});
