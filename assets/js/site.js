/* Luminous Host Solutions — interactions.
   Everything here is an enhancement. With JavaScript off, or with
   prefers-reduced-motion on, the page is a complete static document. */
(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------- header + mobile menu (run on every page) ---------- */
  var header = document.querySelector('[data-header]');
  var filmEl = document.querySelector('[data-film]');
  function onScroll() {
    if (!header) return;
    // Over the opening film the header stays clear so the photograph fills the screen.
    var limit = filmEl && root.classList.contains('motion') ? filmEl.offsetTop + filmEl.offsetHeight - header.offsetHeight : 12;
    header.classList.toggle('is-scrolled', window.scrollY > limit);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.addEventListener('click', function (event) {
    var menu = document.querySelector('.nav-mobile');
    if (!menu || !menu.open) return;
    var target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    if (target.closest('.nav-mobile-panel a')) { menu.open = false; return; }
    if (!target.closest('.nav-mobile')) menu.open = false;
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var menu = document.querySelector('.nav-mobile');
    if (menu && menu.open) {
      menu.open = false;
      var summary = menu.querySelector('summary');
      if (summary) summary.focus();
    }
  });

  /* ---------- motion ---------- */
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger || !root.classList.contains('motion')) {
    root.classList.remove('motion'); // fall back to the static layout
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var mm = gsap.matchMedia();
  var DESKTOP = '(min-width: 62rem)';
  // ?qa removes scrub smoothing so automated checks can read exact positions.
  var QA = /[?&]qa\b/.test(location.search);
  function sm(v) { return QA ? true : v; }

  /* ===== 1. Opening film: hero window opens into a walk through the property ===== */
  var film = document.querySelector('[data-film]');
  if (film) {
    mm.add({ desktop: DESKTOP, mobile: '(max-width: 61.99rem)' }, function (ctx) {
      var desktop = ctx.conditions.desktop;
      var stage = film.querySelector('[data-film-stage]');
      var frame = film.querySelector('[data-film-frame]');
      var scenes = gsap.utils.toArray('[data-scene]', film);
      var imgs = scenes.map(function (s) { return s.querySelector('.scene__img'); });
      var pics = scenes.map(function (s) { return s.querySelector('img, video'); });
      var caps = scenes.map(function (s) { return s.querySelector('.scene__cap'); });
      var rail = film.querySelector('[data-film-rail]');
      var railItems = gsap.utils.toArray('li', rail);
      var hero = film.querySelector('.hero');
      var hint = film.querySelector('[data-film-hint]');

      var clipStart = getComputedStyle(frame).getPropertyValue('--clip-start').trim();
      var clipEnd = clipStart.replace(/[\d.]+/g, '0');
      // How each later scene arrives: rising from below, sliding in from the right, opening from the centre.
      var wipes = [null, 'inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 100%)', 'inset(50% 50% 50% 50%)'];
      var OPEN = 'inset(0% 0% 0% 0%)';

      // Timeline units: 0–1 the window opens; each scene then holds for ~1.6.
      var HOLD = 1.6, T0 = 1;
      var sceneStart = scenes.map(function (_, i) { return i === 0 ? 0 : T0 + i * HOLD - 0.35; });
      var total = T0 + scenes.length * HOLD;

      function setActive(i) {
        railItems.forEach(function (li, n) { li.classList.toggle('is-active', n === i); });
      }

      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage, start: 'top top',
          end: function () { return '+=' + window.innerHeight * (desktop ? 4.6 : 3.8); },
          pin: true, scrub: sm(0.7), anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: function (self) {
            var t = self.progress * total, active = -1;
            if (t > 0.8) { active = 0; for (var i = 1; i < scenes.length; i++) if (t >= sceneStart[i] + 0.3) active = i; }
            setActive(active);
          }
        }
      });

      // The hero copy leaves, the window opens to the full viewport.
      tl.to(hero, { autoAlpha: 0, y: desktop ? -60 : -40, duration: 0.55, ease: 'power1.in' }, 0)
        .to(hint, { autoAlpha: 0, duration: 0.2 }, 0)
        .fromTo(frame, { clipPath: clipStart }, { clipPath: clipEnd, duration: 1, ease: 'power2.inOut' }, 0)
        .fromTo(pics[0],
          { x: function () { return desktop ? window.innerWidth * 0.25 : 0; }, y: function () { return window.innerHeight * (desktop ? 0.035 : 0.2875); }, scale: desktop ? 0.8 : 0.92 },
          { x: 0, y: 0, scale: 1, duration: 1, ease: 'power2.inOut' }, 0)
        .fromTo(imgs[0], { '--scrim': 0 }, { '--scrim': 1, duration: 0.4 }, 0.6)
        .to(rail, { autoAlpha: 1, duration: 0.3 }, 0.8);

      scenes.forEach(function (scene, i) {
        var start = sceneStart[i], capIn = i === 0 ? 0.85 : start + 0.45;
        var end = i === scenes.length - 1 ? total : sceneStart[i + 1];
        if (i > 0) {
          // The next room wipes in while its photograph settles from a closer framing.
          tl.fromTo(imgs[i], { clipPath: wipes[i] }, { clipPath: OPEN, duration: 0.7, ease: 'power2.inOut' }, start)
            .fromTo(pics[i], { scale: 1.22 }, { scale: 1.04, duration: end - start + 0.7 }, start);
        } else {
          // A slow push-in for as long as the bedroom holds.
          tl.to(pics[0], { scale: 1.1, duration: end - 1 + 0.7 }, 1);
        }
        var lines = caps[i].children;
        tl.fromTo(lines, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', immediateRender: i === 0 }, capIn);
        if (i < scenes.length - 1) {
          tl.fromTo(lines, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -24, duration: 0.3, ease: 'power1.in', immediateRender: false }, end - 0.3);
        }
      });
      // Let the last scene breathe before the page releases, and keep the
      // timeline exactly `total` long so the rail maps cleanly to scenes.
      tl.to({}, { duration: 0.01 }, total);
      total = tl.duration();

      return function () { setActive(-1); };
    });
  }

  /* ===== 2. Quiet reveals for text ===== */
  var revealEls = gsap.utils.toArray('[data-reveal]');
  if (revealEls.length && !QA) {
    gsap.set(revealEls, { autoAlpha: 0, y: 26 });
    ScrollTrigger.batch(revealEls, {
      start: 'top 88%', once: true,
      onEnter: function (batch) {
        gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.09, overwrite: true });
      }
    });
  }

  /* ===== 3. Photographs uncover from below while easing back ===== */
  if (!QA) gsap.utils.toArray('[data-img]').forEach(function (fig) {
    var img = fig.querySelector('img');
    gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 85%', once: true } })
      .fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power3.inOut' }, 0)
      .fromTo(img, { scale: 1.25 }, { scale: 1.06, duration: 1.6, ease: 'power3.out' }, 0);
    // then a slow drift inside the frame while it crosses the viewport
    gsap.fromTo(img, { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ===== 4. How it works: the line draws, the steps arrive on it ===== */
  var howLine = document.querySelector('[data-how-line]');
  if (howLine) {
    mm.add({ desktop: DESKTOP, mobile: '(max-width: 61.99rem)' }, function (ctx) {
      var d = ctx.conditions.desktop;
      var steps = gsap.utils.toArray('[data-step]');
      var prop = d ? 'scaleX' : 'scaleY';
      var from = {}; from[prop] = 0; var to = { ease: 'none' }; to[prop] = 1;
      to.scrollTrigger = { trigger: '.how__track', start: d ? 'top 78%' : 'top 70%', end: d ? 'top 30%' : 'bottom 60%', scrub: sm(0.6) };
      gsap.fromTo(howLine, from, to);
      steps.forEach(function (step, i) {
        if (!QA) gsap.fromTo(step, { autoAlpha: 0, y: 30 }, {
          autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: d ? i * 0.14 : 0,
          scrollTrigger: { trigger: d ? '.how__track' : step, start: d ? 'top 72%' : 'top 85%', once: true }
        });
      });
    });
  }

  /* ===== 5. About: the pull line drifts across ===== */
  var pull = document.querySelector('[data-pull]');
  if (pull) {
    gsap.fromTo(pull, { xPercent: 8 }, { xPercent: -22, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: sm(0.8) } });
  }

  /* ===== 6. Our work: vertical scroll carries the gallery sideways (desktop) ===== */
  var work = document.querySelector('[data-work]');
  if (work) {
    mm.add(DESKTOP, function () {
      var pin = work.querySelector('[data-work-pin]');
      var track = work.querySelector('[data-work-track]');
      var bar = work.querySelector('[data-work-bar]');
      var count = work.querySelector('[data-work-count]');
      var shots = gsap.utils.toArray('.shot', track);
      var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };

      var move = gsap.to(track, {
        x: function () { return -distance(); }, ease: 'none',
        scrollTrigger: {
          trigger: pin, start: 'top top', end: function () { return '+=' + distance(); },
          pin: true, scrub: sm(0.6), anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: function (self) {
            gsap.set(bar, { scaleX: self.progress });
            var n = Math.min(shots.length, Math.floor(self.progress * shots.length) + 1);
            count.textContent = (n < 10 ? '0' : '') + n;
          }
        }
      });
      // Each photograph slides slightly inside its own frame as it travels: depth without gimmicks.
      shots.forEach(function (shot) {
        var img = shot.querySelector('img');
        gsap.fromTo(img, { objectPosition: '35% 50%' }, {
          objectPosition: '65% 50%', ease: 'none',
          scrollTrigger: { containerAnimation: move, trigger: shot, start: 'left right', end: 'right left', scrub: true }
        });
      });
      // Keyboard users who tab into the strip still get native scrolling.
      return function () { gsap.set(track, { clearProps: 'transform' }); };
    });
  }

  /* ===== 7. Area: the two place names slide toward each other ===== */
  var areaTitle = document.querySelector('[data-area-title]');
  if (areaTitle) {
    var parts = areaTitle.querySelectorAll('span:not(.area__amp)');
    var st = { trigger: areaTitle, start: 'top bottom', end: 'bottom top', scrub: sm(0.8) };
    gsap.fromTo(parts[0], { xPercent: -10 }, { xPercent: 4, ease: 'none', scrollTrigger: st });
    gsap.fromTo(parts[1], { xPercent: 10 }, { xPercent: -4, ease: 'none', scrollTrigger: st });
  }

  /* Recalculate once fonts and images have settled. */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
