import { H as Hls } from './hls.js';

function initPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.video-overlay');
    var source = shell.getAttribute('data-video-src');
    var hlsInstance = null;

    if (!video || !overlay || !source) {
        return;
    }

    function attachSource() {
        if (video.getAttribute('data-ready') === 'true') {
            return Promise.resolve();
        }

        video.setAttribute('data-ready', 'true');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return Promise.resolve();
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return Promise.resolve();
        }

        video.src = source;
        return Promise.resolve();
    }

    function playVideo() {
        overlay.classList.add('is-hidden');
        attachSource().then(function () {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        });
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
            overlay.classList.remove('is-hidden');
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(initPlayer);
