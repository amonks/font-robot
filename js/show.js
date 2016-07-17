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
  return '\n    <tr>\n      <td>' + showFont(font) + '</td>\n      <td>' + font.xHeight + '</td>\n      <td>' + font.contrast + '</td>\n      <td>' + font.widthRatio + '</td>\n      <td>' + font.widthVariance + '</td>\n    </tr>';
};

var fontTable = function fontTable(rows) {
  return '\n    <table>\n      <tr>\n        <th onclick="sort(\'font\')">font</th>\n        <th onclick="sort(\'xHeight\')">x height</th>\n        <th onclick="sort(\'contrast\')">contrast</th>\n        <th onclick="sort(\'widthRatio\')">width ratio</th>\n        <th onclick="sort(\'widthVariance\')">width variance</th>\n      </tr>\n      ' + rows + '\n    </table>';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL3Nob3cuanMiLCJfc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7QUFFQSxJQUFNLE1BQU0sU0FBTixHQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUNwQixTQUFPLElBQUksQ0FBWDtBQUNELENBRkQ7O0FBSUEsSUFBTSxPQUFPLFNBQVAsSUFBTyxDQUFDLEVBQUQsRUFBUTtBQUNuQixTQUFPLFVBQUMsSUFBRCxFQUFVO0FBQ2YsaUJBQVcsRUFBWCxTQUFpQixJQUFqQixVQUEwQixFQUExQjtBQUNELEdBRkQ7QUFHRCxDQUpEOztBQU1BLElBQU0sV0FBVyxTQUFYLFFBQVcsQ0FBQyxJQUFELEVBQVU7QUFDekIsbUVBQ2tELEtBQUssSUFEdkQsb0NBQ3dGLEtBQUssSUFEN0YsaUJBQzRHLEtBQUssSUFEakgsa0JBRU0sS0FBSyxJQUZYO0FBSUQsQ0FMRDs7QUFPQSxJQUFNLGVBQWUsU0FBZixZQUFlLENBQUMsUUFBRCxFQUFjO0FBQ2pDLE1BQUksU0FBUyxRQUFiLEVBQXVCO0FBQ3JCLFdBQVUsU0FBUyxTQUFTLENBQWxCLENBQVYsYUFBc0MsU0FBUyxTQUFTLENBQWxCLENBQXRDO0FBQ0Q7QUFDRCxTQUFPLEVBQVA7QUFDRCxDQUxEOztBQU9BLE9BQU8sYUFBUCxHQUF1QixVQUFDLElBQUQsRUFBVTtBQUMvQixNQUFNLE9BQU8sT0FBTyxJQUFQLENBQVksS0FBSyxTQUFqQixFQUNWLEdBRFUsQ0FDTixVQUFDLGFBQUQsRUFBbUI7QUFDdEIsV0FBTztBQUNMLFNBQUcsSUFERTtBQUVMLFNBQUcsT0FBTyxRQUFQLENBQWdCLGFBQWhCLENBRkU7QUFHTCxnQkFBVSxLQUFLLFNBQUwsQ0FBZSxhQUFmO0FBSEwsS0FBUDtBQUtELEdBUFUsRUFRVixJQVJVLENBUUwsVUFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBQ2QsUUFB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SUFBckI7QUFDQSxVQUFJLElBQUo7QUFDRCxLQVRNLENBQVA7QUFVRCxHQVhEOztBQWFBLFNBQU8sT0FBTyxNQUFQLENBQWM7QUFDbkIsY0FEbUIsRUFDYixrQkFEYSxFQUNILGNBREcsRUFDSyxJQURMLEVBQ1E7QUFEUixHQUFkLENBQVA7QUFHRDs7a0JBRWMsTSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgdSBmcm9tICcuL3V0aWwuanMnXG5cbmNvbnN0IGFkZCA9IChhLCBiKSA9PiB7XG4gIHJldHVybiBhICsgYlxufVxuXG5jb25zdCB3cmFwID0gKGVsKSA9PiB7XG4gIHJldHVybiAoaHRtbCkgPT4ge1xuICAgIHJldHVybiBgPCR7ZWx9PiR7aHRtbH08LyR7ZWx9PmBcbiAgfVxufVxuXG5jb25zdCBzaG93Rm9udCA9IChmb250KSA9PiB7XG4gIHJldHVybiBgXG4gICAgPHNwYW4gb25jbGljaz1cInNob3dEaXN0YW5jZXMod2luZG93LmFuYWx5c2lzWycke2ZvbnQubmFtZX0nXSlcIiBzdHlsZT1cImZvbnQtZmFtaWx5OiAnJHtmb250Lm5hbWV9JztcIiBpZD1cIiR7Zm9udC5uYW1lfVwiPlxuICAgICAgJHtmb250Lm5hbWV9IFsgQSBPIE0gTiB4IGwgaSBdXG4gICAgPC9zcGFuPmBcbn1cblxuY29uc3Qgc2hvd0Rpc3RhbmNlID0gKGRpc3RhbmNlKSA9PiB7XG4gIGlmIChkaXN0YW5jZS5kaXN0YW5jZSkge1xuICAgIHJldHVybiBgJHtzaG93Rm9udChkaXN0YW5jZS5hKX0gYW5kICR7c2hvd0ZvbnQoZGlzdGFuY2UuYil9YFxuICB9XG4gIHJldHVybiAnJ1xufVxuXG53aW5kb3cuc2hvd0Rpc3RhbmNlcyA9IChmb250KSA9PiB7XG4gIGNvbnN0IGh0bWwgPSBPYmplY3Qua2V5cyhmb250LmRpc3RhbmNlcylcbiAgICAubWFwKChvdGhlckZvbnROYW1lKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhOiBmb250LFxuICAgICAgICBiOiB3aW5kb3cuYW5hbHlzaXNbb3RoZXJGb250TmFtZV0sXG4gICAgICAgIGRpc3RhbmNlOiBmb250LmRpc3RhbmNlc1tvdGhlckZvbnROYW1lXVxuICAgICAgfVxuICAgIH0pXG4gICAgLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGlmIChhLmRpc3RhbmNlID09PSBiLmRpc3RhbmNlKSByZXR1cm4gMFxuICAgICAgaWYgKGIuZGlzdGFuY2UgPT09IG51bGwgfHwgYS5kaXN0YW5jZSA+IGIuZGlzdGFuY2UpIHJldHVybiAxXG4gICAgICBpZiAoYS5kaXN0YW5jZSA9PT0gbnVsbCB8fCBhLmRpc3RhbmNlIDwgYi5kaXN0YW5jZSkgcmV0dXJuIC0xXG4gICAgICByZXR1cm4gMFxuICAgIH0pXG4gICAgLm1hcChzaG93RGlzdGFuY2UpXG4gICAgLm1hcCh3cmFwKCdkaXYnKSlcbiAgICAucmVkdWNlKGFkZClcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc3RhbmNlcycpLmlubmVySFRNTCA9IGBcbiAgICA8cD5tb3N0IHNpbWlsYXI8L3A+XG4gICAgJHtodG1sfVxuICAgIDwvcD5tb3N0IGRpZmZlcmVudDwvcD5gXG59XG5cbmNvbnN0IGZvbnRGYWNlID0gKGZvbnQpID0+IHtcbiAgcmV0dXJuIGBcbiAgQGZvbnQtZmFjZSB7XG4gICAgZm9udC1mYW1pbHk6IFwiJHtmb250Lm5hbWV9XCI7XG4gICAgc3JjOiB1cmwoXCIke2ZvbnQuZm9udFVybH1cIilcbiAgfWBcbn1cblxuY29uc3QgZm9udFJvdyA9IChmb250KSA9PiB7XG4gIHJldHVybiBgXG4gICAgPHRyPlxuICAgICAgPHRkPiR7c2hvd0ZvbnQoZm9udCl9PC90ZD5cbiAgICAgIDx0ZD4ke2ZvbnQueEhlaWdodH08L3RkPlxuICAgICAgPHRkPiR7Zm9udC5jb250cmFzdH08L3RkPlxuICAgICAgPHRkPiR7Zm9udC53aWR0aFJhdGlvfTwvdGQ+XG4gICAgICA8dGQ+JHtmb250LndpZHRoVmFyaWFuY2V9PC90ZD5cbiAgICA8L3RyPmBcbn1cblxuY29uc3QgZm9udFRhYmxlID0gKHJvd3MpID0+IHtcbiAgcmV0dXJuIGBcbiAgICA8dGFibGU+XG4gICAgICA8dHI+XG4gICAgICAgIDx0aCBvbmNsaWNrPVwic29ydCgnZm9udCcpXCI+Zm9udDwvdGg+XG4gICAgICAgIDx0aCBvbmNsaWNrPVwic29ydCgneEhlaWdodCcpXCI+eCBoZWlnaHQ8L3RoPlxuICAgICAgICA8dGggb25jbGljaz1cInNvcnQoJ2NvbnRyYXN0JylcIj5jb250cmFzdDwvdGg+XG4gICAgICAgIDx0aCBvbmNsaWNrPVwic29ydCgnd2lkdGhSYXRpbycpXCI+d2lkdGggcmF0aW88L3RoPlxuICAgICAgICA8dGggb25jbGljaz1cInNvcnQoJ3dpZHRoVmFyaWFuY2UnKVwiPndpZHRoIHZhcmlhbmNlPC90aD5cbiAgICAgIDwvdHI+XG4gICAgICAke3Jvd3N9XG4gICAgPC90YWJsZT5gXG59XG5cbnUucignYW5hbHlzaXMuanNvbicpXG4gIC50aGVuKChhbmFseXNpcykgPT4ge1xuICAgIHdpbmRvdy5hbmFseXNpcyA9IGFuYWx5c2lzXG4gICAgY29uc3QgZm9udHMgPSBPYmplY3Qua2V5cyhhbmFseXNpcylcbiAgICAgIC5tYXAoKGtleSkgPT4geyByZXR1cm4gYW5hbHlzaXNba2V5XSB9KVxuICAgIHdpbmRvdy5kYXRhV2hhdGV2ZXJzID0gdS5udW1lcmljS2V5cyhmb250c1swXSlcblxuICAgIGNvbnN0IHN0eWxlID0gd3JhcCgnc3R5bGUnKShcbiAgICAgIGZvbnRzXG4gICAgICAgIC5tYXAoZm9udEZhY2UpXG4gICAgICAgIC5yZWR1Y2UoYWRkKVxuICAgIClcbiAgICBkb2N1bWVudC5oZWFkLmlubmVySFRNTCArPSBzdHlsZVxuXG4gICAgY29uc3QgYnkgPSAoc29ydEJ5KSA9PiB7XG4gICAgICByZXR1cm4gKGEsIGIpID0+IHtcbiAgICAgICAgaWYgKGFbc29ydEJ5XSA8IGJbc29ydEJ5XSkgcmV0dXJuIC0xXG4gICAgICAgIGlmIChhW3NvcnRCeV0gPiBiW3NvcnRCeV0pIHJldHVybiAxXG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc29ydCA9IChzb3J0QnkpID0+IHtcbiAgICAgIGNvbnN0IHRhYmxlID0gZm9udFRhYmxlKFxuICAgICAgICBmb250c1xuICAgICAgICAgIC5zb3J0KGJ5KHNvcnRCeSkpXG4gICAgICAgICAgLm1hcChmb250Um93KVxuICAgICAgICAgIC5yZWR1Y2UoYWRkKVxuICAgICAgICApXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvdycpLmlubmVySFRNTCA9IHRhYmxlXG4gICAgfVxuICAgIHNvcnQoJ3hIZWlnaHQnKVxuICAgIHdpbmRvdy5zb3J0ID0gc29ydFxuICB9KVxuXG4iLCJmdW5jdGlvbiB1dGlsICgpIHtcbiAgY29uc3QgbWVhbiA9IChhcnIpID0+IHtcbiAgICByZXR1cm4gYXJyLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYSArIGIgfSkgLyBhcnIubGVuZ3RoXG4gIH1cblxuICBjb25zdCBudW1lcmljS2V5cyA9IChvYmopID0+IHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5maWx0ZXIoKGtleSkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gJ251bWJlcicpIHsgcmV0dXJuIHRydWUgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGRpc3RhbmNlID0gKGEsIGIpID0+IHtcbiAgICBjb25zdCBrZXlzID0gbnVtZXJpY0tleXMoYSlcbiAgICByZXR1cm4gTWF0aC5zcXJ0KGtleXMubWFwKChrZXkpID0+IHtcbiAgICAgIHJldHVybiBhW2tleV0gLSBiW2tleV1cbiAgICB9KS5tYXAoKGRpZmYpID0+IHtcbiAgICAgIHJldHVybiBkaWZmICogZGlmZlxuICAgIH0pLnJlZHVjZSgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIGEgKyBiXG4gICAgfSkpXG4gIH1cblxuICBjb25zdCBmaXJzdE4gPSAobiwgYXJyKSA9PiB7XG4gICAgcmV0dXJuIGFyci5zcGxpY2UoMCwgbilcbiAgfVxuXG4gIC8vIGdlbmVyaWMgaHR0cCByZXF1ZXN0IGZ1bmN0aW9uXG4gIGNvbnN0IHIgPSAodXJsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCByZXEgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KClcbiAgICAgIHJlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCAmJiByZXEuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVxLnJlc3BvbnNlVGV4dCkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlcS5vcGVuKCdHRVQnLCB1cmwsIHRydWUpXG4gICAgICByZXEuc2VuZCgpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICBtZWFuLCBkaXN0YW5jZSwgZmlyc3ROLCByLCBudW1lcmljS2V5c1xuICB9KVxufVxuXG5leHBvcnQgZGVmYXVsdCB1dGlsKClcblxuIl19
