(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _util = require('./util.js');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var wrap = function wrap(el) {
  return function (html) {
    return '<' + el + '>' + html + '</' + el + '>';
  };
};

var showFont = function showFont(font) {
  return '\n    <span onclick="showDistances(window.analysis[\'' + font.name + '\'])" style="font-family: \'' + font.name + '\';" id="' + font.name + '">\n      ' + font.name + ' [ A O M N x l i ]\n    </span>';
};

var showDistance = function showDistance(distance) {
  if (distance.distance) {
    return showFont(distance.a) + ' and ' + showFont(distance.b);
  }
  return '';
};

window.showDistances = function (font) {
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
  }).map(showDistance).map(wrap('div')).reduce(_util2.default.add);
  document.getElementById('distances').innerHTML = '\n    <p>most similar</p>\n    ' + html + '\n    </p>most different</p>';
};

var fontFace = function fontFace(font) {
  return '\n  @font-face {\n    font-family: "' + font.name + '";\n    src: url("' + font.fontUrl + '")\n  }';
};

var fontRow = function fontRow(font) {
  var keys = _util2.default.numericKeys(font);
  var tds = keys.map(function (key) {
    return font[key];
  }).map(wrap('td')).reduce(_util2.default.add);
  return '\n    <tr>\n      <td>' + showFont(font) + '</td>\n      ' + tds + '\n    </tr>';
};

var fontTable = function fontTable(fonts) {
  var keys = _util2.default.numericKeys(fonts[0]);
  var ths = keys.map(function (key) {
    return '<th onclick="sort(\'' + key + '\')">' + key + '</th>';
  }).reduce(_util2.default.add);
  var rows = fonts.map(fontRow).reduce(_util2.default.add);
  return '\n    <table>\n      <tr>\n        <th onclick="sort(\'font\')">font</th>\n        ' + ths + '\n      </tr>\n      ' + rows + '\n    </table>';
};

