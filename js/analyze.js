(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _util = require('./util.js');

var _util2 = _interopRequireDefault(_util);

var _fonts = require('./fonts.js');

var _fonts2 = _interopRequireDefault(_fonts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// logging function
/* global fonts */

var log = function log(text) {
  console.log('log', text);
  document.getElementById('log').innerHTML = '<br>' + text + document.getElementById('log').innerHTML;
};

var saveData = function () {
  var a = document.createElement('a');
  a.style.display = 'none';
  document.body.appendChild(a);
  return function (data, fileName) {
    var json = JSON.stringify(data);
    var blob = new window.Blob([json], { type: 'octet/stream' });
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
}();

var analyst = (0, _fonts2.default)({
  canvas: {
    ctx: document.getElementById('canvas').getContext('2d'),
    width: 100,
    height: 100
  },
  log: log
});

var analyzeFonts = function analyzeFonts() {
  return new Promise(function (resolve, reject) {
    _util2.default.r('fonts.json').then(function (urls) {
      analyst.analyze(urls).then(function (analysis) {
        saveData(analysis, 'analysis.json');
        return resolve(analysis);
      });
    });
  });
};

analyzeFonts();

},{"./fonts.js":2,"./util.js":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('./util.js');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (opts) {
  var canvas = opts.canvas || {
    width: 100,
    height: 100
  };

  var clear = function clear(ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  var getPath = function getPath(font, str) {
    return font.getPath(str, 15, 72);
  };

  var drawPath = function drawPath(ctx, path) {
    clear(ctx);
    path.draw(ctx);
    return true;
  };

  var getCoords = function getCoords(i, w) {
    var pixel = Math.floor(i / 4);
    var x = pixel % w;
    var y = Math.floor(pixel / w);
    return { x: x, y: y };
  };

  // return statistics about a string (like a character) in a font
  var measureString = function measureString(ctx, font, str) {
    var path = getPath(font, str);
    drawPath(ctx, path);

    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imgData.data;
    var firstRow = void 0,
        lastRow = void 0,
        firstColumn = void 0,
        lastColumn = void 0;
    var area = 0;
    for (var i = 3; i < canvas.width * canvas.height * 4; i += 4) {
      var coords = getCoords(i, canvas.width);
      var value = data[i];
      if (value > 0) {
        area = area + 1;
        firstRow = firstRow ? Math.min(coords.y, firstRow) : coords.y;
        firstColumn = firstColumn ? Math.min(coords.x, firstColumn) : coords.x;
        lastRow = lastRow ? Math.max(coords.y, lastRow) : coords.y;
        lastColumn = lastColumn ? Math.max(coords.x, lastColumn) : coords.x;
      }
    }
    var complexity = path.commands.length;
    var width = Math.abs(lastRow - firstRow);
    var height = Math.abs(lastColumn - firstColumn);
    var box = width * height;
    var contrast = area / box;

    return {
      width: width, height: height, area: area, box: box, contrast: contrast, complexity: complexity
    };
  };

  // return statistics about a font
  var measureFont = function measureFont(ctx, font, fontUrl) {
    var name = void 0;
    if (font.names.fullName) {
      name = font.names.fullName.en;
    } else if (font.names.fontFamily) {
      name = font.names.fontFamily.en;
    } else {
      return null;
    }

    var A = measureString(ctx, font, 'A');
    var x = measureString(ctx, font, 'x');
    var O = measureString(ctx, font, 'O');
    var o = measureString(ctx, font, 'o');
    var M = measureString(ctx, font, 'M');
    var N = measureString(ctx, font, 'N');
    var l = measureString(ctx, font, 'l');
    var i = measureString(ctx, font, 'i');
    var s = measureString(ctx, font, 's');
    var g = measureString(ctx, font, 'g');

    var xHeight = x.height / A.height;
    var contrast = O.contrast;
    var ungeometism = _util2.default.mean([Math.abs(o.width - o.height), Math.abs(O.width - O.height)]);
    var sansitude = l.contrast;
    var widthRatio = _util2.default.mean([M.width / M.height, N.width / N.height]);
    var widthVariance = Math.abs(_util2.default.mean([l.width, i.width]) - _util2.default.mean([A.width, M.width, O.width]));
    var complexity = _util2.default.mean([A.complexity, s.complexity, i.complexity, g.complexity, O.complexity]);

    return {
      name: name, fontUrl: fontUrl,
      xHeight: xHeight, contrast: contrast, widthRatio: widthRatio, widthVariance: widthVariance, complexity: complexity, sansitude: sansitude, ungeometism: ungeometism
    };
  };

  var examine = function examine(fontUrl) {
    return new Promise(function (resolve, reject) {
      try {
        opentype.load(fontUrl, function (err, font) {
          if (err) {
            console.log(err);return resolve(null);
          }
          var measurement = measureFont(opts.canvas.ctx, font, fontUrl);
          return resolve(measurement);
        });
      } catch (e) {
        opts.log(e);
        resolve(null);
      }
    });
  };

  var filterNull = function filterNull(analysis) {
    opts.log('removing errored fonts');
    return new Promise(function (resolve, reject) {
      var keys = _util2.default.numericKeys(analysis[0]);
      var filtered = analysis.filter(function (item) {
        if (!item) return false;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            var val = item[key];
            if (typeof val !== 'number' || isNaN(val)) {
              return false;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return true;
      });
      resolve(filtered);
    });
  };

  var normalize = function normalize(analysis) {
    opts.log('normalizing values');
    return new Promise(function (resolve, reject) {
      var keys = _util2.default.numericKeys(analysis[0]);
      var newAnalysis = analysis;
      keys.map(function (key) {
        var vals = newAnalysis.map(function (font) {
          return font[key];
        });
        var normer = _util2.default.makeNormalNormer(vals);
        newAnalysis = newAnalysis.map(function (font) {
          var newVal = normer(font[key]);
          font[key] = newVal;
          return font;
        });
      });
      resolve(newAnalysis);
    });
  };

  var calculateDistances = function calculateDistances(analysis) {
    opts.log('calculating distances');
    return new Promise(function (resolve, reject) {
      var count = 0;
      var withDistances = analysis.map(function (font) {
        count += 1;
        if (count % 50 === 0) {
          opts.log(count + ' out of ' + analysis.length);
        }
        var distances = analysis.map(function (otherFont) {
          return { name: otherFont.name, distance: _util2.default.distance(font, otherFont) };
        }).reduce(function (a, b) {
          a[b.name] = b.distance;
          return a;
        }, {});
        return Object.assign({}, font, { distances: distances });
      });
      return resolve(withDistances);
    });
  };

  var clean = function clean(analysis) {
    return new Promise(function (resolve, reject) {
      var output = {};
      analysis.map(function (font) {
        output[font.name] = font;
      });
      resolve(output);
    });
  };

  var analyze = function analyze(urls) {
    return new Promise(function (resolve, reject) {
      Promise.all(urls.map(examine)).then(filterNull).then(normalize).then(calculateDistances).then(clean).then(resolve);
    });
  };

  return Object.freeze({
    analyze: analyze
  });
}; /* global opentype */

},{"./util.js":3}],3:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2FuYWx5emUuanMiLCJfc3JjL2ZvbnRzLmpzIiwiX3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNFQTs7OztBQUNBOzs7Ozs7QUFFQTtBQUxBOztBQU1BLElBQU0sTUFBTSxTQUFOLEdBQU0sQ0FBQyxJQUFELEVBQVU7QUFDcEIsVUFBUSxHQUFSLENBQVksS0FBWixFQUFtQixJQUFuQjtBQUNBLFdBQVMsY0FBVCxDQUF3QixLQUF4QixFQUErQixTQUEvQixHQUEyQyxTQUFPLElBQVAsR0FBZ0IsU0FBUyxjQUFULENBQXdCLEtBQXhCLEVBQStCLFNBQTFGO0FBQ0QsQ0FIRDs7QUFLQSxJQUFJLFdBQVksWUFBWTtBQUMxQixNQUFJLElBQUksU0FBUyxhQUFULENBQXVCLEdBQXZCLENBQVI7QUFDQSxJQUFFLEtBQUYsQ0FBUSxPQUFSLEdBQWtCLE1BQWxCO0FBQ0EsV0FBUyxJQUFULENBQWMsV0FBZCxDQUEwQixDQUExQjtBQUNBLFNBQU8sVUFBVSxJQUFWLEVBQWdCLFFBQWhCLEVBQTBCO0FBQy9CLFFBQU0sT0FBTyxLQUFLLFNBQUwsQ0FBZSxJQUFmLENBQWI7QUFDQSxRQUFNLE9BQU8sSUFBSSxPQUFPLElBQVgsQ0FBZ0IsQ0FBQyxJQUFELENBQWhCLEVBQXdCLEVBQUMsTUFBTSxjQUFQLEVBQXhCLENBQWI7QUFDQSxRQUFNLE1BQU0sT0FBTyxHQUFQLENBQVcsZUFBWCxDQUEyQixJQUEzQixDQUFaO0FBQ0EsTUFBRSxJQUFGLEdBQVMsR0FBVDtBQUNBLE1BQUUsUUFBRixHQUFhLFFBQWI7QUFDQSxNQUFFLEtBQUY7QUFDQSxXQUFPLEdBQVAsQ0FBVyxlQUFYLENBQTJCLEdBQTNCO0FBQ0QsR0FSRDtBQVNELENBYmUsRUFBaEI7O0FBZUEsSUFBTSxVQUFVLHFCQUFNO0FBQ3BCLFVBQVE7QUFDTixTQUFLLFNBQVMsY0FBVCxDQUF3QixRQUF4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QUZEOztBQUlBO0FBQ0EsTUFBTSxJQUFJLFNBQUosQ0FBSSxDQUFDLEdBQUQsRUFBUztBQUNqQixXQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsVUFBSSxNQUFNLElBQUksT0FBTyxjQUFYLEVBQVY7QUFDQSxVQUFJLGtCQUFKLEdBQXlCLFlBQU07QUFDN0IsWUFBSSxJQUFJLFVBQUosS0FBbUIsQ0FBbkIsSUFBd0IsSUFBSSxNQUFKLEtBQWUsR0FBM0MsRUFBZ0Q7QUFDOUMsa0JBQVEsS0FBSyxLQUFMLENBQVcsSUFBSSxZQUFmLENBQVI7QUFDRDtBQUNGLE9BSkQ7QUFLQSxVQUFJLElBQUosQ0FBUyxLQUFULEVBQWdCLEdBQWhCLEVBQXFCLElBQXJCO0FBQ0EsVUFBSSxJQUFKO0FBQ0QsS0FUTSxDQUFQO0FBVUQsR0FYRDs7QUFhQSxTQUFPLE9BQU8sTUFBUCxDQUFjO0FBQ25CLGNBRG1CLEVBQ2Isa0JBRGEsRUFDSCxjQURHLEVBQ0ssSUFETCxFQUNRLHdCQURSLEVBQ3FCLFFBRHJCLEVBQzBCLGNBRDFCLEVBQ2tDLHNCQURsQyxFQUM4QztBQUQ5QyxHQUFkLENBQVA7QUFHRDs7a0JBRWMsTSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWwgZm9udHMgKi9cblxuaW1wb3J0IHUgZnJvbSAnLi91dGlsLmpzJ1xuaW1wb3J0IGZvbnRzIGZyb20gJy4vZm9udHMuanMnXG5cbi8vIGxvZ2dpbmcgZnVuY3Rpb25cbmNvbnN0IGxvZyA9ICh0ZXh0KSA9PiB7XG4gIGNvbnNvbGUubG9nKCdsb2cnLCB0ZXh0KVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9nJykuaW5uZXJIVE1MID0gYDxicj4ke3RleHR9YCArIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2cnKS5pbm5lckhUTUxcbn1cblxudmFyIHNhdmVEYXRhID0gKGZ1bmN0aW9uICgpIHtcbiAgbGV0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcbiAgYS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSlcbiAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhLCBmaWxlTmFtZSkge1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkYXRhKVxuICAgIGNvbnN0IGJsb2IgPSBuZXcgd2luZG93LkJsb2IoW2pzb25dLCB7dHlwZTogJ29jdGV0L3N0cmVhbSd9KVxuICAgIGNvbnN0IHVybCA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpXG4gICAgYS5ocmVmID0gdXJsXG4gICAgYS5kb3dubG9hZCA9IGZpbGVOYW1lXG4gICAgYS5jbGljaygpXG4gICAgd2luZG93LlVSTC5yZXZva2VPYmplY3RVUkwodXJsKVxuICB9XG59KCkpXG5cbmNvbnN0IGFuYWx5c3QgPSBmb250cyh7XG4gIGNhbnZhczoge1xuICAgIGN0eDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJyksXG4gICAgd2lkdGg6IDEwMCxcbiAgICBoZWlnaHQ6IDEwMFxuICB9LFxuICBsb2dcbn0pXG5cbmNvbnN0IGFuYWx5emVGb250cyA9ICgpID0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICB1LnIoJ2ZvbnRzLmpzb24nKS50aGVuKCh1cmxzKSA9PiB7XG4gICAgICBhbmFseXN0LmFuYWx5emUodXJscylcbiAgICAgIC50aGVuKChhbmFseXNpcykgPT4ge1xuICAgICAgICBzYXZlRGF0YShhbmFseXNpcywgJ2FuYWx5c2lzLmpzb24nKVxuICAgICAgICByZXR1cm4gcmVzb2x2ZShhbmFseXNpcylcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn1cblxuYW5hbHl6ZUZvbnRzKClcbiIsIi8qIGdsb2JhbCBvcGVudHlwZSAqL1xuXG5pbXBvcnQgdSBmcm9tICcuL3V0aWwuanMnXG5cbmV4cG9ydCBkZWZhdWx0IChvcHRzKSA9PiB7XG4gIGNvbnN0IGNhbnZhcyA9IG9wdHMuY2FudmFzIHx8IHtcbiAgICB3aWR0aDogMTAwLFxuICAgIGhlaWdodDogMTAwXG4gIH1cblxuICBjb25zdCBjbGVhciA9IChjdHgpID0+IHtcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcbiAgfVxuXG4gIGNvbnN0IGdldFBhdGggPSAoZm9udCwgc3RyKSA9PiB7XG4gICAgcmV0dXJuIGZvbnQuZ2V0UGF0aChzdHIsIDE1LCA3MilcbiAgfVxuXG4gIGNvbnN0IGRyYXdQYXRoID0gKGN0eCwgcGF0aCkgPT4ge1xuICAgIGNsZWFyKGN0eClcbiAgICBwYXRoLmRyYXcoY3R4KVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBjb25zdCBnZXRDb29yZHMgPSAoaSwgdykgPT4ge1xuICAgIGNvbnN0IHBpeGVsID0gTWF0aC5mbG9vcihpIC8gNClcbiAgICBjb25zdCB4ID0gcGl4ZWwgJSB3XG4gICAgY29uc3QgeSA9IE1hdGguZmxvb3IocGl4ZWwgLyB3KVxuICAgIHJldHVybiB7eCwgeX1cbiAgfVxuXG4gIC8vIHJldHVybiBzdGF0aXN0aWNzIGFib3V0IGEgc3RyaW5nIChsaWtlIGEgY2hhcmFjdGVyKSBpbiBhIGZvbnRcbiAgY29uc3QgbWVhc3VyZVN0cmluZyA9IChjdHgsIGZvbnQsIHN0cikgPT4ge1xuICAgIGNvbnN0IHBhdGggPSBnZXRQYXRoKGZvbnQsIHN0cilcbiAgICBkcmF3UGF0aChjdHgsIHBhdGgpXG5cbiAgICBjb25zdCBpbWdEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXG4gICAgY29uc3QgZGF0YSA9IGltZ0RhdGEuZGF0YVxuICAgIGxldCBmaXJzdFJvdywgbGFzdFJvdywgZmlyc3RDb2x1bW4sIGxhc3RDb2x1bW5cbiAgICBsZXQgYXJlYSA9IDBcbiAgICBmb3IgKGxldCBpID0gMzsgaSA8IGNhbnZhcy53aWR0aCAqIGNhbnZhcy5oZWlnaHQgKiA0OyBpICs9IDQpIHtcbiAgICAgIGNvbnN0IGNvb3JkcyA9IGdldENvb3JkcyhpLCBjYW52YXMud2lkdGgpXG4gICAgICBjb25zdCB2YWx1ZSA9IGRhdGFbaV1cbiAgICAgIGlmICh2YWx1ZSA+IDApIHtcbiAgICAgICAgYXJlYSA9IGFyZWEgKyAxXG4gICAgICAgIGZpcnN0Um93ID0gZmlyc3RSb3cgPyBNYXRoLm1pbihjb29yZHMueSwgZmlyc3RSb3cpIDogY29vcmRzLnlcbiAgICAgICAgZmlyc3RDb2x1bW4gPSBmaXJzdENvbHVtbiA/IE1hdGgubWluKGNvb3Jkcy54LCBmaXJzdENvbHVtbikgOiBjb29yZHMueFxuICAgICAgICBsYXN0Um93ID0gbGFzdFJvdyA/IE1hdGgubWF4KGNvb3Jkcy55LCBsYXN0Um93KSA6IGNvb3Jkcy55XG4gICAgICAgIGxhc3RDb2x1bW4gPSBsYXN0Q29sdW1uID8gTWF0aC5tYXgoY29vcmRzLngsIGxhc3RDb2x1bW4pIDogY29vcmRzLnhcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgY29tcGxleGl0eSA9IHBhdGguY29tbWFuZHMubGVuZ3RoXG4gICAgY29uc3Qgd2lkdGggPSBNYXRoLmFicyhsYXN0Um93IC0gZmlyc3RSb3cpXG4gICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5hYnMobGFzdENvbHVtbiAtIGZpcnN0Q29sdW1uKVxuICAgIGNvbnN0IGJveCA9IHdpZHRoICogaGVpZ2h0XG4gICAgY29uc3QgY29udHJhc3QgPSBhcmVhIC8gYm94XG5cbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGgsIGhlaWdodCwgYXJlYSwgYm94LCBjb250cmFzdCwgY29tcGxleGl0eVxuICAgIH1cbiAgfVxuXG4gIC8vIHJldHVybiBzdGF0aXN0aWNzIGFib3V0IGEgZm9udFxuICBjb25zdCBtZWFzdXJlRm9udCA9IChjdHgsIGZvbnQsIGZvbnRVcmwpID0+IHtcbiAgICBsZXQgbmFtZVxuICAgIGlmIChmb250Lm5hbWVzLmZ1bGxOYW1lKSB7XG4gICAgICBuYW1lID0gZm9udC5uYW1lcy5mdWxsTmFtZS5lblxuICAgIH0gZWxzZSBpZiAoZm9udC5uYW1lcy5mb250RmFtaWx5KSB7XG4gICAgICBuYW1lID0gZm9udC5uYW1lcy5mb250RmFtaWx5LmVuXG4gICAgfSBlbHNlIHsgcmV0dXJuIG51bGwgfVxuXG4gICAgY29uc3QgQSA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnQScpXG4gICAgY29uc3QgeCA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAneCcpXG4gICAgY29uc3QgTyA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnTycpXG4gICAgY29uc3QgbyA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnbycpXG4gICAgY29uc3QgTSA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnTScpXG4gICAgY29uc3QgTiA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnTicpXG4gICAgY29uc3QgbCA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnbCcpXG4gICAgY29uc3QgaSA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnaScpXG4gICAgY29uc3QgcyA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAncycpXG4gICAgY29uc3QgZyA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnZycpXG5cbiAgICBjb25zdCB4SGVpZ2h0ID0geC5oZWlnaHQgLyBBLmhlaWdodFxuICAgIGNvbnN0IGNvbnRyYXN0ID0gTy5jb250cmFzdFxuICAgIGNvbnN0IHVuZ2VvbWV0aXNtID0gdS5tZWFuKFtNYXRoLmFicyhvLndpZHRoIC0gby5oZWlnaHQpLCBNYXRoLmFicyhPLndpZHRoIC0gTy5oZWlnaHQpXSlcbiAgICBjb25zdCBzYW5zaXR1ZGUgPSBsLmNvbnRyYXN0XG4gICAgY29uc3Qgd2lkdGhSYXRpbyA9IHUubWVhbihbTS53aWR0aCAvIE0uaGVpZ2h0LCBOLndpZHRoIC8gTi5oZWlnaHRdKVxuICAgIGNvbnN0IHdpZHRoVmFyaWFuY2UgPSBNYXRoLmFicyh1Lm1lYW4oW2wud2lkdGgsIGkud2lkdGhdKSAtIHUubWVhbihbQS53aWR0aCwgTS53aWR0aCwgTy53aWR0aF0pKVxuICAgIGNvbnN0IGNvbXBsZXhpdHkgPSB1Lm1lYW4oW0EuY29tcGxleGl0eSwgcy5jb21wbGV4aXR5LCBpLmNvbXBsZXhpdHksIGcuY29tcGxleGl0eSwgTy5jb21wbGV4aXR5XSlcblxuICAgIHJldHVybiB7XG4gICAgICBuYW1lLCBmb250VXJsLFxuICAgICAgeEhlaWdodCwgY29udHJhc3QsIHdpZHRoUmF0aW8sIHdpZHRoVmFyaWFuY2UsIGNvbXBsZXhpdHksIHNhbnNpdHVkZSwgdW5nZW9tZXRpc21cbiAgICB9XG4gIH1cblxuICBjb25zdCBleGFtaW5lID0gKGZvbnRVcmwpID0+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgb3BlbnR5cGUubG9hZChmb250VXJsLCAoZXJyLCBmb250KSA9PiB7XG4gICAgICAgICAgaWYgKGVycikgeyBjb25zb2xlLmxvZyhlcnIpOyByZXR1cm4gcmVzb2x2ZShudWxsKSB9XG4gICAgICAgICAgY29uc3QgbWVhc3VyZW1lbnQgPSBtZWFzdXJlRm9udChvcHRzLmNhbnZhcy5jdHgsIGZvbnQsIGZvbnRVcmwpXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUobWVhc3VyZW1lbnQpXG4gICAgICAgIH0pXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIG9wdHMubG9nKGUpXG4gICAgICAgIHJlc29sdmUobnVsbClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgZmlsdGVyTnVsbCA9IChhbmFseXNpcykgPT4ge1xuICAgIG9wdHMubG9nKCdyZW1vdmluZyBlcnJvcmVkIGZvbnRzJylcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qga2V5cyA9IHUubnVtZXJpY0tleXMoYW5hbHlzaXNbMF0pXG4gICAgICBjb25zdCBmaWx0ZXJlZCA9IGFuYWx5c2lzLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgICBpZiAoIWl0ZW0pIHJldHVybiBmYWxzZVxuICAgICAgICBmb3IgKGxldCBrZXkgb2Yga2V5cykge1xuICAgICAgICAgIGNvbnN0IHZhbCA9IGl0ZW1ba2V5XVxuICAgICAgICAgIGlmICgodHlwZW9mIHZhbCAhPT0gJ251bWJlcicpIHx8IChpc05hTih2YWwpKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9KVxuICAgICAgcmVzb2x2ZShmaWx0ZXJlZClcbiAgICB9KVxuICB9XG5cbiAgY29uc3Qgbm9ybWFsaXplID0gKGFuYWx5c2lzKSA9PiB7XG4gICAgb3B0cy5sb2coJ25vcm1hbGl6aW5nIHZhbHVlcycpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGtleXMgPSB1Lm51bWVyaWNLZXlzKGFuYWx5c2lzWzBdKVxuICAgICAgbGV0IG5ld0FuYWx5c2lzID0gYW5hbHlzaXNcbiAgICAgIGtleXMubWFwKChrZXkpID0+IHtcbiAgICAgICAgY29uc3QgdmFscyA9IG5ld0FuYWx5c2lzLm1hcCgoZm9udCkgPT4geyByZXR1cm4gZm9udFtrZXldIH0pXG4gICAgICAgIGNvbnN0IG5vcm1lciA9IHUubWFrZU5vcm1hbE5vcm1lcih2YWxzKVxuICAgICAgICBuZXdBbmFseXNpcyA9IG5ld0FuYWx5c2lzLm1hcCgoZm9udCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5ld1ZhbCA9IG5vcm1lcihmb250W2tleV0pXG4gICAgICAgICAgZm9udFtrZXldID0gbmV3VmFsXG4gICAgICAgICAgcmV0dXJuIGZvbnRcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICByZXNvbHZlKG5ld0FuYWx5c2lzKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBjYWxjdWxhdGVEaXN0YW5jZXMgPSAoYW5hbHlzaXMpID0+IHtcbiAgICBvcHRzLmxvZygnY2FsY3VsYXRpbmcgZGlzdGFuY2VzJylcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IGNvdW50ID0gMFxuICAgICAgY29uc3Qgd2l0aERpc3RhbmNlcyA9IGFuYWx5c2lzLm1hcCgoZm9udCkgPT4ge1xuICAgICAgICBjb3VudCArPSAxXG4gICAgICAgIGlmIChjb3VudCAlIDUwID09PSAwKSB7IG9wdHMubG9nKGAke2NvdW50fSBvdXQgb2YgJHthbmFseXNpcy5sZW5ndGh9YCkgfVxuICAgICAgICBjb25zdCBkaXN0YW5jZXMgPSBhbmFseXNpcy5tYXAoKG90aGVyRm9udCkgPT4ge1xuICAgICAgICAgIHJldHVybiB7IG5hbWU6IG90aGVyRm9udC5uYW1lLCBkaXN0YW5jZTogdS5kaXN0YW5jZShmb250LCBvdGhlckZvbnQpIH1cbiAgICAgICAgfSkucmVkdWNlKChhLCBiKSA9PiB7XG4gICAgICAgICAgYVtiLm5hbWVdID0gYi5kaXN0YW5jZVxuICAgICAgICAgIHJldHVybiBhXG4gICAgICAgIH0sIHt9KVxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZm9udCwgeyBkaXN0YW5jZXMgfSlcbiAgICAgIH0pXG4gICAgICByZXR1cm4gcmVzb2x2ZSh3aXRoRGlzdGFuY2VzKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBjbGVhbiA9IChhbmFseXNpcykgPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgb3V0cHV0ID0ge31cbiAgICAgIGFuYWx5c2lzLm1hcCgoZm9udCkgPT4ge1xuICAgICAgICBvdXRwdXRbZm9udC5uYW1lXSA9IGZvbnRcbiAgICAgIH0pXG4gICAgICByZXNvbHZlKG91dHB1dClcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgYW5hbHl6ZSA9ICh1cmxzKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIFByb21pc2UuYWxsKHVybHMubWFwKGV4YW1pbmUpKVxuICAgICAgICAudGhlbihmaWx0ZXJOdWxsKVxuICAgICAgICAudGhlbihub3JtYWxpemUpXG4gICAgICAgIC50aGVuKGNhbGN1bGF0ZURpc3RhbmNlcylcbiAgICAgICAgLnRoZW4oY2xlYW4pXG4gICAgICAgIC50aGVuKHJlc29sdmUpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICBhbmFseXplXG4gIH0pXG59XG4iLCJmdW5jdGlvbiB1dGlsICgpIHtcbiAgY29uc3QgYWRkID0gKGEsIGIpID0+IHtcbiAgICByZXR1cm4gYSArIGJcbiAgfVxuXG4gIGNvbnN0IGNvbmNhdCA9IChhLCBiKSA9PiB7XG4gICAgcmV0dXJuIGEuY29uY2F0KGIpXG4gIH1cblxuICBjb25zdCBtZWFuID0gKGFycikgPT4ge1xuICAgIHJldHVybiBhcnIucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhICsgYiB9KSAvIGFyci5sZW5ndGhcbiAgfVxuXG4gIGNvbnN0IG51bWVyaWNLZXlzID0gKG9iaikgPT4ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAnbnVtYmVyJykgeyByZXR1cm4gdHJ1ZSB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgZGlzdGFuY2UgPSAoYSwgYikgPT4ge1xuICAgIGNvbnN0IGtleXMgPSBudW1lcmljS2V5cyhhKVxuICAgIHJldHVybiBNYXRoLnNxcnQoa2V5cy5tYXAoKGtleSkgPT4ge1xuICAgICAgcmV0dXJuIGFba2V5XSAtIGJba2V5XVxuICAgIH0pLm1hcCgoZGlmZikgPT4ge1xuICAgICAgcmV0dXJuIGRpZmYgKiBkaWZmXG4gICAgfSkucmVkdWNlKChhLCBiKSA9PiB7XG4gICAgICByZXR1cm4gYSArIGJcbiAgICB9LCAwKSlcbiAgfVxuXG4gIGNvbnN0IGZpcnN0TiA9IChuLCBhcnIpID0+IHtcbiAgICByZXR1cm4gYXJyLnNwbGljZSgwLCBuKVxuICB9XG5cbiAgY29uc3QgbWFrZU5vcm1lciA9IChmcm9tLCB0bywgdmFsdWVzKSA9PiB7XG4gICAgY29uc3QgbWF4ID0gTWF0aC5tYXgoLi4udmFsdWVzKVxuICAgIGNvbnN0IG1pbiA9IE1hdGgubWluKC4uLnZhbHVlcylcbiAgICBjb25zdCByYW5nZSA9IG1heCAtIG1pblxuICAgIGNvbnN0IG5ld1JhbmdlID0gdG8gLSBmcm9tXG4gICAgcmV0dXJuICh2YWx1ZSkgPT4ge1xuICAgICAgcmV0dXJuICgodmFsdWUgLSBtaW4pIC8gcmFuZ2UpICogbmV3UmFuZ2UgKyBmcm9tXG4gICAgfVxuICB9XG5cbiAgY29uc3QgbWFrZU5vcm1hbE5vcm1lciA9ICh2YWx1ZXMpID0+IHtcbiAgICByZXR1cm4gbWFrZU5vcm1lcigwLCAxMDAsIHZhbHVlcylcbiAgfVxuXG4gIC8vIGdlbmVyaWMgaHR0cCByZXF1ZXN0IGZ1bmN0aW9uXG4gIGNvbnN0IHIgPSAodXJsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCByZXEgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KClcbiAgICAgIHJlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCAmJiByZXEuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVxLnJlc3BvbnNlVGV4dCkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlcS5vcGVuKCdHRVQnLCB1cmwsIHRydWUpXG4gICAgICByZXEuc2VuZCgpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICBtZWFuLCBkaXN0YW5jZSwgZmlyc3ROLCByLCBudW1lcmljS2V5cywgYWRkLCBjb25jYXQsIG1ha2VOb3JtZXIsIG1ha2VOb3JtYWxOb3JtZXJcbiAgfSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgdXRpbCgpXG5cbiJdfQ==
