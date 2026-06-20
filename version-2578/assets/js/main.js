(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var opened = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showHero(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  var keywordInput = document.querySelector('[data-search-keyword]');

  if (q && keywordInput) {
    keywordInput.value = q;
  }

  var filterForm = document.querySelector('[data-filter-form]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var keyword = normalize(document.querySelector('[data-search-keyword]') && document.querySelector('[data-search-keyword]').value);
    var region = normalize(document.querySelector('[data-search-region]') && document.querySelector('[data-search-region]').value);
    var type = normalize(document.querySelector('[data-search-type]') && document.querySelector('[data-search-type]').value);
    var year = normalize(document.querySelector('[data-search-year]') && document.querySelector('[data-search-year]').value);

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre')
      ].join(' '));
      var ok = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        ok = false;
      }
      if (region && normalize(card.getAttribute('data-region')).indexOf(region) === -1) {
        ok = false;
      }
      if (type && normalize(card.getAttribute('data-type')).indexOf(type) === -1) {
        ok = false;
      }
      if (year && normalize(card.getAttribute('data-year')) !== year) {
        ok = false;
      }

      card.classList.toggle('hidden-card', !ok);
    });
  }

  if (filterForm) {
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards();
    });
    Array.prototype.slice.call(filterForm.querySelectorAll('input, select')).forEach(function (el) {
      el.addEventListener('input', filterCards);
      el.addEventListener('change', filterCards);
    });
    filterCards();
  }
}());
