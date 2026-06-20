(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('nav-open');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('.hero-carousel');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var previous = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = parseInt(dot.getAttribute('data-slide-target'), 10);
        show(target);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.card-filter-input'));

    inputs.forEach(function (input) {
      var scope = input.closest('main') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .ranking-row'));
      var empty = null;

      if (!cards.length) {
        return;
      }

      function applyFilter() {
        var query = input.value.trim().toLowerCase();
        var visibleCount = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var visible = !query || text.indexOf(query) !== -1;

          card.classList.toggle('is-hidden-by-filter', !visible);

          if (visible) {
            visibleCount += 1;
          }
        });

        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'no-filter-result';
          empty.textContent = '没有找到匹配内容';
          var list = cards[0].parentElement;
          list.appendChild(empty);
        }

        empty.style.display = visibleCount ? 'none' : 'block';
      }

      input.addEventListener('input', applyFilter);

      var params = new URLSearchParams(window.location.search);
      var preset = params.get('q');

      if (preset && !input.value) {
        input.value = preset;
        applyFilter();
      }
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('.player-cover');
      var stream = shell.getAttribute('data-stream');
      var hlsInstance = null;

      if (!video || !cover || !stream) {
        return;
      }

      function bindStream() {
        if (video.getAttribute('src')) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegURL') || video.canPlayType('application/x-mpegURL')) {
          video.src = stream;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          return;
        }

        video.src = stream;
      }

      function startPlayback() {
        bindStream();
        shell.classList.add('is-playing');
        var result = video.play();

        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }

      cover.addEventListener('click', startPlayback);

      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  setupHero();
  setupFilters();
  setupPlayers();
})();
