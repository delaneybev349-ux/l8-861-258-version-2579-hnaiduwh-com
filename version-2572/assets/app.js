function qs(selector, root) {
  return (root || document).querySelector(selector);
}

function qsa(selector, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

function setupNavigation() {
  var toggle = qs('.nav-toggle');
  var nav = qs('.site-nav');
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open');
  });
}

function setupHero() {
  var slides = qsa('.hero-slide');
  var dots = qsa('.hero-dot');
  if (!slides.length || !dots.length) {
    return;
  }
  var index = 0;
  var timer;

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, pos) {
      slide.classList.toggle('active', pos === index);
    });
    dots.forEach(function (dot, pos) {
      dot.classList.toggle('active', pos === index);
    });
  }

  function start() {
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  dots.forEach(function (dot, pos) {
    dot.addEventListener('click', function () {
      window.clearInterval(timer);
      show(pos);
      start();
    });
  });

  show(0);
  start();
}

function setupFilters() {
  var inputs = qsa('[data-filter-input]');
  inputs.forEach(function (input) {
    var section = input.closest('section') || document;
    var area = qs('.filter-area', section) || document;
    var cards = qsa('[data-search]', area);
    var empty = qs('.no-results', section);

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !query || text.indexOf(query) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    });
  });
}

function initializeMoviePlayer(streamUrl) {
  var video = qs('#movie-video');
  var cover = qs('#play-cover');
  if (!video || !streamUrl) {
    return;
  }
  var ready = false;
  var hls;

  function bind() {
    if (ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    ready = true;
  }

  function play() {
    bind();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }
  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });
  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      play();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setupNavigation();
  setupHero();
  setupFilters();
});
