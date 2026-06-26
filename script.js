// ==================== RESUME URL ====================
const RESUME_URL = 'https://drive.google.com/file/d/1LOUWd9tibt6Ca7P_cuq4MtPXZCWU489R/view?usp=drive_link';

function openResume() {
  window.open(RESUME_URL, '_blank', 'noopener');
}

// ==================== LOADING SCREEN ====================
(function initLoader() {
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.opacity = '1';
    }, 1800);
  });
})();

// ==================== SCROLL PROGRESS ====================
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  }, { passive: true });
})();

// ==================== PARTICLES ====================
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(60, Math.floor(w * h / 25000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99, 102, 241, ' + p.opacity + ')';
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
})();

// ==================== MOUSE SPOTLIGHT ====================
(function initSpotlight() {
  if (window.innerWidth <= 768) return;
  const spot = document.getElementById('spotlight');
  if (!spot) return;
  let raf;
  document.addEventListener('mousemove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      spot.style.left = e.clientX + 'px';
      spot.style.top = e.clientY + 'px';
    });
  }, { passive: true });
})();

// ==================== CUSTOM CURSOR ====================
(function initCustomCursor() {
  if (window.innerWidth <= 768) return;

  const cursor = document.getElementById('customCursor');
  const ring = cursor && cursor.querySelector('.cursor-ring');
  const dot = cursor && cursor.querySelector('.cursor-dot');
  if (!cursor || !ring || !dot) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let visible = false;

  const interactive = 'a, button, [role="button"], input, textarea, select, label, .project-card, .contact-card, .nav-link, .profile-card, .filter-btn, .skill-card, .cert-card, .timeline-content';

  function setDot(x, y) {
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
  }

  function setRing(x, y) {
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    setDot(mouseX, mouseY);
    if (!visible) {
      visible = true;
      cursor.classList.add('visible');
      ringX = mouseX;
      ringY = mouseY;
      setRing(ringX, ringY);
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
  document.addEventListener('mouseenter', () => { if (visible) cursor.classList.add('visible'); });

  document.addEventListener('mousedown', () => cursor.classList.add('click'));
  document.addEventListener('mouseup', () => cursor.classList.remove('click'));

  document.addEventListener('mouseover', (e) => {
    cursor.classList.toggle('hover', !!e.target.closest(interactive));
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.22;
    ringY += (mouseY - ringY) * 0.22;
    setRing(ringX, ringY);
    requestAnimationFrame(animateRing);
  }
  animateRing();
})();

// ==================== CANVAS CURSOR (visible accent trails) ====================
(function initCanvasCursor() {
  if (window.innerWidth <= 768) return;

  function Oscillator(opts) {
    this.phase = opts.phase || 0;
    this.offset = opts.offset || 0;
    this.frequency = opts.frequency || 0.001;
    this.amplitude = opts.amplitude || 1;
  }
  Oscillator.prototype.update = function () {
    this.phase += this.frequency;
    return this.offset + Math.sin(this.phase) * this.amplitude;
  };

  function Node() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; }

  var E = { friction: 0.5, trails: 18, size: 45, dampening: 0.25, tension: 0.98 };
  var ctx, colorOsc, pos = { x: 0, y: 0 }, lines = [];

  function Line(opts) {
    this.spring = opts.spring + 0.1 * Math.random() - 0.02;
    this.friction = E.friction + 0.01 * Math.random() - 0.002;
    this.nodes = [];
    for (var i = 0; i < E.size; i++) {
      var n = new Node();
      n.x = pos.x; n.y = pos.y;
      this.nodes.push(n);
    }
  }
  Line.prototype.update = function () {
    var spring = this.spring, t = this.nodes[0];
    t.vx += (pos.x - t.x) * spring;
    t.vy += (pos.y - t.y) * spring;
    for (var i = 0; i < this.nodes.length; i++) {
      t = this.nodes[i];
      if (i > 0) {
        var prev = this.nodes[i - 1];
        t.vx += (prev.x - t.x) * spring;
        t.vy += (prev.y - t.y) * spring;
        t.vx += prev.vx * E.dampening;
        t.vy += prev.vy * E.dampening;
      }
      t.vx *= this.friction; t.vy *= this.friction;
      t.x += t.vx; t.y += t.vy;
      spring *= E.tension;
    }
  };
  Line.prototype.draw = function () {
    var n0 = this.nodes[0], x = n0.x, y = n0.y;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (var i = 1; i < this.nodes.length - 2; i++) {
      var a = this.nodes[i], b = this.nodes[i + 1];
      x = 0.5 * (a.x + b.x); y = 0.5 * (a.y + b.y);
      ctx.quadraticCurveTo(a.x, a.y, x, y);
    }
    var a = this.nodes[this.nodes.length - 2], b = this.nodes[this.nodes.length - 1];
    ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
    ctx.stroke(); ctx.closePath();
  };

  function spawnLines() {
    lines = [];
    for (var i = 0; i < E.trails; i++) {
      lines.push(new Line({ spring: 0.4 + (i / E.trails) * 0.025 }));
    }
  }

  function onPointerMove(e) {
    if (e.touches) { pos.x = e.touches[0].pageX; pos.y = e.touches[0].pageY; }
    else { pos.x = e.clientX; pos.y = e.clientY; }
  }

  function render() {
    if (!ctx.running) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    var h = Math.round(colorOsc.update());
    ctx.strokeStyle = 'hsla(' + h + ',85%,70%,0.42)';
    ctx.lineWidth = 2;
    for (var i = 0; i < lines.length; i++) { lines[i].update(); lines[i].draw(); }

    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();
    requestAnimationFrame(render);
  }

  function boot() {
    var canvas = document.getElementById('canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    ctx.running = true;
    colorOsc = new Oscillator({ phase: Math.random() * 6.28, amplitude: 40, frequency: 0.001, offset: 240 });
    function resize() { ctx.canvas.width = window.innerWidth; ctx.canvas.height = window.innerHeight; }
    resize();
    function firstMove(e) {
      document.removeEventListener('mousemove', firstMove);
      onPointerMove(e); spawnLines(); render();
    }
    document.addEventListener('mousemove', firstMove);
    document.addEventListener('mousemove', onPointerMove);
    window.addEventListener('resize', resize);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

// ==================== NAVIGATION ====================
const navbar = document.getElementById('navbar');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

mobileMenuToggle.addEventListener('click', () => {
  mobileMenuToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenuToggle.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
  });
});

const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.pageYOffset;
  sections.forEach(section => {
    const top = section.offsetTop - 120;
    const id = section.getAttribute('id');
    if (scrollY > top && scrollY <= top + section.offsetHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + id) link.classList.add('active');
      });
    }
  });
}, { passive: true });

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) window.scrollTo({ top: target.offsetTop - 90, behavior: 'smooth' });
  });
});

