'use strict';

// generic http request function
var r = function r(url) {
  return new Promise(function (resolve, reject) {
    var req = new window.XMLHttpRequest();
    req.onreadystatechange = function () {
      if (req.readyState === 4 && req.status === 200) {
        resolve(JSON.parse(req.responseText));
      }
    };
    req.open('GET', url, true);
    req.send();
  });
};

var numericKeys = function numericKeys(obj) {
  return Object.keys(obj).filter(function (key) {
    if (typeof obj[key] === 'number') {
      return true;
    }
    return false;
  });
};

var add = function add(a, b) {
  return a + b;
};

var wrap = function wrap(el) {
  return function (html) {
    return '<' + el + '>' + html + '</' + el + '>';
  };
};

var showFont = function showFont(font) {
  return '\n    <span onclick="showDistances(window.analysis[\'' + font.name + '\'])" style="font-family: \'' + font.name + '\';" id="' + font.name + '">\n      ' + font.name + ' [ A O M N x l i ]\n    </span>';
};

var ib = function ib(el) {
  return '<span style="display: inline-block; width: 200px; height: 1.2em; overflow-x: hidden">' + el + '</span>';
};

var showDistance = function showDistance(distance) {
  if (distance.distance) {
    return showFont(distance.a) + ' and ' + showFont(distance.b);
  }
  return '';
};

var showDistances = function showDistances(font) {
  var html = Object.keys(font.distances).map(function (otherFontName) {
    return {
      a: font,
      b: window.analysis[otherFontName],
      distance: font.distances[otherFontName]
    };
  }).sort(function (a, b) {
    if (a.distance === b.distance) return 0;
    if (b.distance === null || a.distance > b.distance) return 1;
    if (a.distance === null || a.distance < b.distance) return -1;
    return 0;
  }).map(showDistance).map(wrap('div')).reduce(add);
  document.getElementById('distances').innerHTML = '\n    <p>most similar</p>\n    ' + html + '\n    </p>most different</p>';
};

var fontFace = function fontFace(font) {
  return '\n  @font-face {\n    font-family: "' + font.name + '";\n    src: url("' + font.fontUrl + '")\n  }';
};

var fontRow = function fontRow(font) {
  return '\n    <tr>\n      <td>' + showFont(font) + '</td>\n      <td>' + font.xHeight + '</td>\n      <td>' + font.contrast + '</td>\n      <td>' + font.widthRatio + '</td>\n      <td>' + font.widthVariance + '</td>\n    </tr>';
};

var fontTable = function fontTable(rows) {
  return '\n    <table>\n      <tr>\n        <th onclick="sort(\'font\')">font</th>\n        <th onclick="sort(\'xHeight\')">x height</th>\n        <th onclick="sort(\'contrast\')">contrast</th>\n        <th onclick="sort(\'widthRatio\')">width ratio</th>\n        <th onclick="sort(\'widthVariance\')">width variance</th>\n      </tr>\n      ' + rows + '\n    </table>';
};

r('analysis.json').then(function (analysis) {
  window.analysis = analysis;
  var fonts = Object.keys(analysis).map(function (key) {
    return analysis[key];
  });
  window.dataWhatevers = numericKeys(fonts[0]);

  var style = wrap('style')(fonts.map(fontFace).reduce(add));
  document.head.innerHTML += style;

  var by = function by(sortBy) {
    return function (a, b) {
      if (a[sortBy] < b[sortBy]) return -1;
      if (a[sortBy] > b[sortBy]) return 1;
      return 0;
    };
  };

  var sort = function sort(sortBy) {
    var table = fontTable(fonts.sort(by(sortBy)).map(fontRow).reduce(add));
    document.getElementById('show').innerHTML = table;
  };
  sort('xHeight');
  window.sort = sort;
});