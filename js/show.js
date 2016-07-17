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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL3Nob3cuanMiLCJfc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7QUFFQSxJQUFNLE1BQU0sU0FBTixHQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUNwQixTQUFPLElBQUksQ0FBWDtBQUNELENBRkQ7O0FBSUEsSUFBTSxPQUFPLFNBQVAsSUFBTyxDQUFDLEVBQUQsRUFBUTtBQUNuQixTQUFPLFVBQUMsSUFBRCxFQUFVO0FBQ2YsaUJBQVcsRUFBWCxTQUFpQixJQUFqQixVQUEwQixFQUExQjtBQUNELEdBRkQ7QUFHRCxDQUpEOztBQU1BLElBQU0sV0FBVyxTQUFYLFFBQVcsQ0FBQyxJQUFELEVBQVU7QUFDekIsbUVBQ2tELEtBQUssSUFEdkQsb0NBQ3dGLEtBQUssSUFEN0YsaUJBQzRHLEtBQUssSUFEakgsa0JBRU0sS0FBSyxJQUZYO0FBSUQsQ0FMRDs7QUFPQSxJQUFNLGVBQWUsU0FBZixZQUFlLENBQUMsUUFBRCxFQUFjO0FBQ2pDLE1BQUksU0FBUyxRQUFiLEVBQXVCO0FBQ3JCLFdBQVUsU0FBUyxTQUFTLENBQWxCLENBQVYsYUFBc0MsU0FBUyxTQUFTLENBQWxCLENBQXRDO0FBQ0Q7QUFDRCxTQUFPLEVBQVA7QUFDRCxDQUxEOztBQU9BLElBQU0sZ0JBQWdCLFNBQWhCLGFBQWdCLENBQUMsSUFBRCxFQUFVO0FBQzlCLE1BQU0sT0FBTyxPQUFPLElBQVAsQ0FBWSxLQUFLLFNBQWpCLEVBQ1YsR0FEVSxDQUNOLFVBQUMsYUFBRCxFQUFtQjtBQUN0QixXQUFPO0FBQ0wsU0FBRyxJQURFO0FBRUwsU0FBRyxPQUFPLFFBQVAsQ0FBZ0IsYUFBaEIsQ0FGRTtBQUdMLGdCQUFVLEtBQUssU0FBTCxDQUFlLGFBQWY7QUFITCxLQUFQO0FBS0QsR0FQVSxFQVFWLElBUlUsQ0FRTCxVQUFDLENBQUQsRUFBSSxDQUFKLEVBQVU7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QixFQUFxQixJQUFyQjtBQUNBLFVBQUksSUFBSjtBQUNELEtBVE0sQ0FBUDtBQVVELEdBWEQ7O0FBYUEsU0FBTyxPQUFPLE1BQVAsQ0FBYztBQUNuQixjQURtQixFQUNiLGtCQURhLEVBQ0gsY0FERyxFQUNLLElBREwsRUFDUTtBQURSLEdBQWQsQ0FBUDtBQUdEOztrQkFFYyxNIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB1IGZyb20gJy4vdXRpbC5qcydcblxuY29uc3QgYWRkID0gKGEsIGIpID0+IHtcbiAgcmV0dXJuIGEgKyBiXG59XG5cbmNvbnN0IHdyYXAgPSAoZWwpID0+IHtcbiAgcmV0dXJuIChodG1sKSA9PiB7XG4gICAgcmV0dXJuIGA8JHtlbH0+JHtodG1sfTwvJHtlbH0+YFxuICB9XG59XG5cbmNvbnN0IHNob3dGb250ID0gKGZvbnQpID0+IHtcbiAgcmV0dXJuIGBcbiAgICA8c3BhbiBvbmNsaWNrPVwic2hvd0Rpc3RhbmNlcyh3aW5kb3cuYW5hbHlzaXNbJyR7Zm9udC5uYW1lfSddKVwiIHN0eWxlPVwiZm9udC1mYW1pbHk6ICcke2ZvbnQubmFtZX0nO1wiIGlkPVwiJHtmb250Lm5hbWV9XCI+XG4gICAgICAke2ZvbnQubmFtZX0gWyBBIE8gTSBOIHggbCBpIF1cbiAgICA8L3NwYW4+YFxufVxuXG5jb25zdCBzaG93RGlzdGFuY2UgPSAoZGlzdGFuY2UpID0+IHtcbiAgaWYgKGRpc3RhbmNlLmRpc3RhbmNlKSB7XG4gICAgcmV0dXJuIGAke3Nob3dGb250KGRpc3RhbmNlLmEpfSBhbmQgJHtzaG93Rm9udChkaXN0YW5jZS5iKX1gXG4gIH1cbiAgcmV0dXJuICcnXG59XG5cbmNvbnN0IHNob3dEaXN0YW5jZXMgPSAoZm9udCkgPT4ge1xuICBjb25zdCBodG1sID0gT2JqZWN0LmtleXMoZm9udC5kaXN0YW5jZXMpXG4gICAgLm1hcCgob3RoZXJGb250TmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYTogZm9udCxcbiAgICAgICAgYjogd2luZG93LmFuYWx5c2lzW290aGVyRm9udE5hbWVdLFxuICAgICAgICBkaXN0YW5jZTogZm9udC5kaXN0YW5jZXNbb3RoZXJGb250TmFtZV1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZiAoYS5kaXN0YW5jZSA9PT0gYi5kaXN0YW5jZSkgcmV0dXJuIDBcbiAgICAgIGlmIChiLmRpc3RhbmNlID09PSBudWxsIHx8IGEuZGlzdGFuY2UgPiBiLmRpc3RhbmNlKSByZXR1cm4gMVxuICAgICAgaWYgKGEuZGlzdGFuY2UgPT09IG51bGwgfHwgYS5kaXN0YW5jZSA8IGIuZGlzdGFuY2UpIHJldHVybiAtMVxuICAgICAgcmV0dXJuIDBcbiAgICB9KVxuICAgIC5tYXAoc2hvd0Rpc3RhbmNlKVxuICAgIC5tYXAod3JhcCgnZGl2JykpXG4gICAgLnJlZHVjZShhZGQpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXN0YW5jZXMnKS5pbm5lckhUTUwgPSBgXG4gICAgPHA+bW9zdCBzaW1pbGFyPC9wPlxuICAgICR7aHRtbH1cbiAgICA8L3A+bW9zdCBkaWZmZXJlbnQ8L3A+YFxufVxuXG5jb25zdCBmb250RmFjZSA9IChmb250KSA9PiB7XG4gIHJldHVybiBgXG4gIEBmb250LWZhY2Uge1xuICAgIGZvbnQtZmFtaWx5OiBcIiR7Zm9udC5uYW1lfVwiO1xuICAgIHNyYzogdXJsKFwiJHtmb250LmZvbnRVcmx9XCIpXG4gIH1gXG59XG5cbmNvbnN0IGZvbnRSb3cgPSAoZm9udCkgPT4ge1xuICByZXR1cm4gYFxuICAgIDx0cj5cbiAgICAgIDx0ZD4ke3Nob3dGb250KGZvbnQpfTwvdGQ+XG4gICAgICA8dGQ+JHtmb250LnhIZWlnaHR9PC90ZD5cbiAgICAgIDx0ZD4ke2ZvbnQuY29udHJhc3R9PC90ZD5cbiAgICAgIDx0ZD4ke2ZvbnQud2lkdGhSYXRpb308L3RkPlxuICAgICAgPHRkPiR7Zm9udC53aWR0aFZhcmlhbmNlfTwvdGQ+XG4gICAgPC90cj5gXG59XG5cbmNvbnN0IGZvbnRUYWJsZSA9IChyb3dzKSA9PiB7XG4gIHJldHVybiBgXG4gICAgPHRhYmxlPlxuICAgICAgPHRyPlxuICAgICAgICA8dGggb25jbGljaz1cInNvcnQoJ2ZvbnQnKVwiPmZvbnQ8L3RoPlxuICAgICAgICA8dGggb25jbGljaz1cInNvcnQoJ3hIZWlnaHQnKVwiPnggaGVpZ2h0PC90aD5cbiAgICAgICAgPHRoIG9uY2xpY2s9XCJzb3J0KCdjb250cmFzdCcpXCI+Y29udHJhc3Q8L3RoPlxuICAgICAgICA8dGggb25jbGljaz1cInNvcnQoJ3dpZHRoUmF0aW8nKVwiPndpZHRoIHJhdGlvPC90aD5cbiAgICAgICAgPHRoIG9uY2xpY2s9XCJzb3J0KCd3aWR0aFZhcmlhbmNlJylcIj53aWR0aCB2YXJpYW5jZTwvdGg+XG4gICAgICA8L3RyPlxuICAgICAgJHtyb3dzfVxuICAgIDwvdGFibGU+YFxufVxuXG51LnIoJ2FuYWx5c2lzLmpzb24nKVxuICAudGhlbigoYW5hbHlzaXMpID0+IHtcbiAgICB3aW5kb3cuYW5hbHlzaXMgPSBhbmFseXNpc1xuICAgIGNvbnN0IGZvbnRzID0gT2JqZWN0LmtleXMoYW5hbHlzaXMpXG4gICAgICAubWFwKChrZXkpID0+IHsgcmV0dXJuIGFuYWx5c2lzW2tleV0gfSlcbiAgICB3aW5kb3cuZGF0YVdoYXRldmVycyA9IHUubnVtZXJpY0tleXMoZm9udHNbMF0pXG5cbiAgICBjb25zdCBzdHlsZSA9IHdyYXAoJ3N0eWxlJykoXG4gICAgICBmb250c1xuICAgICAgICAubWFwKGZvbnRGYWNlKVxuICAgICAgICAucmVkdWNlKGFkZClcbiAgICApXG4gICAgZG9jdW1lbnQuaGVhZC5pbm5lckhUTUwgKz0gc3R5bGVcblxuICAgIGNvbnN0IGJ5ID0gKHNvcnRCeSkgPT4ge1xuICAgICAgcmV0dXJuIChhLCBiKSA9PiB7XG4gICAgICAgIGlmIChhW3NvcnRCeV0gPCBiW3NvcnRCeV0pIHJldHVybiAtMVxuICAgICAgICBpZiAoYVtzb3J0QnldID4gYltzb3J0QnldKSByZXR1cm4gMVxuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNvcnQgPSAoc29ydEJ5KSA9PiB7XG4gICAgICBjb25zdCB0YWJsZSA9IGZvbnRUYWJsZShcbiAgICAgICAgZm9udHNcbiAgICAgICAgICAuc29ydChieShzb3J0QnkpKVxuICAgICAgICAgIC5tYXAoZm9udFJvdylcbiAgICAgICAgICAucmVkdWNlKGFkZClcbiAgICAgICAgKVxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3cnKS5pbm5lckhUTUwgPSB0YWJsZVxuICAgIH1cbiAgICBzb3J0KCd4SGVpZ2h0JylcbiAgICB3aW5kb3cuc29ydCA9IHNvcnRcbiAgfSlcblxuIiwiZnVuY3Rpb24gdXRpbCAoKSB7XG4gIGNvbnN0IG1lYW4gPSAoYXJyKSA9PiB7XG4gICAgcmV0dXJuIGFyci5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEgKyBiIH0pIC8gYXJyLmxlbmd0aFxuICB9XG5cbiAgY29uc3QgbnVtZXJpY0tleXMgPSAob2JqKSA9PiB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikuZmlsdGVyKChrZXkpID0+IHtcbiAgICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICdudW1iZXInKSB7IHJldHVybiB0cnVlIH1cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBkaXN0YW5jZSA9IChhLCBiKSA9PiB7XG4gICAgY29uc3Qga2V5cyA9IG51bWVyaWNLZXlzKGEpXG4gICAgcmV0dXJuIE1hdGguc3FydChrZXlzLm1hcCgoa2V5KSA9PiB7XG4gICAgICByZXR1cm4gYVtrZXldIC0gYltrZXldXG4gICAgfSkubWFwKChkaWZmKSA9PiB7XG4gICAgICByZXR1cm4gZGlmZiAqIGRpZmZcbiAgICB9KS5yZWR1Y2UoKGEsIGIpID0+IHtcbiAgICAgIHJldHVybiBhICsgYlxuICAgIH0pKVxuICB9XG5cbiAgY29uc3QgZmlyc3ROID0gKG4sIGFycikgPT4ge1xuICAgIHJldHVybiBhcnIuc3BsaWNlKDAsIG4pXG4gIH1cblxuICAvLyBnZW5lcmljIGh0dHAgcmVxdWVzdCBmdW5jdGlvblxuICBjb25zdCByID0gKHVybCkgPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgcmVxID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpXG4gICAgICByZXEub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgICAgICBpZiAocmVxLnJlYWR5U3RhdGUgPT09IDQgJiYgcmVxLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcS5yZXNwb25zZVRleHQpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXEub3BlbignR0VUJywgdXJsLCB0cnVlKVxuICAgICAgcmVxLnNlbmQoKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG4gICAgbWVhbiwgZGlzdGFuY2UsIGZpcnN0TiwgciwgbnVtZXJpY0tleXNcbiAgfSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgdXRpbCgpXG5cbiJdfQ==
