(function () {
  var SB_URL = 'https://btulhnrguotqjkhyeazk.supabase.co';
  var SB_KEY = window.KT_SB_KEY || '';

  var SAMPLE = ['/assets/sample-1.mp4', '/assets/sample-2.mp4', '/assets/sample-3.mp4'];
  var SEED_VIDEOS = [
    { src: SAMPLE[0], name: 'Barath \u2019s Family', place: 'Phuket' },
    { src: SAMPLE[1], name: 'Achu & Liya', place: 'Krabi' },
    { src: SAMPLE[2], name: 'Nakul & Subree', place: 'Pattaya' }
  ];
  var SEED_REVIEWS = [
    { name: 'Janani Jaaz', rating: 5, place: 'Phuket', created_at: '2026-07-01', text: 'An unforgettable family vacation \u2014 every transfer on time and the team was amazing throughout!', photos: [] },
    { name: 'Rashmi Rajan', rating: 5, place: 'Bangkok', created_at: '2026-06-29', text: 'Our very first international trip. Kairali made it memorable and completely stress-free.', photos: [] },
    { name: 'Bharath K', rating: 5, place: 'Phi Phi', created_at: '2026-06-22', text: 'Phuket with kids was seamless. The Phi Phi speedboat day was the highlight of our year.', photos: [] },
    { name: 'Achu & Liya', rating: 5, place: 'Krabi', created_at: '2026-06-15', text: 'Dreamy honeymoon! The sunset cruise and the little surprises made it perfect.', photos: [] }
  ];
  var AVC = ['#0496a5', '#3aa76d', '#f3792a', '#8a5cf6', '#e0567a'];

  function esc(s) { return (s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function stars(n) { return '\u2605'.repeat(n) + '<span style="color:#dfe7e9">' + '\u2605'.repeat(5 - n) + '</span>'; }

  var modal;
  function ensureModal() {
    if (modal) return;
    modal = document.createElement('div'); modal.className = 'kt-modal';
    modal.innerHTML = '<button class="x">\u00d7</button><div class="bd"></div>';
    document.body.appendChild(modal);
    modal.querySelector('.x').onclick = function () { modal.classList.remove('on'); modal.querySelector('.bd').innerHTML = ''; };
    modal.onclick = function (e) { if (e.target === modal) modal.querySelector('.x').onclick(); };
  }
  function showImg(u) { ensureModal(); modal.querySelector('.bd').innerHTML = '<img src="' + u + '">'; modal.classList.add('on'); }
  function showVideo(src) { ensureModal(); modal.querySelector('.bd').innerHTML = '<video src="' + src + '" controls autoplay playsinline></video>'; modal.classList.add('on'); }

  /* ---------------- VIDEO ROW: auto-drift + drag + tap-to-toggle-sound + view ---------------- */
  function renderVideos(vids) {
    var track = document.getElementById('vtestTrack'); if (!track || !vids.length) return;
    var set = vids.concat(vids);
    track.innerHTML = set.map(function (v, i) {
      var idx = i % vids.length;
      return '<div class="vt-c" data-i="' + idx + '"><video src="' + v.src + '" muted loop playsinline preload="metadata"></video>' +
        '<div class="snd">\uD83D\uDD07</div>' +
        '<button class="vview" aria-label="view">\u26F6</button>' +
        '<div class="m"><div class="vn">' + esc(v.name) + '</div></div></div>';
    }).join('');
    var row = track.parentNode;
    var cards = [].slice.call(track.querySelectorAll('.vt-c'));
    var vels = cards.map(function (c) { return c.querySelector('video'); });
    var x = 0, half = 0, drag = false, moved = false, sx = 0, sy = 0, soff = 0, axis = 0, soundOn = false, onScreen = false;
    function measure() { half = track.scrollWidth / 2; }
    setTimeout(measure, 400); window.addEventListener('resize', measure);
    function playVisible() { if (!onScreen) return; vels.forEach(function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }); }
    function pauseAll() { vels.forEach(function (v) { v.pause(); }); }
    function tap(card) {
      var v = card.querySelector('video');
      if (v.muted) {
        cards.forEach(function (cc) { cc.querySelector('video').muted = true; cc.classList.remove('live'); cc.querySelector('.snd').textContent = '\uD83D\uDD07'; });
        v.muted = false; v.play(); card.classList.add('live'); card.querySelector('.snd').textContent = '\uD83D\uDD0A'; soundOn = true;
      } else { v.muted = true; card.classList.remove('live'); card.querySelector('.snd').textContent = '\uD83D\uDD07'; soundOn = false; }
    }
    cards.forEach(function (card) { card.querySelector('.vview').addEventListener('click', function (e) { e.stopPropagation(); showVideo(card.querySelector('video').src); }); });
    row.addEventListener('pointerdown', function (e) { drag = true; moved = false; axis = 0; sx = e.clientX; sy = e.clientY; soff = x; });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (axis === 0) { // decide gesture direction once
        if (Math.abs(dx) > 7 || Math.abs(dy) > 7) { axis = Math.abs(dx) > Math.abs(dy) ? 1 : -1; if (axis === -1) { drag = false; return; } row.classList.add('drag'); } else return;
      }
      moved = true; if (e.cancelable) e.preventDefault(); x = soff + dx; apply();
    }, { passive: false });
    window.addEventListener('pointerup', function (e) {
      if (!drag) return; drag = false; row.classList.remove('drag');
      if (!moved) { var c = e.target.closest('.vt-c'); if (c && !e.target.closest('.vview')) tap(c); }
    });
    function apply() { if (half) { if (x <= -half) x += half; if (x > 0) x -= half; } track.style.transform = 'translateX(' + x + 'px)'; }
    function tick() { if (onScreen && !drag && !soundOn && half) { x -= 0.35; apply(); } requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
    new IntersectionObserver(function (es) { es.forEach(function (e) { onScreen = e.isIntersecting; if (onScreen) playVisible(); else pauseAll(); }); }, { threshold: 0.2 }).observe(row);
  }

  /* ---------------- REVIEWS: tilted marquee plane ---------------- */
  function renderSummary(list) {
    var el = document.getElementById('rvwSummary'); if (!el) return;
    var n = list.length, avg = n ? list.reduce(function (a, r) { return a + r.rating; }, 0) / n : 0;
    var dist = [5, 4, 3, 2, 1].map(function (s) { return n ? Math.round(list.filter(function (r) { return r.rating === s; }).length / n * 100) : 0; });
    el.innerHTML = '<div class="big"><b>' + avg.toFixed(1) + '</b> <span class="s">\u2605</span><small>' + n + ' review' + (n === 1 ? '' : 's') + '</small></div>' +
      '<div class="rvw-bars">' + [5, 4, 3, 2, 1].map(function (s, k) { return '<div class="rvw-bar"><span>' + s + ' \u2605</span><div class="track"><div class="fill" style="width:' + dist[k] + '%"></div></div></div>'; }).join('') + '</div>';
  }
  function reviewCard(r, i) {
    var strip = (r.photos && r.photos.length) ? '<div class="strip">' + r.photos.map(function (u) { return '<img src="' + u + '" data-full="' + u + '" alt="traveller photo">'; }).join('') + '</div>' : '';
    return '<div class="rev"><div class="who"><div class="av" style="background:' + AVC[i % AVC.length] + '">' + esc((r.name || '?')[0].toUpperCase()) + '</div>' +
      '<div><div class="nm">' + esc(r.name) + '</div><div class="st">' + stars(r.rating) + '</div>' +
      '<div class="date">\uD83D\uDCCD ' + esc(r.place || '') + '</div></div></div><p>' + esc(r.text) + '</p>' + strip + '</div>';
  }
  function renderReviews(list) {
    var track = document.getElementById('rvwTrack'); if (!track) return;
    var wrap = track.closest('.rtilt');
    if (!list.length) { if (wrap) wrap.innerHTML = '<div style="text-align:center;color:#5a9aa5;padding:24px">No reviews yet \u2014 be the first to share your trip!</div>'; return; }
    var cards = list.concat(list); // duplicate for seamless loop
    track.innerHTML = cards.map(reviewCard).join('');
    track.querySelectorAll('.strip img').forEach(function (im) { im.onclick = function (e) { e.stopPropagation(); showImg(im.dataset.full); }; });
    var x = 0, half = 0, drag = false, sx = 0, sy = 0, soff = 0, axis = 0, onScreen = false;
    function measure() { half = track.scrollWidth / 2; }
    setTimeout(measure, 400); window.addEventListener('resize', measure);
    wrap.addEventListener('pointerdown', function (e) { drag = true; axis = 0; sx = e.clientX; sy = e.clientY; soff = x; });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (axis === 0) { if (Math.abs(dx) > 7 || Math.abs(dy) > 7) { axis = Math.abs(dx) > Math.abs(dy) ? 1 : -1; if (axis === -1) { drag = false; return; } } else return; }
      if (e.cancelable) e.preventDefault(); x = soff + dx; ap();
    }, { passive: false });
    window.addEventListener('pointerup', function () { drag = false; });
    function ap() { if (half) { if (x <= -half) x += half; if (x > 0) x -= half; } track.style.transform = 'translateX(' + x + 'px)'; }
    function tick() { if (onScreen && !drag && half) { x -= 0.3; ap(); } requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
    new IntersectionObserver(function (es) { es.forEach(function (e) { onScreen = e.isIntersecting; }); }, { threshold: 0.1 }).observe(wrap);
  }

  /* ---------------- LOAD ---------------- */
  function render(videos, reviews) { renderVideos(videos); renderSummary(reviews); renderReviews(reviews); }
  function sbGet(path) { return fetch(SB_URL + '/rest/v1/' + path, { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } }).then(function (r) { return r.json(); }); }

  if (SB_KEY) {
    Promise.all([
      sbGet('testimonials?select=*&order=created_at.desc').catch(function () { return null; }),
      sbGet('reviews_vn?approved=eq.true&order=created_at.desc&limit=20').catch(function () { return null; })
    ]).then(function (res) {
      var vids = (res[0] && res[0].length) ? res[0].map(function (t) { return { src: t.video_url, name: t.name, place: t.place }; }) : SEED_VIDEOS;
      var revs = (res[1] && res[1].length) ? res[1] : SEED_REVIEWS;
      render(vids, revs);
    });
  } else {
    render(SEED_VIDEOS, SEED_REVIEWS);
  }
})();
