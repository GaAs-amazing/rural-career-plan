/* 个人网站交互：导航、滚动进度、入场动画、知识库搜索、模块导航高亮 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var topbar = document.getElementById('topbar');
  var progress = document.getElementById('progress');

  /* ---------- 滚动状态与进度 ---------- */
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (topbar) topbar.classList.toggle('is-stuck', y > 10);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    }
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

  /* ---------- 入场动画 ---------- */
  var revealEls = [].slice.call(document.querySelectorAll('.reveal'));
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); ro.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 模块导航高亮 ---------- */
  var sideLinks = [].slice.call(document.querySelectorAll('.kb-side a[href^="#"]'));
  if (sideLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    sideLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var mo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        sideLinks.forEach(function (a) { a.classList.remove('is-current'); });
        var link = byId[en.target.id];
        if (link) link.classList.add('is-current');
      });
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
    [].slice.call(document.querySelectorAll('.module')).forEach(function (m) { mo.observe(m); });
  }

  /* ---------- 知识库搜索 ---------- */
  var input = document.getElementById('kbSearch');
  var panel = document.getElementById('kbResults');
  var countEl = document.getElementById('kbCount');
  var cards = [].slice.call(document.querySelectorAll('.kb-card'));

  if (input && panel && cards.length) {
    var data = cards.map(function (card, i) {
      var title = card.getAttribute('data-title') || '';
      var mod = card.getAttribute('data-module') || '';
      var tags = card.getAttribute('data-tags') || '';
      var text = (card.textContent || '').replace(/\s+/g, ' ').trim();
      return {
        el: card, i: i, title: title, mod: mod, tags: tags, text: text,
        hay: (title + ' ' + tags + ' ' + text).toLowerCase()
      };
    });

    var filter = '';
    var active = -1;
    var results = [];

    function esc(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function mark(text, terms) {
      var safe = esc(text);
      terms.forEach(function (t) {
        if (!t) return;
        var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        safe = safe.replace(re, '<mark>$1</mark>');
      });
      return safe;
    }

    function snippet(d, terms) {
      var lower = d.text.toLowerCase();
      var pos = -1;
      for (var k = 0; k < terms.length; k++) {
        var p = lower.indexOf(terms[k]);
        if (p !== -1 && (pos === -1 || p < pos)) pos = p;
      }
      if (pos === -1) pos = 0;
      var start = Math.max(0, pos - 34);
      var str = d.text.slice(start, start + 96);
      return (start > 0 ? '…' : '') + mark(str, terms) + (start + 96 < d.text.length ? '…' : '');
    }

    function search(q) {
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) return [];
      var hits = [];
      data.forEach(function (d) {
        if (filter && d.mod !== filter) return;
        var score = 0, ok = true;
        terms.forEach(function (t) {
          var inTitle = d.title.toLowerCase().indexOf(t) !== -1;
          var inTags = d.tags.toLowerCase().indexOf(t) !== -1;
          var inText = d.hay.indexOf(t) !== -1;
          if (!inText) { ok = false; return; }
          score += inTitle ? 14 : (inTags ? 7 : 2);
          var occ = d.hay.split(t).length - 1;
          score += Math.min(occ, 6);
        });
        if (ok) hits.push({ d: d, score: score });
      });
      hits.sort(function (a, b) { return b.score - a.score; });
      return hits.slice(0, 14).map(function (h) { return h.d; });
    }

    function applyFilter() {
      cards.forEach(function (c) {
        c.hidden = !!filter && c.getAttribute('data-module') !== filter;
      });
      if (countEl) countEl.textContent = filter ? filter : cards.length + ' 条知识点';
    }

    function render(q) {
      active = -1;
      if (!q.trim()) {
        panel.hidden = true;
        panel.innerHTML = '';
        results = [];
        applyFilter();
        return;
      }
      results = search(q);
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      panel.innerHTML = '';

      if (!results.length) {
        var empty = document.createElement('div');
        empty.className = 'kb-empty';
        empty.textContent = '没有找到「' + q + '」相关的知识点，换个关键词试试。';
        panel.appendChild(empty);
        cards.forEach(function (c) { c.hidden = false; });
      } else {
        results.forEach(function (d, idx) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'kb-result';
          btn.setAttribute('data-idx', idx);
          btn.innerHTML =
            '<span class="r-top"><span class="r-mod">' + esc(d.mod) + '</span>' +
            '<span class="r-title">' + mark(d.title, terms) + '</span></span>' +
            '<span class="r-snip">' + snippet(d, terms) + '</span>';
          btn.addEventListener('click', function () { jump(d); });
          panel.appendChild(btn);
        });
        var keep = results.map(function (d) { return d.el; });
        cards.forEach(function (c) { c.hidden = keep.indexOf(c) === -1; });
      }
      panel.hidden = false;

      if (countEl) countEl.textContent = results.length ? results.length + ' 条结果' : '无结果';
    }

    function jump(d) {
      panel.hidden = true;
      d.el.hidden = false;
      d.el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      d.el.classList.add('is-hit');
      setTimeout(function () { d.el.classList.remove('is-hit'); }, 2200);
      input.blur();
    }

    function moveActive(step) {
      var items = [].slice.call(panel.querySelectorAll('.kb-result'));
      if (!items.length) return;
      active = (active + step + items.length) % items.length;
      items.forEach(function (el, i) { el.classList.toggle('is-active', i === active); });
      items[active].scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('focus', function () { if (input.value.trim()) render(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
      else if (e.key === 'Enter') {
        var items = [].slice.call(panel.querySelectorAll('.kb-result'));
        if (active >= 0 && items[active]) { items[active].click(); }
        else if (results.length) { jump(results[0]); }
      } else if (e.key === 'Escape') {
        input.value = ''; render(''); input.blur();
      }
    });

    document.addEventListener('click', function (e) {
      if (!panel.hidden && !panel.contains(e.target) && e.target !== input) panel.hidden = true;
    });

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); input.focus(); input.select();
      }
    });

    /* 模块筛选 */
    var chips = [].slice.call(document.querySelectorAll('.chip[data-module]'));
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        chip.setAttribute('aria-pressed', 'true');
        filter = chip.getAttribute('data-module') || '';
        if (input.value.trim()) render(input.value);
        else applyFilter();
      });
    });

    applyFilter();
  }

  /* ---------- 技能条动画 ---------- */
  var bars = [].slice.call(document.querySelectorAll('.skill .bar i'));
  if (bars.length) {
    var animate = function () {
      bars.forEach(function (b) { b.style.width = (b.getAttribute('data-w') || 0) + '%'; });
    };
    if ('IntersectionObserver' in window) {
      var bo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { animate(); bo.disconnect(); }
        });
      }, { threshold: 0.3 });
      bo.observe(bars[0].closest('.skill-list') || bars[0]);
    } else { animate(); }
  }
})();
