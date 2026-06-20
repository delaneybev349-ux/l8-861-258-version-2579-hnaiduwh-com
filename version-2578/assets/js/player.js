(function () {
  var video = document.querySelector('.player-video');
  var button = document.querySelector('.play-action');
  var layer = document.querySelector('.player-cover-layer');
  var holder = document.querySelector('.player-shell');

  if (!video || !button || !layer || !holder) {
    return;
  }

  var url = holder.getAttribute('data-media');
  var prepared = false;
  var hlsInstance = null;

  function prepare() {
    if (prepared || !url) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = url;
  }

  function start() {
    prepare();
    layer.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  button.addEventListener('click', start);
  layer.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
}());
