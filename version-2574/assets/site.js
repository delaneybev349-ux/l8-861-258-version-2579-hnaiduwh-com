(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var filterInput = document.querySelector('[data-filter-input]');

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function filterCards(value) {
    var keyword = normalize(value);
    document.querySelectorAll('[data-movie-card]').forEach(function (card) {
      var text = normalize(card.getAttribute('data-search') || card.textContent);
      card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
    });
  }

  if (filterInput) {
    if (query) {
      filterInput.value = query;
      filterCards(query);
    }
    filterInput.addEventListener('input', function () {
      filterCards(filterInput.value);
    });
  }

  document.querySelectorAll('.video-shell').forEach(function (shell) {
    var video = shell.querySelector('video[data-src]');
    var button = shell.querySelector('.play-overlay');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !button) {
      return;
    }

    function loadVideo() {
      var source = video.getAttribute('data-src');
      if (loaded || !source) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function startVideo() {
      loadVideo();
      shell.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', startVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
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
})();
