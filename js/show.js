(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _util = require('./util.js');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  }).map(showDistance).map(wrap('div')).reduce(add);
  document.getElementById('distances').innerHTML = '\n    <p>most similar</p>\n    ' + html + '\n    </p>most different</p>';
};

var fontFace = function fontFace(font) {
  return '\n  @font-face {\n    font-family: "' + font.name + '";\n    src: url("' + font.fontUrl + '")\n  }';
};

var fontRow = function fontRow(font) {
  return '\n    <tr>\n      <td>' + showFont(font) + '</td>\n      <td>' + font.xHeight + '</td>\n      <td>' + font.complexity + '</td>\n      <td>' + font.contrast + '</td>\n      <td>' + font.widthRatio + '</td>\n      <td>' + font.widthVariance + '</td>\n    </tr>';
};

var fontTable = function fontTable(rows) {
  return '\n    <table>\n      <tr>\n        <th onclick="sort(\'font\')">font</th>\n        <th onclick="sort(\'xHeight\')">x height</th>\n        <th onclick="sort(\'complexity\')">complexity</th>\n        <th onclick="sort(\'contrast\')">contrast</th>\n        <th onclick="sort(\'widthRatio\')">width ratio</th>\n        <th onclick="sort(\'widthVariance\')">width variance</th>\n      </tr>\n      ' + rows + '\n    </table>';
};

_util2.default.r('analysis.json').then(function (analysis) {
  window.analysis = analysis;
  var fonts = Object.keys(analysis).map(function (key) {
    return analysis[key];
  });
  window.dataWhatevers = _util2.default.numericKeys(fonts[0]);

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

},{"./util.js":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function util() {
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
    }));
  };

  var firstN = function firstN(n, arr) {
    return arr.splice(0, n);
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
    mean: mean, distance: distance, firstN: firstN, r: r, numericKeys: numericKeys
  });
}