// ==================== SCROLL TO TOP ====================
(function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// ==================== SCROLL ANIMATIONS ====================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.level + '%';
      });
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ==================== COUNTER ANIMATION ====================
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      let current = 0;
      const step = Math.max(1, Math.floor(target / 30));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
      }, 40);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObs.observe(c));
})();

// ==================== TYPING ANIMATION ====================
(function initTyping() {
  const el = document.getElementById('typingText');
  if (!el) return;
  const text = "Hi, I'm";
  let i = 0;
  function type() {
    if (i < text.length) {
      el.textContent = text.slice(0, i + 1);
      i++;
      setTimeout(type, 80);
    }
  }
  setTimeout(type, 400);
})();

// ==================== RESUME HANDLERS ====================
const downloadResumeBtn = document.getElementById('downloadResume');

function triggerResumeDownload() { openResume(); }

[downloadResumeBtn,
 document.getElementById('heroViewResume'),
 document.getElementById('viewResumeBtn'),
 document.getElementById('downloadResumeBtn'),
 document.getElementById('contactResumeBtn')
].forEach(el => {
  if (!el) return;
  el.addEventListener('click', (e) => { e.preventDefault(); openResume(); });
});

const resumeSectionPreview = document.getElementById('resumeSectionPreview');
if (resumeSectionPreview) {
  resumeSectionPreview.addEventListener('click', (e) => { e.preventDefault(); openResume(); });
}

// ==================== PROJECT FILTER & SEARCH ====================
(function initProjectFilter() {
  const search = document.getElementById('projectSearch');
  const filters = document.getElementById('projectFilters');
  const cards = document.querySelectorAll('.project-card');
  let activeFilter = 'all';

  function applyFilters() {
    const query = search ? search.value.toLowerCase().trim() : '';
    cards.forEach(card => {
      const tags = card.dataset.tags || '';
      const searchText = card.dataset.search || '';
      const matchFilter = activeFilter === 'all' || tags.includes(activeFilter);
      const matchSearch = !query || searchText.includes(query) || card.querySelector('h3').textContent.toLowerCase().includes(query);
      card.classList.toggle('hidden', !(matchFilter && matchSearch));
    });
  }

  if (search) search.addEventListener('input', applyFilters);
  if (filters) {
    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  }
})();

