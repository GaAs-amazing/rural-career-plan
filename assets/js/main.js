/* 京津冀高端医养结合康养产业项目 · 建设方案（网页版）交互 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 顶部导航：滚动状态 / 进度条 ---------- */
  var topbar = document.getElementById('topbar');
  var progress = document.getElementById('progress');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (topbar) topbar.classList.toggle('is-stuck', y > 12);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    }
    var toTop = document.getElementById('toTop');
    if (toTop) toTop.classList.toggle('is-on', y > 640);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 移动端菜单 ---------- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 导航高亮 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var targets = navLinks
    .map(function (a) {
      var id = a.getAttribute('href');
      return id && id.length > 1 ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && targets.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    targets.forEach(function (t) { navObserver.observe(t); });
  }

  /* ---------- 入场动画 ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 灯箱 ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbCount = document.getElementById('lbCount');

  var shots = Array.prototype.slice
    .call(document.querySelectorAll('.figure-media img, .g-card img'))
    .map(function (img) {
      var holder = img.closest('[data-caption]');
      return {
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || '',
        cap: (holder && holder.getAttribute('data-caption')) || img.getAttribute('alt') || ''
      };
    });

  var current = 0;

  function render(i) {
    if (!shots.length) return;
    current = (i + shots.length) % shots.length;
    var s = shots[current];
    lbImg.src = s.src;
    lbImg.alt = s.alt;
    lbCap.textContent = s.cap;
    lbCount.textContent = (current + 1) + ' / ' + shots.length;
  }

  function openLb(i) {
    if (!lb) return;
    render(i);
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var close = lb.querySelector('.lb-close');
    if (close) close.focus();
  }

  function closeLb() {
    if (!lb) return;
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  if (lb) {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.figure-media, .g-card');
      if (!trigger) return;
      e.preventDefault();
      var img = trigger.querySelector('img');
      var idx = shots.findIndex(function (s) { return img && s.src === img.getAttribute('src'); });
      openLb(idx < 0 ? 0 : idx);
    });

    lb.querySelector('.lb-close').addEventListener('click', closeLb);
    lb.querySelector('.lb-prev').addEventListener('click', function () { render(current - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { render(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') render(current - 1);
      if (e.key === 'ArrowRight') render(current + 1);
    });
  }

  /* ---------- 回到顶部 ---------- */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
})();
