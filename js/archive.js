/*
Credits: this script is shamelessly borrowed from
https://github.com/kitian616/jekyll-TeXt-theme
*/
function onTagSelect(isInit=false, name, targetName, query) {
  var setUrlQuery = (function () {
    var baseUrl = window.location.href.split('?')[0];
    return function (query) {
      if (typeof query === 'string') {
        window.history.replaceState(null, '', baseUrl + query);
      } else {
        window.history.replaceState(null, '', baseUrl);
      }
    };
  })();

  function init() {
    var i, index = 0;
    for (i = 0; i < $sections.length; i++) {
      sectionTopArticleIndex.push(index);
      index += $sections.eq(i).find('.item').length;
    }
    sectionTopArticleIndex.push(index);
  }

  function searchButtonsByTag(tag/*raw tag*/) {
    if (!tag) {
      return $tagShowAll;
    }
    var _buttons = $articleTags.filter('[data-' + name + '-encode="' + tag + '"]');
    if (_buttons.length === 0) {
      return $tagShowAll;
    }
    return _buttons;
  }

  function tagSelect(tag/*raw tag*/, target) {
    var result = {}, $articles;
    var i, j, k, _tag;

    for (i = 0; i < sectionArticles.length; i++) {
      $articles = sectionArticles[i];
      for (j = 0; j < $articles.length; j++) {
        if (tag === '' || tag === undefined) {
          result[i] || (result[i] = {});
          result[i][j] = true;
        } else {
          var tags = $articles.eq(j).data(name).split(',');
          for (k = 0; k < tags.length; k++) {
            if (tags[k] === tag) {
              result[i] || (result[i] = {});
              result[i][j] = true;
              break;
            }
          }
        }
      }
    }

    for (i = 0; i < sectionArticles.length; i++) {
      result[i] && $sections.eq(i).removeClass('d-none');
      result[i] || $sections.eq(i).addClass('d-none');
      for (j = 0; j < sectionArticles[i].length; j++) {
        if (result[i] && result[i][j]) {
          sectionArticles[i].eq(j).removeClass('d-none');
        } else {
          sectionArticles[i].eq(j).addClass('d-none');
        }
      }
    }

    hasInit || ($result.removeClass('d-none'), hasInit = true);

    if (target) {
      buttonFocus(searchButtonsByTag(tag));
      // buttonFocus(target);
      _tag = target.attr('data-' + name + '-encode');
      if (_tag === '' || typeof _tag !== 'string') {
        setUrlQuery();
      } else {
        setUrlQuery('?' + name + '=' + _tag);
      }
    } else {
      buttonFocus(searchButtonsByTag(tag));
    }
  }

  function onSelect(items) {
    $articleTags = items.find('.tag-button');
    $tagShowAll = items.find('.tag-button--all');
    // var $result = $('.js-result');
    $result = $('.template-4-select');
    $sections = $result.find('section');

    $sections.each(function () {
      sectionArticles.push($(this).find('.item'));
    });

    items.on('click', 'a', function() {   /* only change */
      tagSelect($(this).data(name + '-encode'), $(this));
      let tagTitle = this.title ? ' - ' + this.title : "";
      document.getElementById("intro-header-item").innerHTML = '<h3>' + name + tagTitle + '</h3>';
      window.onload = function() {
        $result = $('.template-4-select');
        $sections = $result.find('section');
        document.getElementById(htmlToVue).innerHTML = $sections;
      }
    });
  }

  var sectionArticles = [];
  var $articleTags;
  var $sections;
  var $result;
  var $tagShowAll;
  var hasInit;

  if (isInit) {
    // var $result = $('.js-result');
    var sectionTopArticleIndex = [];
    hasInit = false;
    window.onload = function() {
      if (name === 'tags') {
        onSelect($('.js-tags'));
      } else {
        onSelect($('.js-categories'));
      }
      init();
      tagSelect(targetName);
      document.getElementById("intro-header-item").innerHTML =
          '<h3>' + name + ' - ' + decodeURI(targetName).replace( /\+/g, ' ' ) + '</h3>';
    };
  } else {
    hasInit = true;
    if (name === 'tags') {
      $('.js-tags').off('click' );
      onSelect($('.js-tags'));
    } else {
      $('.js-categories').off('click');
      onSelect($('.js-categories'));
    }
  }
};

(function(){
   function queryString() {
     // This function is anonymous, is executed immediately and
     // the return value is assigned to QueryString!
     var i = 0, queryObj = {}, pair;
     var queryStr = window.location.search.substring(1);
     var queryArr = queryStr.split('&');
     for (i = 0; i < queryArr.length; i++) {
       pair = queryArr[i].split('=');
       // If first entry with this name
       if (typeof queryObj[pair[0]] === 'undefined') {
         queryObj[pair[0]] = pair[1];
         // If second entry with this name
       } else if (typeof queryObj[pair[0]] === 'string') {
         queryObj[pair[0]] = [queryObj[pair[0]], pair[1]];
         // If third or later entry with this name
       } else {
         queryObj[pair[0]].push(pair[1]);
       }
     }
     return queryObj;
   }

  window.buttonFocus = function (target) {
    if (target) {
      target.addClass('focus');
      window.lastFocusButton && !window.lastFocusButton.is(target) && window.lastFocusButton.removeClass('focus');
      window.lastFocusButton = target;
    }
  };

  var lastFocusButton = null;
  var query = queryString();
  query.tags && onTagSelect(true, 'tags', query.tags, query);
  query.categories && onTagSelect(true, 'categories', query.categories, query);
  (!query.tags && '/tags.html' === window.location.pathname) && buttonFocus($('.js-tags').find('.tag-button--all'));
  (!query.categories && '/categories.html' === window.location.pathname) && buttonFocus($('.js-categories').find('.tag-button--all'));
})();

export {
  onTagSelect
}
