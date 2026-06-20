(function () {
    var body = document.body;
    var navToggle = document.querySelector('[data-nav-toggle]');

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            body.classList.toggle('nav-open');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startAuto() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startAuto();
            });
        });

        if (slides.length > 1) {
            startAuto();
        }
    }

    function getRootPrefix() {
        var path = window.location.pathname;
        if (path.indexOf('/movies/') !== -1 || path.indexOf('/category/') !== -1 || path.indexOf('/region/') !== -1 || path.indexOf('/type/') !== -1 || path.indexOf('/year/') !== -1 || path.indexOf('/catalog/') !== -1) {
            return '../';
        }
        return '';
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function searchMovies(query) {
        var keyword = normalize(query);
        if (!keyword || !window.MOVIE_DATA) {
            return [];
        }
        return window.MOVIE_DATA.filter(function (movie) {
            var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.category].join(' ');
            return normalize(text).indexOf(keyword) !== -1;
        }).slice(0, 12);
    }

    function resultHtml(movie, prefix) {
        var poster = prefix + movie.poster;
        return [
            '<a class="instant-result" href="' + prefix + movie.url + '">',
            '<span class="instant-result__poster" style="--poster-image: url(\'' + poster + '\');"></span>',
            '<span>',
            '<h4>' + escapeHtml(movie.title) + '</h4>',
            '<p>' + escapeHtml([movie.region, movie.year, movie.genre].filter(Boolean).join(' · ')) + '</p>',
            '</span>',
            '</a>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    var searchForms = Array.prototype.slice.call(document.querySelectorAll('.global-search'));

    searchForms.forEach(function (form) {
        var input = form.querySelector('input[type="search"]');
        var box = form.querySelector('.instant-results');
        var prefix = getRootPrefix();

        if (!input || !box) {
            return;
        }

        input.addEventListener('input', function () {
            var results = searchMovies(input.value);
            if (!results.length) {
                box.classList.remove('is-open');
                box.innerHTML = '';
                return;
            }
            box.innerHTML = results.map(function (movie) {
                return resultHtml(movie, prefix);
            }).join('');
            box.classList.add('is-open');
        });

        document.addEventListener('click', function (event) {
            if (!form.contains(event.target)) {
                box.classList.remove('is-open');
            }
        });
    });

    var pageInput = document.getElementById('search-page-input');
    var pageResults = document.getElementById('search-results');
    var pageTitle = document.getElementById('search-result-title');
    var sortSelect = document.getElementById('search-sort');

    if (pageInput && pageResults && window.MOVIE_DATA) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        pageInput.value = initialQuery;

        function cardHtml(movie) {
            var poster = movie.poster;
            var tags = String(movie.tags || '').split(/[,，/、\s]+/).filter(Boolean).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return [
                '<article class="movie-card">',
                '<a class="movie-card__poster" href="' + movie.url + '" style="--poster-image: url(\'' + poster + '\');">',
                '<img src="' + poster + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy" onerror="this.classList.add(\'media-hidden\');">',
                '<span class="movie-card__year">' + escapeHtml(movie.year) + '</span>',
                '<span class="movie-card__play">播放</span>',
                '</a>',
                '<div class="movie-card__body">',
                '<div class="movie-card__meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                '<p>' + escapeHtml(movie.oneLine) + '</p>',
                '<div class="tag-row">' + tags + '</div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function renderSearchPage() {
            var query = pageInput.value.trim();
            var results = query ? searchMovies(query) : window.MOVIE_DATA.slice(0, 24);
            var sortMode = sortSelect ? sortSelect.value : 'default';

            if (sortMode === 'newest') {
                results = results.slice().sort(function (a, b) {
                    return (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0);
                });
            }

            if (sortMode === 'title') {
                results = results.slice().sort(function (a, b) {
                    return String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hans-CN');
                });
            }

            pageTitle.textContent = query ? '搜索结果' : '推荐片单';
            pageResults.innerHTML = results.map(cardHtml).join('');
        }

        pageInput.addEventListener('input', renderSearchPage);
        if (sortSelect) {
            sortSelect.addEventListener('change', renderSearchPage);
        }
        renderSearchPage();
    }
})();
