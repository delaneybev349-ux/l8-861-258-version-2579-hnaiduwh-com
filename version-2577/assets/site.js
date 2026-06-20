(function () {
  var mobileToggle = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileToggle.textContent = isOpen ? '×' : '☰';
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var heroIndex = 0;

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });
    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  heroDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-target')) || 0);
    });
  });

  if (heroSlides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-category'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function applyFilters(scope) {
    var fields = Array.prototype.slice.call(scope.querySelectorAll('.filter-field'));
    var grid = scope.parentElement.querySelector('.filter-scope') || document.querySelector('.filter-scope');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var values = {};
    fields.forEach(function (field) {
      values[field.getAttribute('data-filter-key')] = field.value.trim().toLowerCase();
    });
    var visible = 0;
    cards.forEach(function (card) {
      var keyword = values.keyword || '';
      var year = values.year || '';
      var region = values.region || '';
      var type = values.type || '';
      var matches = true;
      if (keyword && textOf(card).indexOf(keyword) === -1) {
        matches = false;
      }
      if (year && (card.getAttribute('data-year') || '').toLowerCase() !== year) {
        matches = false;
      }
      if (region && (card.getAttribute('data-region') || '').toLowerCase() !== region) {
        matches = false;
      }
      if (type && (card.getAttribute('data-type') || '').toLowerCase() !== type) {
        matches = false;
      }
      card.style.display = matches ? '' : 'none';
      if (matches) {
        visible += 1;
      }
    });
    var empty = scope.parentElement.querySelector('.empty-state');
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.filter-panel')).forEach(function (panel) {
    Array.prototype.slice.call(panel.querySelectorAll('.filter-field')).forEach(function (field) {
      field.addEventListener('input', function () {
        applyFilters(panel);
      });
      field.addEventListener('change', function () {
        applyFilters(panel);
      });
    });
  });

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function renderSearch() {
    var results = document.getElementById('search-results');
    var recommend = document.getElementById('search-recommend');
    var title = document.getElementById('search-title');
    if (!results || !window.SEARCH_ITEMS) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var items = window.SEARCH_ITEMS;
    var matched = query ? items.filter(function (item) {
      return [item.title, item.region, item.type, item.year, item.genre, item.category, item.oneLine, (item.tags || []).join(' ')].join(' ').toLowerCase().indexOf(query) !== -1;
    }).slice(0, 120) : [];

    if (title) {
      title.textContent = query ? '搜索：' + params.get('q') : '热门推荐';
    }
    if (!query) {
      results.innerHTML = '';
      if (recommend) {
        recommend.style.display = '';
      }
      return;
    }
    if (recommend) {
      recommend.style.display = 'none';
    }
    results.innerHTML = matched.map(function (item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + escapeHtml(item.url) + '">' +
        '<img class="poster-image" src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.style.opacity = \'0\';">' +
        '<span class="poster-gradient"></span>' +
        '<span class="poster-year">' + escapeHtml(item.year) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<a class="card-title" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>' +
        '<p class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</p>' +
        '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }).join('');

    if (!matched.length) {
      results.innerHTML = '<p class="empty-state is-visible">没有匹配的影片</p>';
    }
  }

  renderSearch();
})();
