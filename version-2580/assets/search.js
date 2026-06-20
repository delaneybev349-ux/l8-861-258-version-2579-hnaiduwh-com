(function () {
  var form = document.querySelector('[data-global-search]');
  var input = form ? form.querySelector('input[name="q"]') : null;
  var results = document.querySelector('[data-search-results]');
  var head = document.querySelector('[data-search-result-head]');
  var index = window.movieIndex || [];
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function render(items, query) {
    if (!results || !head) {
      return;
    }

    if (!query) {
      items = index.slice(0, 24);
      head.textContent = '热门推荐';
    } else if (items.length) {
      head.textContent = '找到 ' + items.length + ' 部相关影片';
    } else {
      head.textContent = '暂无匹配影片';
    }

    results.innerHTML = items.slice(0, 80).map(function (item) {
      return '<article class="search-result-card">' +
        '<a href="' + item.url + '"><img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '"></a>' +
        '<div><h2><a href="' + item.url + '">' + item.title + '</a></h2>' +
        '<p>' + item.text + '</p>' +
        '<div class="card-meta"><span>' + item.region + '</span><span>' + item.year + '</span><span>' + item.genre + '</span></div></div>' +
        '</article>';
    }).join('');
  }

  function search(query) {
    var key = normalize(query);
    var items = key ? index.filter(function (item) {
      return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.genre + ' ' + item.tags + ' ' + item.text).indexOf(key) !== -1;
    }) : index;
    render(items, key);
  }

  if (input) {
    input.value = initialQuery;
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value : '';
      var url = new URL(window.location.href);
      if (query.trim()) {
        url.searchParams.set('q', query.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
      search(query);
    });

    if (input) {
      input.addEventListener('input', function () {
        search(input.value);
      });
    }
  }

  search(initialQuery);
})();
