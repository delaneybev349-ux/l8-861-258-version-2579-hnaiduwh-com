(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupImages() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
            });
        });
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!isOpen));
            panel.hidden = isOpen;
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    function setupFilters() {
        var forms = document.querySelectorAll("[data-local-filter], [data-search-filter]");
        forms.forEach(function (form) {
            var input = form.querySelector("[data-filter-input]");
            var typeSelect = form.querySelector("[data-filter-type]");
            var channelSelect = form.querySelector("[data-filter-channel]");
            var list = document.querySelector("[data-filter-list]");
            var emptyState = document.querySelector("[data-empty-state]");
            if (!list) {
                return;
            }
            var params = new URLSearchParams(window.location.search);
            if (input && params.get("q")) {
                input.value = params.get("q");
            }

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var type = normalize(typeSelect ? typeSelect.value : "");
                var channel = normalize(channelSelect ? channelSelect.value : "");
                var visible = 0;
                list.querySelectorAll("[data-search-item]").forEach(function (item) {
                    var text = normalize([
                        item.getAttribute("data-title"),
                        item.getAttribute("data-region"),
                        item.getAttribute("data-type"),
                        item.getAttribute("data-genre"),
                        item.getAttribute("data-channel"),
                        item.textContent
                    ].join(" "));
                    var itemType = normalize(item.getAttribute("data-type"));
                    var itemChannel = normalize(item.getAttribute("data-channel"));
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchType = !type || itemType.indexOf(type) !== -1;
                    var matchChannel = !channel || itemChannel === channel;
                    var show = matchKeyword && matchType && matchChannel;
                    item.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });
                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            }

            form.addEventListener("input", apply);
            form.addEventListener("change", apply);
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
            apply();
        });
    }

    window.SitePlayer = {
        init: function (options) {
            var video = document.getElementById(options.videoId);
            var overlay = document.getElementById(options.overlayId);
            var source = options.source;
            var attached = false;
            var hls = null;

            if (!video || !overlay || !source) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }
                attached = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    });
                } else {
                    video.src = source;
                }
            }

            function start() {
                overlay.classList.add("is-hidden");
                attach();
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        overlay.classList.remove("is-hidden");
                    });
                }
            }

            overlay.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                overlay.classList.add("is-hidden");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    overlay.classList.remove("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    };

    ready(function () {
        setupImages();
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
