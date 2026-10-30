// ===== Theme toggle =====
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

const isDark = () => root.getAttribute('data-theme') === 'dark' ||
  (!root.hasAttribute('data-theme') && systemDark.matches);

const syncToggleLabel = () => {
  themeToggle.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
};

themeToggle.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  syncToggleLabel();
});

systemDark.addEventListener?.('change', syncToggleLabel);
syncToggleLabel();

// ===== Reveal sections on scroll =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window && !reduceMotion) {
  root.classList.add('js-reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ===== Highlight the current section in the nav =====
const navLinks = [...document.querySelectorAll('.site-nav a')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));

if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(section => section && navObserver.observe(section));
}

document.getElementById('year').textContent = new Date().getFullYear();

// ===== Hero network backdrop =====
(() => {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LINK = 130;
  let nodes = [];
  let width = 0;
  let height = 0;
  let running = false;
  let frame;

  const accent = () => getComputedStyle(root).getPropertyValue('--accent').trim() || '#0f766e';

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(70, (width * height) / 14000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 1
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = ctx.strokeStyle = accent();
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.globalAlpha = (1 - d / LINK) * 0.35;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const step = () => {
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });
    draw();
    frame = requestAnimationFrame(step);
  };

  const start = () => {
    if (running || still) return;
    running = true;
    frame = requestAnimationFrame(step);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  resize();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    // Mobile browsers fire resize as the address bar hides; only rebuild on width changes
    if (canvas.offsetWidth === width) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); draw(); }, 150);
  });

  // Redraw in the new accent colour when the theme changes
  themeToggle.addEventListener('click', draw);
  systemDark.addEventListener?.('change', draw);

  // Only animate while the hero is on screen and the tab is visible
  let onScreen = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      onScreen && !document.hidden ? start() : stop();
    }).observe(canvas);
  }
  document.addEventListener('visibilitychange', () => {
    document.hidden || !onScreen ? stop() : start();
  });
  start();
})();
