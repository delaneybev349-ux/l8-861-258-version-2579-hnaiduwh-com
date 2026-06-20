function setupMoviePlayer(streamUrl, videoId, overlayId, buttonId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var button = document.getElementById(buttonId);
  var started = false;
  var hlsInstance = null;

  if (!video || !overlay || !button) {
    return;
  }

  function playVideo() {
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  function start() {
    overlay.classList.add('is-hidden');
    if (started) {
      playVideo();
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      playVideo();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      return;
    }
    video.src = streamUrl;
    playVideo();
  }

  button.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    start();
  });

  overlay.addEventListener('click', function () {
    start();
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