// ==================== COMMAND PALETTE ====================
(function initCommandPalette() {
  const palette = document.getElementById('commandPalette');
  const input = document.getElementById('cmdInput');
  const list = document.getElementById('cmdList');
  if (!palette || !input || !list) return;

  const commands = [
    { icon: 'fa-home', label: 'Go to Home', action: () => scrollToSection('#home') },
    { icon: 'fa-file-pdf', label: 'View Resume', action: openResume },
    { icon: 'fa-user', label: 'Go to About', action: () => scrollToSection('#about') },
    { icon: 'fa-layer-group', label: 'Go to Skills', action: () => scrollToSection('#skills') },
    { icon: 'fa-code', label: 'Open LeetCode Profile', action: () => window.open('https://leetcode.com/u/deva_jeshurun/', '_blank') },
    { icon: 'fa-folder-open', label: 'Go to Projects', action: () => scrollToSection('#projects') },
    { icon: 'fa-briefcase', label: 'Go to Experience', action: () => scrollToSection('#experience') },
    { icon: 'fa-award', label: 'Go to Certificates', action: () => scrollToSection('#certificates') },
    { icon: 'fa-envelope', label: 'Go to Contact', action: () => scrollToSection('#contact') },
    { icon: 'fa-github', label: 'Open GitHub', action: () => window.open('https://github.com/DevaJeshurun', '_blank') },
    { icon: 'fa-linkedin', label: 'Open LinkedIn', action: () => window.open('https://linkedin.com/in/deva-jeshurun-aa493a306', '_blank') },
    { icon: 'fa-copy', label: 'Copy Email', action: () => copyToClipboard('devajeshurun57@gmail.com') },
    { icon: 'fa-arrow-up', label: 'Scroll to Top', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
  ];

  function scrollToSection(sel) {
    const el = document.querySelector(sel);
    if (el) window.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
  }

  let activeIndex = 0;

  function renderList(filter) {
    const q = (filter || '').toLowerCase();
    const filtered = commands.filter(c => c.label.toLowerCase().includes(q));
    activeIndex = 0;
    list.innerHTML = filtered.map((c, i) =>
      '<li data-index="' + i + '"><i class="fas ' + c.icon + '"></i><span>' + c.label + '</span></li>'
    ).join('');
    list.querySelectorAll('li').forEach((li, i) => {
      li.addEventListener('click', () => { filtered[i].action(); closePalette(); });
    });
    highlightItem();
    list._filtered = filtered;
  }

  function highlightItem() {
    list.querySelectorAll('li').forEach((li, i) => li.classList.toggle('active', i === activeIndex));
    const active = list.querySelector('li.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function openPalette() {
    palette.hidden = false;
    input.value = '';
    renderList('');
    setTimeout(() => input.focus(), 50);
    document.body.style.overflow = 'hidden';
  }

  function closePalette() {
    palette.hidden = true;
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      palette.hidden ? openPalette() : closePalette();
      return;
    }
    if (palette.hidden) return;
    if (e.key === 'Escape') { closePalette(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const items = list.querySelectorAll('li');
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      highlightItem();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      highlightItem();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const filtered = list._filtered || [];
      if (filtered[activeIndex]) { filtered[activeIndex].action(); closePalette(); }
    }
  });

  input.addEventListener('input', () => renderList(input.value));
  palette.querySelector('.cmd-overlay').addEventListener('click', closePalette);
})();

// ==================== COPY TO CLIPBOARD ====================
function copyToClipboard(text, cardEl) {
  if (!navigator.clipboard) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    _showCopiedFeedback(cardEl, text);
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    _showCopiedFeedback(cardEl, text);
  }).catch(() => {
    showNotification('Could not copy. Please copy manually: ' + text, 'error');
  });
}

function _showCopiedFeedback(cardEl, text) {
  if (cardEl) {
    cardEl.classList.add('copied');
    const actionEl = cardEl.querySelector('.cc-action');
    if (actionEl) {
      const prev = actionEl.textContent;
      actionEl.textContent = '✓ Copied to clipboard!';
      setTimeout(() => {
        cardEl.classList.remove('copied');
        actionEl.textContent = prev;
      }, 2000);
    }
  }
  showNotification('Email address copied to clipboard!', 'success');
}

// ==================== NOTIFICATION ====================
function showNotification(message, type) {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const n = document.createElement('div');
  n.className = 'notification notification-' + (type || 'info');
  const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
  n.innerHTML = '<i class="fas fa-' + (icons[type] || 'info-circle') + '"></i><span>' + message + '</span>';
  document.body.appendChild(n);

  setTimeout(() => {
    n.style.animation = 'slideOutRight 0.4s ease forwards';
    setTimeout(() => n.remove(), 400);
  }, 3500);
}

// ==================== LAZY LOADING FALLBACK ====================
if ('loading' in HTMLImageElement.prototype) {
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.dataset.src) img.src = img.dataset.src;
  });
}

console.log('%c Portfolio Loaded ', 'background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:14px;padding:8px 16px;border-radius:6px;font-weight:bold;');
console.log('%c Deva Jeshurun — Press Ctrl+K for command palette ', 'color:#a1a1b5;font-size:11px;');