_util2.default.r('analysis.json').then(function (analysis) {
  window.analysis = analysis;
  var fonts = Object.keys(analysis).map(function (key) {
    return analysis[key];
  });
  window.dataWhatevers = _util2.default.numericKeys(fonts[0]);

  var style = wrap('style')(fonts.map(fontFace).reduce(_util2.default.add));
  document.head.innerHTML += style;

  var by = function by(sortBy) {
    return function (a, b) {
      if (a[sortBy] < b[sortBy]) return 1;
      if (a[sortBy] > b[sortBy]) return -1;
      return 0;
    };
  };

  var sort = function sort(sortBy) {
    var table = fontTable(fonts.sort(by(sortBy)));
    document.getElementById('show').innerHTML = table;
  };
  sort('xHeight');
  window.sort = sort;
});

},{"./util.js":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function util() {
  var add = function add(a, b) {
    return a + b;
  };

  var concat = function concat(a, b) {
    return a.concat(b);
  };

  var mean = function mean(arr) {
    return arr.reduce(function (a, b) {
      return a + b;
    }) / arr.length;
  };

  var numericKeys = function numericKeys(obj) {
    return Object.keys(obj).filter(function (key) {
      if (typeof obj[key] === 'number') {
        return true;
      }
      return false;
    });
  };

  var distance = function distance(a, b) {
    var keys = numericKeys(a);
    return Math.sqrt(keys.map(function (key) {
      return a[key] - b[key];
    }).map(function (diff) {
      return diff * diff;
    }).reduce(function (a, b) {
      return a + b;
    }, 0));
  };

  var firstN = function firstN(n, arr) {
    return arr.splice(0, n);
  };

  var makeNormer = function makeNormer(from, to, values) {
    var max = Math.max.apply(Math, _toConsumableArray(values));
    var min = Math.min.apply(Math, _toConsumableArray(values));
    var range = max - min;
    var newRange = to - from;
    return function (value) {
      return (value - min) / range * newRange + from;
    };
  };

  var makeNormalNormer = function makeNormalNormer(values) {
    return makeNormer(0, 100, values);
  };

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

  return Object.freeze({
    mean: mean, distance: distance, firstN: firstN, r: r, numericKeys: numericKeys, add: add, concat: concat, makeNormer: makeNormer, makeNormalNormer: makeNormalNormer
  });
}

exports.default = util();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL3Nob3cuanMiLCJfc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7QUFFQSxJQUFNLE9BQU8sU0FBUCxJQUFPLENBQUMsRUFBRCxFQUFRO0FBQ25CLFNBQU8sVUFBQyxJQUFELEVBQVU7QUFDZixpQkFBVyxFQUFYLFNBQWlCLElBQWpCLFVBQTBCLEVBQTFCO0FBQ0QsR0FGRDtBQUdELENBSkQ7O0FBTUEsSUFBTSxXQUFXLFNBQVgsUUFBVyxDQUFDLElBQUQsRUFBVTtBQUN6QixtRUFDa0QsS0FBSyxJQUR2RCxvQ0FDd0YsS0FBSyxJQUQ3RixpQkFDNEcsS0FBSyxJQURqSCxrQkFFTSxLQUFLLElBRlg7QUFJRCxDQUxEOztBQU9BLElBQU0sZUFBZSxTQUFmLFlBQWUsQ0FBQyxRQUFELEVBQWM7QUFDakMsTUFBSSxTQUFTLFFBQWIsRUFBdUI7QUFDckIsV0FBVSxTQUFTLFNBQVMsQ0FBbEIsQ0FBVixhQUFzQyxTQUFTLFNBQVMsQ0FBbEIsQ0FBdEM7QUFDRDtBQUNELFNBQU8sRUFBUDtBQUNELENBTEQ7O0FBT0EsT0FBTyxhQUFQLEdBQXVCLFVBQUMsSUFBRCxFQUFVO0FBQy9CLE1BQU0sT0FBTyxPQUFPLElBQVAsQ0FBWSxLQUFLLFNBQWpCLEVBQ1YsR0FEVSxDQUNOLFVBQUMsYUFBRCxFQUFtQjtBQUN0QixXQUFPO0FBQ0wsU0FBRyxJQURFO0FBRUwsU0FBRyxPQUFPLFFBQVAsQ0FBZ0IsYUFBaEIsQ0FGRTtBQUdMLGdCQUFVLEtBQUssU0FBTCxDQUFlLGFBQWY7QUFITCxLQUFQO0FBS0QsR0FQVSxFQVFWLElBUlUsQ0FRTCxVQUFDLENBQUQsRUFBSSxDQUFKLEVBQVU7QUFDZCxRQUFJLEVBQUUsUUFBRixLQUFlLEVBQUUsUUFBckIsRUFBK0IsT0FBTyxDQUFQO0FBQy9CLFFBQUksRUFBRSxRQUFGLEtBQWUsSUFBZixJQUF1QixF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VUQsR0FYRDs7QUFhQSxTQUFPLE9BQU8sTUFBUCxDQUFjO0FBQ25CLGNBRG1CLEVBQ2Isa0JBRGEsRUFDSCxjQURHLEVBQ0ssSUFETCxFQUNRLHdCQURSLEVBQ3FCLFFBRHJCLEVBQzBCLGNBRDFCLEVBQ2tDLHNCQURsQyxFQUM4QztBQUQ5QyxHQUFkLENBQVA7QUFHRDs7a0JBRWMsTSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgdSBmcm9tICcuL3V0aWwuanMnXG5cbmNvbnN0IHdyYXAgPSAoZWwpID0+IHtcbiAgcmV0dXJuIChodG1sKSA9PiB7XG4gICAgcmV0dXJuIGA8JHtlbH0+JHtodG1sfTwvJHtlbH0+YFxuICB9XG59XG5cbmNvbnN0IHNob3dGb250ID0gKGZvbnQpID0+IHtcbiAgcmV0dXJuIGBcbiAgICA8c3BhbiBvbmNsaWNrPVwic2hvd0Rpc3RhbmNlcyh3aW5kb3cuYW5hbHlzaXNbJyR7Zm9udC5uYW1lfSddKVwiIHN0eWxlPVwiZm9udC1mYW1pbHk6ICcke2ZvbnQubmFtZX0nO1wiIGlkPVwiJHtmb250Lm5hbWV9XCI+XG4gICAgICAke2ZvbnQubmFtZX0gWyBBIE8gTSBOIHggbCBpIF1cbiAgICA8L3NwYW4+YFxufVxuXG5jb25zdCBzaG93RGlzdGFuY2UgPSAoZGlzdGFuY2UpID0+IHtcbiAgaWYgKGRpc3RhbmNlLmRpc3RhbmNlKSB7XG4gICAgcmV0dXJuIGAke3Nob3dGb250KGRpc3RhbmNlLmEpfSBhbmQgJHtzaG93Rm9udChkaXN0YW5jZS5iKX1gXG4gIH1cbiAgcmV0dXJuICcnXG59XG5cbndpbmRvdy5zaG93RGlzdGFuY2VzID0gKGZvbnQpID0+IHtcbiAgY29uc3QgaHRtbCA9IE9iamVjdC5rZXlzKGZvbnQuZGlzdGFuY2VzKVxuICAgIC5tYXAoKG90aGVyRm9udE5hbWUpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGE6IGZvbnQsXG4gICAgICAgIGI6IHdpbmRvdy5hbmFseXNpc1tvdGhlckZvbnROYW1lXSxcbiAgICAgICAgZGlzdGFuY2U6IGZvbnQuZGlzdGFuY2VzW290aGVyRm9udE5hbWVdXG4gICAgICB9XG4gICAgfSlcbiAgICAuc29ydCgoYSwgYikgPT4ge1xuICAgICAgaWYgKGEuZGlzdGFuY2UgPT09IGIuZGlzdGFuY2UpIHJldHVybiAwXG4gICAgICBpZiAoYi5kaXN0YW5jZSA9PT0gbnVsbCB8fCBhLmRpc3RhbmNlID4gYi5kaXN0YW5jZSkgcmV0dXJuIDFcbiAgICAgIGlmIChhLmRpc3RhbmNlID09PSBudWxsIHx8IGEuZGlzdGFuY2UgPCBiLmRpc3RhbmNlKSByZXR1cm4gLTFcbiAgICAgIHJldHVybiAwXG4gICAgfSlcbiAgICAubWFwKHNob3dEaXN0YW5jZSlcbiAgICAubWFwKHdyYXAoJ2RpdicpKVxuICAgIC5yZWR1Y2UodS5hZGQpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXN0YW5jZXMnKS5pbm5lckhUTUwgPSBgXG4gICAgPHA+bW9zdCBzaW1pbGFyPC9wPlxuICAgICR7aHRtbH1cbiAgICA8L3A+bW9zdCBkaWZmZXJlbnQ8L3A+YFxufVxuXG5jb25zdCBmb250RmFjZSA9IChmb250KSA9PiB7XG4gIHJldHVybiBgXG4gIEBmb250LWZhY2Uge1xuICAgIGZvbnQtZmFtaWx5OiBcIiR7Zm9udC5uYW1lfVwiO1xuICAgIHNyYzogdXJsKFwiJHtmb250LmZvbnRVcmx9XCIpXG4gIH1gXG59XG5cbmNvbnN0IGZvbnRSb3cgPSAoZm9udCkgPT4ge1xuICBjb25zdCBrZXlzID0gdS5udW1lcmljS2V5cyhmb250KVxuICBjb25zdCB0ZHMgPSBrZXlzXG4gICAgLm1hcCgoa2V5KSA9PiB7IHJldHVybiBmb250W2tleV0gfSlcbiAgICAubWFwKHdyYXAoJ3RkJykpXG4gICAgLnJlZHVjZSh1LmFkZClcbiAgcmV0dXJuIGBcbiAgICA8dHI+XG4gICAgICA8dGQ+JHtzaG93Rm9udChmb250KX08L3RkPlxuICAgICAgJHt0ZHN9XG4gICAgPC90cj5gXG59XG5cbmNvbnN0IGZvbnRUYWJsZSA9IChmb250cykgPT4ge1xuICBjb25zdCBrZXlzID0gdS5udW1lcmljS2V5cyhmb250c1swXSlcbiAgY29uc3QgdGhzID0ga2V5c1xuICAgIC5tYXAoKGtleSkgPT4geyByZXR1cm4gYDx0aCBvbmNsaWNrPVwic29ydCgnJHtrZXl9JylcIj4ke2tleX08L3RoPmAgfSlcbiAgICAucmVkdWNlKHUuYWRkKVxuICBjb25zdCByb3dzID0gZm9udHNcbiAgICAubWFwKGZvbnRSb3cpXG4gICAgLnJlZHVjZSh1LmFkZClcbiAgcmV0dXJuIGBcbiAgICA8dGFibGU+XG4gICAgICA8dHI+XG4gICAgICAgIDx0aCBvbmNsaWNrPVwic29ydCgnZm9udCcpXCI+Zm9udDwvdGg+XG4gICAgICAgICR7dGhzfVxuICAgICAgPC90cj5cbiAgICAgICR7cm93c31cbiAgICA8L3RhYmxlPmBcbn1cblxudS5yKCdhbmFseXNpcy5qc29uJylcbiAgLnRoZW4oKGFuYWx5c2lzKSA9PiB7XG4gICAgd2luZG93LmFuYWx5c2lzID0gYW5hbHlzaXNcbiAgICBjb25zdCBmb250cyA9IE9iamVjdC5rZXlzKGFuYWx5c2lzKVxuICAgICAgLm1hcCgoa2V5KSA9PiB7IHJldHVybiBhbmFseXNpc1trZXldIH0pXG4gICAgd2luZG93LmRhdGFXaGF0ZXZlcnMgPSB1Lm51bWVyaWNLZXlzKGZvbnRzWzBdKVxuXG4gICAgY29uc3Qgc3R5bGUgPSB3cmFwKCdzdHlsZScpKFxuICAgICAgZm9udHNcbiAgICAgICAgLm1hcChmb250RmFjZSlcbiAgICAgICAgLnJlZHVjZSh1LmFkZClcbiAgICApXG4gICAgZG9jdW1lbnQuaGVhZC5pbm5lckhUTUwgKz0gc3R5bGVcblxuICAgIGNvbnN0IGJ5ID0gKHNvcnRCeSkgPT4ge1xuICAgICAgcmV0dXJuIChhLCBiKSA9PiB7XG4gICAgICAgIGlmIChhW3NvcnRCeV0gPCBiW3NvcnRCeV0pIHJldHVybiAxXG4gICAgICAgIGlmIChhW3NvcnRCeV0gPiBiW3NvcnRCeV0pIHJldHVybiAtMVxuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNvcnQgPSAoc29ydEJ5KSA9PiB7XG4gICAgICBjb25zdCB0YWJsZSA9IGZvbnRUYWJsZShcbiAgICAgICAgZm9udHMuc29ydChieShzb3J0QnkpKVxuICAgICAgKVxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3cnKS5pbm5lckhUTUwgPSB0YWJsZVxuICAgIH1cbiAgICBzb3J0KCd4SGVpZ2h0JylcbiAgICB3aW5kb3cuc29ydCA9IHNvcnRcbiAgfSlcblxuIiwiZnVuY3Rpb24gdXRpbCAoKSB7XG4gIGNvbnN0IGFkZCA9IChhLCBiKSA9PiB7XG4gICAgcmV0dXJuIGEgKyBiXG4gIH1cblxuICBjb25zdCBjb25jYXQgPSAoYSwgYikgPT4ge1xuICAgIHJldHVybiBhLmNvbmNhdChiKVxuICB9XG5cbiAgY29uc3QgbWVhbiA9IChhcnIpID0+IHtcbiAgICByZXR1cm4gYXJyLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYSArIGIgfSkgLyBhcnIubGVuZ3RoXG4gIH1cblxuICBjb25zdCBudW1lcmljS2V5cyA9IChvYmopID0+IHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5maWx0ZXIoKGtleSkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gJ251bWJlcicpIHsgcmV0dXJuIHRydWUgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGRpc3RhbmNlID0gKGEsIGIpID0+IHtcbiAgICBjb25zdCBrZXlzID0gbnVtZXJpY0tleXMoYSlcbiAgICByZXR1cm4gTWF0aC5zcXJ0KGtleXMubWFwKChrZXkpID0+IHtcbiAgICAgIHJldHVybiBhW2tleV0gLSBiW2tleV1cbiAgICB9KS5tYXAoKGRpZmYpID0+IHtcbiAgICAgIHJldHVybiBkaWZmICogZGlmZlxuICAgIH0pLnJlZHVjZSgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIGEgKyBiXG4gICAgfSwgMCkpXG4gIH1cblxuICBjb25zdCBmaXJzdE4gPSAobiwgYXJyKSA9PiB7XG4gICAgcmV0dXJuIGFyci5zcGxpY2UoMCwgbilcbiAgfVxuXG4gIGNvbnN0IG1ha2VOb3JtZXIgPSAoZnJvbSwgdG8sIHZhbHVlcykgPT4ge1xuICAgIGNvbnN0IG1heCA9IE1hdGgubWF4KC4uLnZhbHVlcylcbiAgICBjb25zdCBtaW4gPSBNYXRoLm1pbiguLi52YWx1ZXMpXG4gICAgY29uc3QgcmFuZ2UgPSBtYXggLSBtaW5cbiAgICBjb25zdCBuZXdSYW5nZSA9IHRvIC0gZnJvbVxuICAgIHJldHVybiAodmFsdWUpID0+IHtcbiAgICAgIHJldHVybiAoKHZhbHVlIC0gbWluKSAvIHJhbmdlKSAqIG5ld1JhbmdlICsgZnJvbVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG1ha2VOb3JtYWxOb3JtZXIgPSAodmFsdWVzKSA9PiB7XG4gICAgcmV0dXJuIG1ha2VOb3JtZXIoMCwgMTAwLCB2YWx1ZXMpXG4gIH1cblxuICAvLyBnZW5lcmljIGh0dHAgcmVxdWVzdCBmdW5jdGlvblxuICBjb25zdCByID0gKHVybCkgPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgcmVxID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpXG4gICAgICByZXEub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgICAgICBpZiAocmVxLnJlYWR5U3RhdGUgPT09IDQgJiYgcmVxLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcS5yZXNwb25zZVRleHQpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXEub3BlbignR0VUJywgdXJsLCB0cnVlKVxuICAgICAgcmVxLnNlbmQoKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG4gICAgbWVhbiwgZGlzdGFuY2UsIGZpcnN0TiwgciwgbnVtZXJpY0tleXMsIGFkZCwgY29uY2F0LCBtYWtlTm9ybWVyLCBtYWtlTm9ybWFsTm9ybWVyXG4gIH0pXG59XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWwoKVxuXG4iXX0=
