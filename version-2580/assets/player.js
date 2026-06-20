(function () {
  var configElement = document.getElementById('video-config');
  var video = document.querySelector('[data-video]');
  var button = document.querySelector('[data-player-start]');
  var shell = document.querySelector('[data-player]');
  var mediaUrl = '';
  var hlsInstance = null;
  var attached = false;

  if (!configElement || !video) {
    return;
  }

  try {
    mediaUrl = JSON.parse(configElement.textContent).src || '';
  } catch (error) {
    mediaUrl = '';
  }

  function attach() {
    if (attached || !mediaUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaUrl;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(mediaUrl);
      hlsInstance.attachMedia(video);
      attached = true;
      return;
    }

    video.src = mediaUrl;
    attached = true;
  }

  function start() {
    attach();
    if (button) {
      button.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  if (shell) {
    shell.addEventListener('click', function (event) {
      if (event.target === shell) {
        start();
      }
    });
  }

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