exports.default = util();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL3Nob3cuanMiLCJfc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7QUFFQSxJQUFNLE1BQU0sU0FBTixHQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUNwQixTQUFPLElBQUksQ0FBWDtBQUNELENBRkQ7O0FBSUEsSUFBTSxPQUFPLFNBQVAsSUFBTyxDQUFDLEVBQUQsRUFBUTtBQUNuQixTQUFPLFVBQUMsSUFBRCxFQUFVO0FBQ2YsaUJBQVcsRUFBWCxTQUFpQixJQUFqQixVQUEwQixFQUExQjtBQUNELEdBRkQ7QUFHRCxDQUpEOztBQU1BLElBQU0sV0FBVyxTQUFYLFFBQVcsQ0FBQyxJQUFELEVBQVU7QUFDekIsbUVBQ2tELEtBQUssSUFEdkQsb0NBQ3dGLEtBQUssSUFEN0YsaUJBQzRHLEtBQUssSUFEakgsa0JBRU0sS0FBSyxJQUZYO0FBSUQsQ0FMRDs7QUFPQSxJQUFNLGVBQWUsU0FBZixZQUFlLENBQUMsUUFBRCxFQUFjO0FBQ2pDLE1BQUksU0FBUyxRQUFiLEVBQXVCO0FBQ3JCLFdBQVUsU0FBUyxTQUFTLENBQWxCLENBQVYsYUFBc0MsU0FBUyxTQUFTLENBQWxCLENBQXRDO0FBQ0Q7QUFDRCxTQUFPLEVBQVA7QUFDRCxDQUxEOztBQU9BLE9BQU8sYUFBUCxHQUF1QixVQUFDLElBQUQsRUFBVTtBQUMvQixNQUFNLE9BQU8sT0FBTyxJQUFQLENBQVksS0FBSyxTQUFqQixFQUNWLEdBRFUsQ0FDTixVQUFDLGFBQUQsRUFBbUI7QUFDdEIsV0FBTztBQUNMLFNBQUcsSUFERTtBQUVMLFNBQUcsT0FBTyxRQUFQLENBQWdCLGFBQWhCLENBRkU7QUFHTCxnQkFBVSxLQUFLLFNBQUwsQ0FBZSxhQUFmO0FBSEwsS0FBUDtBQUtELEdBUFUsRUFRVixJQVJVLENBUUwsVUFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBQ2QsUUFB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QWdCLEdBQWhCLEVBQXFCLElBQXJCO0FBQ0EsVUFBSSxJQUFKO0FBQ0QsS0FUTSxDQUFQO0FBVUQsR0FYRDs7QUFhQSxTQUFPLE9BQU8sTUFBUCxDQUFjO0FBQ25CLGNBRG1CLEVBQ2Isa0JBRGEsRUFDSCxjQURHLEVBQ0ssSUFETCxFQUNRO0FBRFIsR0FBZCxDQUFQO0FBR0Q7O2tCQUVjLE0iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHUgZnJvbSAnLi91dGlsLmpzJ1xuXG5jb25zdCBhZGQgPSAoYSwgYikgPT4ge1xuICByZXR1cm4gYSArIGJcbn1cblxuY29uc3Qgd3JhcCA9IChlbCkgPT4ge1xuICByZXR1cm4gKGh0bWwpID0+IHtcbiAgICByZXR1cm4gYDwke2VsfT4ke2h0bWx9PC8ke2VsfT5gXG4gIH1cbn1cblxuY29uc3Qgc2hvd0ZvbnQgPSAoZm9udCkgPT4ge1xuICByZXR1cm4gYFxuICAgIDxzcGFuIG9uY2xpY2s9XCJzaG93RGlzdGFuY2VzKHdpbmRvdy5hbmFseXNpc1snJHtmb250Lm5hbWV9J10pXCIgc3R5bGU9XCJmb250LWZhbWlseTogJyR7Zm9udC5uYW1lfSc7XCIgaWQ9XCIke2ZvbnQubmFtZX1cIj5cbiAgICAgICR7Zm9udC5uYW1lfSBbIEEgTyBNIE4geCBsIGkgXVxuICAgIDwvc3Bhbj5gXG59XG5cbmNvbnN0IHNob3dEaXN0YW5jZSA9IChkaXN0YW5jZSkgPT4ge1xuICBpZiAoZGlzdGFuY2UuZGlzdGFuY2UpIHtcbiAgICByZXR1cm4gYCR7c2hvd0ZvbnQoZGlzdGFuY2UuYSl9IGFuZCAke3Nob3dGb250KGRpc3RhbmNlLmIpfWBcbiAgfVxuICByZXR1cm4gJydcbn1cblxud2luZG93LnNob3dEaXN0YW5jZXMgPSAoZm9udCkgPT4ge1xuICBjb25zdCBodG1sID0gT2JqZWN0LmtleXMoZm9udC5kaXN0YW5jZXMpXG4gICAgLm1hcCgob3RoZXJGb250TmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYTogZm9udCxcbiAgICAgICAgYjogd2luZG93LmFuYWx5c2lzW290aGVyRm9udE5hbWVdLFxuICAgICAgICBkaXN0YW5jZTogZm9udC5kaXN0YW5jZXNbb3RoZXJGb250TmFtZV1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZiAoYS5kaXN0YW5jZSA9PT0gYi5kaXN0YW5jZSkgcmV0dXJuIDBcbiAgICAgIGlmIChiLmRpc3RhbmNlID09PSBudWxsIHx8IGEuZGlzdGFuY2UgPiBiLmRpc3RhbmNlKSByZXR1cm4gMVxuICAgICAgaWYgKGEuZGlzdGFuY2UgPT09IG51bGwgfHwgYS5kaXN0YW5jZSA8IGIuZGlzdGFuY2UpIHJldHVybiAtMVxuICAgICAgcmV0dXJuIDBcbiAgICB9KVxuICAgIC5tYXAoc2hvd0Rpc3RhbmNlKVxuICAgIC5tYXAod3JhcCgnZGl2JykpXG4gICAgLnJlZHVjZShhZGQpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXN0YW5jZXMnKS5pbm5lckhUTUwgPSBgXG4gICAgPHA+bW9zdCBzaW1pbGFyPC9wPlxuICAgICR7aHRtbH1cbiAgICA8L3A+bW9zdCBkaWZmZXJlbnQ8L3A+YFxufVxuXG5jb25zdCBmb250RmFjZSA9IChmb250KSA9PiB7XG4gIHJldHVybiBgXG4gIEBmb250LWZhY2Uge1xuICAgIGZvbnQtZmFtaWx5OiBcIiR7Zm9udC5uYW1lfVwiO1xuICAgIHNyYzogdXJsKFwiJHtmb250LmZvbnRVcmx9XCIpXG4gIH1gXG59XG5cbmNvbnN0IGZvbnRSb3cgPSAoZm9udCkgPT4ge1xuICByZXR1cm4gYFxuICAgIDx0cj5cbiAgICAgIDx0ZD4ke3Nob3dGb250KGZvbnQpfTwvdGQ+XG4gICAgICA8dGQ+JHtmb250LnhIZWlnaHR9PC90ZD5cbiAgICAgIDx0ZD4ke2ZvbnQuY29tcGxleGl0eX08L3RkPlxuICAgICAgPHRkPiR7Zm9udC5jb250cmFzdH08L3RkPlxuICAgICAgPHRkPiR7Zm9udC53aWR0aFJhdGlvfTwvdGQ+XG4gICAgICA8dGQ+JHtmb250LndpZHRoVmFyaWFuY2V9PC90ZD5cbiAgICA8L3RyPmBcbn1cblxuY29uc3QgZm9udFRhYmxlID0gKHJvd3MpID0+IHtcbiAgcmV0dXJuIGBcbiAgICA8dGFibGU+XG4gICAgICA8dHI+XG4gICAgICAgIDx0aCBvbmNsaWNrPVwic29ydCgnZm9udCcpXCI+Zm9udDwvdGg+XG4gICAgICAgIDx0aCBvbmNsaWNrPVwic29ydCgneEhlaWdodCcpXCI+eCBoZWlnaHQ8L3RoPlxuICAgICAgICA8dGggb25jbGljaz1cInNvcnQoJ2NvbXBsZXhpdHknKVwiPmNvbXBsZXhpdHk8L3RoPlxuICAgICAgICA8dGggb25jbGljaz1cInNvcnQoJ2NvbnRyYXN0JylcIj5jb250cmFzdDwvdGg+XG4gICAgICAgIDx0aCBvbmNsaWNrPVwic29ydCgnd2lkdGhSYXRpbycpXCI+d2lkdGggcmF0aW88L3RoPlxuICAgICAgICA8dGggb25jbGljaz1cInNvcnQoJ3dpZHRoVmFyaWFuY2UnKVwiPndpZHRoIHZhcmlhbmNlPC90aD5cbiAgICAgIDwvdHI+XG4gICAgICAke3Jvd3N9XG4gICAgPC90YWJsZT5gXG59XG5cbnUucignYW5hbHlzaXMuanNvbicpXG4gIC50aGVuKChhbmFseXNpcykgPT4ge1xuICAgIHdpbmRvdy5hbmFseXNpcyA9IGFuYWx5c2lzXG4gICAgY29uc3QgZm9udHMgPSBPYmplY3Qua2V5cyhhbmFseXNpcylcbiAgICAgIC5tYXAoKGtleSkgPT4geyByZXR1cm4gYW5hbHlzaXNba2V5XSB9KVxuICAgIHdpbmRvdy5kYXRhV2hhdGV2ZXJzID0gdS5udW1lcmljS2V5cyhmb250c1swXSlcblxuICAgIGNvbnN0IHN0eWxlID0gd3JhcCgnc3R5bGUnKShcbiAgICAgIGZvbnRzXG4gICAgICAgIC5tYXAoZm9udEZhY2UpXG4gICAgICAgIC5yZWR1Y2UoYWRkKVxuICAgIClcbiAgICBkb2N1bWVudC5oZWFkLmlubmVySFRNTCArPSBzdHlsZVxuXG4gICAgY29uc3QgYnkgPSAoc29ydEJ5KSA9PiB7XG4gICAgICByZXR1cm4gKGEsIGIpID0+IHtcbiAgICAgICAgaWYgKGFbc29ydEJ5XSA8IGJbc29ydEJ5XSkgcmV0dXJuIC0xXG4gICAgICAgIGlmIChhW3NvcnRCeV0gPiBiW3NvcnRCeV0pIHJldHVybiAxXG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc29ydCA9IChzb3J0QnkpID0+IHtcbiAgICAgIGNvbnN0IHRhYmxlID0gZm9udFRhYmxlKFxuICAgICAgICBmb250c1xuICAgICAgICAgIC5zb3J0KGJ5KHNvcnRCeSkpXG4gICAgICAgICAgLm1hcChmb250Um93KVxuICAgICAgICAgIC5yZWR1Y2UoYWRkKVxuICAgICAgICApXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvdycpLmlubmVySFRNTCA9IHRhYmxlXG4gICAgfVxuICAgIHNvcnQoJ3hIZWlnaHQnKVxuICAgIHdpbmRvdy5zb3J0ID0gc29ydFxuICB9KVxuXG4iLCJmdW5jdGlvbiB1dGlsICgpIHtcbiAgY29uc3QgbWVhbiA9IChhcnIpID0+IHtcbiAgICByZXR1cm4gYXJyLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYSArIGIgfSkgLyBhcnIubGVuZ3RoXG4gIH1cblxuICBjb25zdCBudW1lcmljS2V5cyA9IChvYmopID0+IHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5maWx0ZXIoKGtleSkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gJ251bWJlcicpIHsgcmV0dXJuIHRydWUgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGRpc3RhbmNlID0gKGEsIGIpID0+IHtcbiAgICBjb25zdCBrZXlzID0gbnVtZXJpY0tleXMoYSlcbiAgICByZXR1cm4gTWF0aC5zcXJ0KGtleXMubWFwKChrZXkpID0+IHtcbiAgICAgIHJldHVybiBhW2tleV0gLSBiW2tleV1cbiAgICB9KS5tYXAoKGRpZmYpID0+IHtcbiAgICAgIHJldHVybiBkaWZmICogZGlmZlxuICAgIH0pLnJlZHVjZSgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIGEgKyBiXG4gICAgfSkpXG4gIH1cblxuICBjb25zdCBmaXJzdE4gPSAobiwgYXJyKSA9PiB7XG4gICAgcmV0dXJuIGFyci5zcGxpY2UoMCwgbilcbiAgfVxuXG4gIC8vIGdlbmVyaWMgaHR0cCByZXF1ZXN0IGZ1bmN0aW9uXG4gIGNvbnN0IHIgPSAodXJsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCByZXEgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KClcbiAgICAgIHJlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCAmJiByZXEuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVxLnJlc3BvbnNlVGV4dCkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlcS5vcGVuKCdHRVQnLCB1cmwsIHRydWUpXG4gICAgICByZXEuc2VuZCgpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICBtZWFuLCBkaXN0YW5jZSwgZmlyc3ROLCByLCBudW1lcmljS2V5c1xuICB9KVxufVxuXG5leHBvcnQgZGVmYXVsdCB1dGlsKClcblxuIl19
