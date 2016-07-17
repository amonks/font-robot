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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /* global opentype */

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
    var x = i % w;
    var y = Math.floor(i / w);
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
    for (var i in data) {
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
    var M = measureString(ctx, font, 'M');
    var N = measureString(ctx, font, 'N');
    var l = measureString(ctx, font, 'l');
    var i = measureString(ctx, font, 'i');
    var s = measureString(ctx, font, 's');
    var g = measureString(ctx, font, 'g');

    var xHeight = x.height / A.height;
    var contrast = O.contrast;
    var widthRatio = _util2.default.mean([M.width / M.height, N.width / N.height]);
    var widthVariance = Math.abs(_util2.default.mean([l.width, i.width]) - _util2.default.mean([A.width, M.width, O.width]));
    var complexity = _util2.default.mean([A.complexity, s.complexity, i.complexity, g.complexity, O.complexity]);

    return {
      name: name, fontUrl: fontUrl,
      xHeight: xHeight, contrast: contrast, widthRatio: widthRatio, widthVariance: widthVariance, complexity: complexity
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
            console.log(val);
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
      console.log('filtered', filtered);
      resolve(filtered);
    });
  };

  var normalize = function normalize(analysis) {
    opts.log('normalizing values');
    return new Promise(function (resolve, reject) {
      var keys = _util2.default.numericKeys(analysis[0]);
      var newAnalysis = analysis;
      console.log(keys[0]);
      keys.map(function (key) {
        console.log('starting key', key);
        console.log('newanalysis', newAnalysis);
        var vals = newAnalysis.map(function (font) {
          return font[key];
        });
        var min = Math.min.apply(Math, _toConsumableArray(vals));
        var max = Math.max.apply(Math, _toConsumableArray(vals));
        var range = max - min;
        console.log(vals, min, max, range);
        var normer = function normer(v) {
          console.log(v, min, range);
          return (v - min) / range;
        };
        newAnalysis = newAnalysis.map(function (font) {
          font[key] = normer(font[key]);
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
};

},{"./util.js":3}],3:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2FuYWx5emUuanMiLCJfc3JjL2ZvbnRzLmpzIiwiX3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNFQTs7OztBQUNBOzs7Ozs7QUFFQTtBQUxBOztBQU1BLElBQU0sTUFBTSxTQUFOLEdBQU0sQ0FBQyxJQUFELEVBQVU7QUFDcEIsVUFBUSxHQUFSLENBQVksS0FBWixFQUFtQixJQUFuQjtBQUNBLFdBQVMsY0FBVCxDQUF3QixLQUF4QixFQUErQixTQUEvQixHQUEyQyxTQUFPLElBQVAsR0FBZ0IsU0FBUyxjQUFULENBQXdCLEtBQXhCLEVBQStCLFNBQTFGO0FBQ0QsQ0FIRDs7QUFLQSxJQUFJLFdBQVksWUFBWTtBQUMxQixNQUFJLElBQUksU0FBUyxhQUFULENBQXVCLEdBQXZCLENBQVI7QUFDQSxJQUFFLEtBQUYsQ0FBUSxPQUFSLEdBQWtCLE1BQWxCO0FBQ0EsV0FBUyxJQUFULENBQWMsV0FBZCxDQUEwQixDQUExQjtBQUNBLFNBQU8sVUFBVSxJQUFWLEVBQWdCLFFBQWhCLEVBQTBCO0FBQy9CLFFBQU0sT0FBTyxLQUFLLFNBQUwsQ0FBZSxJQUFmLENBQWI7QUFDQSxRQUFNLE9BQU8sSUFBSSxPQUFPLElBQVgsQ0FBZ0IsQ0FBQyxJQUFELENBQWhCLEVBQXdCLEVBQUMsTUFBTSxjQUFQLEVBQXhCLENBQWI7QUFDQSxRQUFNLE1BQU0sT0FBTyxHQUFQLENBQVcsZUFBWCxDQUEyQixJQUEzQixDQUFaO0FBQ0EsTUFBRSxJQUFGLEdBQVMsR0FBVDtBQUNBLE1BQUUsUUFBRixHQUFhLFFBQWI7QUFDQSxNQUFFLEtBQUY7QUFDQSxXQUFPLEdBQVAsQ0FBVyxlQUFYLENBQTJCLEdBQTNCO0FBQ0QsR0FSRDtBQVNELENBYmUsRUFBaEI7O0FBZUEsSUFBTSxVQUFVLHFCQUFNO0FBQ3BCLFVBQVE7QUFDTixTQUFLLFNBQVMsY0FBVCxDQUF3QixRQUF4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OlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWwgZm9udHMgKi9cblxuaW1wb3J0IHUgZnJvbSAnLi91dGlsLmpzJ1xuaW1wb3J0IGZvbnRzIGZyb20gJy4vZm9udHMuanMnXG5cbi8vIGxvZ2dpbmcgZnVuY3Rpb25cbmNvbnN0IGxvZyA9ICh0ZXh0KSA9PiB7XG4gIGNvbnNvbGUubG9nKCdsb2cnLCB0ZXh0KVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9nJykuaW5uZXJIVE1MID0gYDxicj4ke3RleHR9YCArIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2cnKS5pbm5lckhUTUxcbn1cblxudmFyIHNhdmVEYXRhID0gKGZ1bmN0aW9uICgpIHtcbiAgbGV0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcbiAgYS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSlcbiAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhLCBmaWxlTmFtZSkge1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkYXRhKVxuICAgIGNvbnN0IGJsb2IgPSBuZXcgd2luZG93LkJsb2IoW2pzb25dLCB7dHlwZTogJ29jdGV0L3N0cmVhbSd9KVxuICAgIGNvbnN0IHVybCA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpXG4gICAgYS5ocmVmID0gdXJsXG4gICAgYS5kb3dubG9hZCA9IGZpbGVOYW1lXG4gICAgYS5jbGljaygpXG4gICAgd2luZG93LlVSTC5yZXZva2VPYmplY3RVUkwodXJsKVxuICB9XG59KCkpXG5cbmNvbnN0IGFuYWx5c3QgPSBmb250cyh7XG4gIGNhbnZhczoge1xuICAgIGN0eDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJyksXG4gICAgd2lkdGg6IDEwMCxcbiAgICBoZWlnaHQ6IDEwMFxuICB9LFxuICBsb2dcbn0pXG5cbmNvbnN0IGFuYWx5emVGb250cyA9ICgpID0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICB1LnIoJ2ZvbnRzLmpzb24nKS50aGVuKCh1cmxzKSA9PiB7XG4gICAgICBhbmFseXN0LmFuYWx5emUodXJscylcbiAgICAgIC50aGVuKChhbmFseXNpcykgPT4ge1xuICAgICAgICBzYXZlRGF0YShhbmFseXNpcywgJ2FuYWx5c2lzLmpzb24nKVxuICAgICAgICByZXR1cm4gcmVzb2x2ZShhbmFseXNpcylcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn1cblxuYW5hbHl6ZUZvbnRzKClcbiIsIi8qIGdsb2JhbCBvcGVudHlwZSAqL1xuXG5pbXBvcnQgdSBmcm9tICcuL3V0aWwuanMnXG5cbmV4cG9ydCBkZWZhdWx0IChvcHRzKSA9PiB7XG4gIGNvbnN0IGNhbnZhcyA9IG9wdHMuY2FudmFzIHx8IHtcbiAgICB3aWR0aDogMTAwLFxuICAgIGhlaWdodDogMTAwXG4gIH1cblxuICBjb25zdCBjbGVhciA9IChjdHgpID0+IHtcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcbiAgfVxuXG4gIGNvbnN0IGdldFBhdGggPSAoZm9udCwgc3RyKSA9PiB7XG4gICAgcmV0dXJuIGZvbnQuZ2V0UGF0aChzdHIsIDE1LCA3MilcbiAgfVxuXG4gIGNvbnN0IGRyYXdQYXRoID0gKGN0eCwgcGF0aCkgPT4ge1xuICAgIGNsZWFyKGN0eClcbiAgICBwYXRoLmRyYXcoY3R4KVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBjb25zdCBnZXRDb29yZHMgPSAoaSwgdykgPT4ge1xuICAgIGNvbnN0IHggPSBpICUgd1xuICAgIGNvbnN0IHkgPSBNYXRoLmZsb29yKGkgLyB3KVxuICAgIHJldHVybiB7eCwgeX1cbiAgfVxuXG4gIC8vIHJldHVybiBzdGF0aXN0aWNzIGFib3V0IGEgc3RyaW5nIChsaWtlIGEgY2hhcmFjdGVyKSBpbiBhIGZvbnRcbiAgY29uc3QgbWVhc3VyZVN0cmluZyA9IChjdHgsIGZvbnQsIHN0cikgPT4ge1xuICAgIGNvbnN0IHBhdGggPSBnZXRQYXRoKGZvbnQsIHN0cilcbiAgICBkcmF3UGF0aChjdHgsIHBhdGgpXG5cbiAgICBjb25zdCBpbWdEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXG4gICAgY29uc3QgZGF0YSA9IGltZ0RhdGEuZGF0YVxuICAgIGxldCBmaXJzdFJvdywgbGFzdFJvdywgZmlyc3RDb2x1bW4sIGxhc3RDb2x1bW5cbiAgICBsZXQgYXJlYSA9IDBcbiAgICBmb3IgKGxldCBpIGluIGRhdGEpIHtcbiAgICAgIGNvbnN0IGNvb3JkcyA9IGdldENvb3JkcyhpLCBjYW52YXMud2lkdGgpXG4gICAgICBjb25zdCB2YWx1ZSA9IGRhdGFbaV1cbiAgICAgIGlmICh2YWx1ZSA+IDApIHtcbiAgICAgICAgYXJlYSA9IGFyZWEgKyAxXG4gICAgICAgIGZpcnN0Um93ID0gZmlyc3RSb3cgPyBNYXRoLm1pbihjb29yZHMueSwgZmlyc3RSb3cpIDogY29vcmRzLnlcbiAgICAgICAgZmlyc3RDb2x1bW4gPSBmaXJzdENvbHVtbiA/IE1hdGgubWluKGNvb3Jkcy54LCBmaXJzdENvbHVtbikgOiBjb29yZHMueFxuICAgICAgICBsYXN0Um93ID0gbGFzdFJvdyA/IE1hdGgubWF4KGNvb3Jkcy55LCBsYXN0Um93KSA6IGNvb3Jkcy55XG4gICAgICAgIGxhc3RDb2x1bW4gPSBsYXN0Q29sdW1uID8gTWF0aC5tYXgoY29vcmRzLngsIGxhc3RDb2x1bW4pIDogY29vcmRzLnhcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgY29tcGxleGl0eSA9IHBhdGguY29tbWFuZHMubGVuZ3RoXG4gICAgY29uc3Qgd2lkdGggPSBNYXRoLmFicyhsYXN0Um93IC0gZmlyc3RSb3cpXG4gICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5hYnMobGFzdENvbHVtbiAtIGZpcnN0Q29sdW1uKVxuICAgIGNvbnN0IGJveCA9IHdpZHRoICogaGVpZ2h0XG4gICAgY29uc3QgY29udHJhc3QgPSBhcmVhIC8gYm94XG5cbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGgsIGhlaWdodCwgYXJlYSwgYm94LCBjb250cmFzdCwgY29tcGxleGl0eVxuICAgIH1cbiAgfVxuXG4gIC8vIHJldHVybiBzdGF0aXN0aWNzIGFib3V0IGEgZm9udFxuICBjb25zdCBtZWFzdXJlRm9udCA9IChjdHgsIGZvbnQsIGZvbnRVcmwpID0+IHtcbiAgICBsZXQgbmFtZVxuICAgIGlmIChmb250Lm5hbWVzLmZ1bGxOYW1lKSB7XG4gICAgICBuYW1lID0gZm9udC5uYW1lcy5mdWxsTmFtZS5lblxuICAgIH0gZWxzZSBpZiAoZm9udC5uYW1lcy5mb250RmFtaWx5KSB7XG4gICAgICBuYW1lID0gZm9udC5uYW1lcy5mb250RmFtaWx5LmVuXG4gICAgfSBlbHNlIHsgcmV0dXJuIG51bGwgfVxuXG4gICAgY29uc3QgQSA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnQScpXG4gICAgY29uc3QgeCA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAneCcpXG4gICAgY29uc3QgTyA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnTycpXG4gICAgY29uc3QgTSA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnTScpXG4gICAgY29uc3QgTiA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnTicpXG4gICAgY29uc3QgbCA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnbCcpXG4gICAgY29uc3QgaSA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnaScpXG4gICAgY29uc3QgcyA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAncycpXG4gICAgY29uc3QgZyA9IG1lYXN1cmVTdHJpbmcoY3R4LCBmb250LCAnZycpXG5cbiAgICBjb25zdCB4SGVpZ2h0ID0geC5oZWlnaHQgLyBBLmhlaWdodFxuICAgIGNvbnN0IGNvbnRyYXN0ID0gTy5jb250cmFzdFxuICAgIGNvbnN0IHdpZHRoUmF0aW8gPSB1Lm1lYW4oW00ud2lkdGggLyBNLmhlaWdodCwgTi53aWR0aCAvIE4uaGVpZ2h0XSlcbiAgICBjb25zdCB3aWR0aFZhcmlhbmNlID0gTWF0aC5hYnModS5tZWFuKFtsLndpZHRoLCBpLndpZHRoXSkgLSB1Lm1lYW4oW0Eud2lkdGgsIE0ud2lkdGgsIE8ud2lkdGhdKSlcbiAgICBjb25zdCBjb21wbGV4aXR5ID0gdS5tZWFuKFtBLmNvbXBsZXhpdHksIHMuY29tcGxleGl0eSwgaS5jb21wbGV4aXR5LCBnLmNvbXBsZXhpdHksIE8uY29tcGxleGl0eV0pXG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSwgZm9udFVybCxcbiAgICAgIHhIZWlnaHQsIGNvbnRyYXN0LCB3aWR0aFJhdGlvLCB3aWR0aFZhcmlhbmNlLCBjb21wbGV4aXR5XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZXhhbWluZSA9IChmb250VXJsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG9wZW50eXBlLmxvYWQoZm9udFVybCwgKGVyciwgZm9udCkgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHsgY29uc29sZS5sb2coZXJyKTsgcmV0dXJuIHJlc29sdmUobnVsbCkgfVxuICAgICAgICAgIGNvbnN0IG1lYXN1cmVtZW50ID0gbWVhc3VyZUZvbnQob3B0cy5jYW52YXMuY3R4LCBmb250LCBmb250VXJsKVxuICAgICAgICAgIHJldHVybiByZXNvbHZlKG1lYXN1cmVtZW50KVxuICAgICAgICB9KVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBvcHRzLmxvZyhlKVxuICAgICAgICByZXNvbHZlKG51bGwpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGZpbHRlck51bGwgPSAoYW5hbHlzaXMpID0+IHtcbiAgICBvcHRzLmxvZygncmVtb3ZpbmcgZXJyb3JlZCBmb250cycpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGtleXMgPSB1Lm51bWVyaWNLZXlzKGFuYWx5c2lzWzBdKVxuICAgICAgY29uc3QgZmlsdGVyZWQgPSBhbmFseXNpcy5maWx0ZXIoKGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKCFpdGVtKSByZXR1cm4gZmFsc2VcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIGtleXMpIHtcbiAgICAgICAgICBjb25zdCB2YWwgPSBpdGVtW2tleV1cbiAgICAgICAgICBjb25zb2xlLmxvZyh2YWwpXG4gICAgICAgICAgaWYgKCh0eXBlb2YgdmFsICE9PSAnbnVtYmVyJykgfHwgKGlzTmFOKHZhbCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0pXG4gICAgICBjb25zb2xlLmxvZygnZmlsdGVyZWQnLCBmaWx0ZXJlZClcbiAgICAgIHJlc29sdmUoZmlsdGVyZWQpXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IG5vcm1hbGl6ZSA9IChhbmFseXNpcykgPT4ge1xuICAgIG9wdHMubG9nKCdub3JtYWxpemluZyB2YWx1ZXMnKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBrZXlzID0gdS5udW1lcmljS2V5cyhhbmFseXNpc1swXSlcbiAgICAgIGxldCBuZXdBbmFseXNpcyA9IGFuYWx5c2lzXG4gICAgICBjb25zb2xlLmxvZyhrZXlzWzBdKVxuICAgICAga2V5cy5tYXAoKGtleSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnc3RhcnRpbmcga2V5Jywga2V5KVxuICAgICAgICBjb25zb2xlLmxvZygnbmV3YW5hbHlzaXMnLCBuZXdBbmFseXNpcylcbiAgICAgICAgY29uc3QgdmFscyA9IG5ld0FuYWx5c2lzLm1hcCgoZm9udCkgPT4geyByZXR1cm4gZm9udFtrZXldIH0pXG4gICAgICAgIGNvbnN0IG1pbiA9IE1hdGgubWluKC4uLnZhbHMpXG4gICAgICAgIGNvbnN0IG1heCA9IE1hdGgubWF4KC4uLnZhbHMpXG4gICAgICAgIGNvbnN0IHJhbmdlID0gbWF4IC0gbWluXG4gICAgICAgIGNvbnNvbGUubG9nKHZhbHMsIG1pbiwgbWF4LCByYW5nZSlcbiAgICAgICAgY29uc3Qgbm9ybWVyID0gKHYpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyh2LCBtaW4sIHJhbmdlKVxuICAgICAgICAgIHJldHVybiAodiAtIG1pbikgLyByYW5nZVxuICAgICAgICB9XG4gICAgICAgIG5ld0FuYWx5c2lzID0gbmV3QW5hbHlzaXMubWFwKChmb250KSA9PiB7XG4gICAgICAgICAgZm9udFtrZXldID0gbm9ybWVyKGZvbnRba2V5XSlcbiAgICAgICAgICByZXR1cm4gZm9udFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIHJlc29sdmUobmV3QW5hbHlzaXMpXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNhbGN1bGF0ZURpc3RhbmNlcyA9IChhbmFseXNpcykgPT4ge1xuICAgIG9wdHMubG9nKCdjYWxjdWxhdGluZyBkaXN0YW5jZXMnKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgY291bnQgPSAwXG4gICAgICBjb25zdCB3aXRoRGlzdGFuY2VzID0gYW5hbHlzaXMubWFwKChmb250KSA9PiB7XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgaWYgKGNvdW50ICUgNTAgPT09IDApIHsgb3B0cy5sb2coYCR7Y291bnR9IG91dCBvZiAke2FuYWx5c2lzLmxlbmd0aH1gKSB9XG4gICAgICAgIGNvbnN0IGRpc3RhbmNlcyA9IGFuYWx5c2lzLm1hcCgob3RoZXJGb250KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHsgbmFtZTogb3RoZXJGb250Lm5hbWUsIGRpc3RhbmNlOiB1LmRpc3RhbmNlKGZvbnQsIG90aGVyRm9udCkgfVxuICAgICAgICB9KS5yZWR1Y2UoKGEsIGIpID0+IHtcbiAgICAgICAgICBhW2IubmFtZV0gPSBiLmRpc3RhbmNlXG4gICAgICAgICAgcmV0dXJuIGFcbiAgICAgICAgfSwge30pXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBmb250LCB7IGRpc3RhbmNlcyB9KVxuICAgICAgfSlcbiAgICAgIHJldHVybiByZXNvbHZlKHdpdGhEaXN0YW5jZXMpXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNsZWFuID0gKGFuYWx5c2lzKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBvdXRwdXQgPSB7fVxuICAgICAgYW5hbHlzaXMubWFwKChmb250KSA9PiB7XG4gICAgICAgIG91dHB1dFtmb250Lm5hbWVdID0gZm9udFxuICAgICAgfSlcbiAgICAgIHJlc29sdmUob3V0cHV0KVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBhbmFseXplID0gKHVybHMpID0+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgUHJvbWlzZS5hbGwodXJscy5tYXAoZXhhbWluZSkpXG4gICAgICAgIC50aGVuKGZpbHRlck51bGwpXG4gICAgICAgIC50aGVuKG5vcm1hbGl6ZSlcbiAgICAgICAgLnRoZW4oY2FsY3VsYXRlRGlzdGFuY2VzKVxuICAgICAgICAudGhlbihjbGVhbilcbiAgICAgICAgLnRoZW4ocmVzb2x2ZSlcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5mcmVlemUoe1xuICAgIGFuYWx5emVcbiAgfSlcbn1cbiIsImZ1bmN0aW9uIHV0aWwgKCkge1xuICBjb25zdCBtZWFuID0gKGFycikgPT4ge1xuICAgIHJldHVybiBhcnIucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhICsgYiB9KSAvIGFyci5sZW5ndGhcbiAgfVxuXG4gIGNvbnN0IG51bWVyaWNLZXlzID0gKG9iaikgPT4ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAnbnVtYmVyJykgeyByZXR1cm4gdHJ1ZSB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgZGlzdGFuY2UgPSAoYSwgYikgPT4ge1xuICAgIGNvbnN0IGtleXMgPSBudW1lcmljS2V5cyhhKVxuICAgIHJldHVybiBNYXRoLnNxcnQoa2V5cy5tYXAoKGtleSkgPT4ge1xuICAgICAgcmV0dXJuIGFba2V5XSAtIGJba2V5XVxuICAgIH0pLm1hcCgoZGlmZikgPT4ge1xuICAgICAgcmV0dXJuIGRpZmYgKiBkaWZmXG4gICAgfSkucmVkdWNlKChhLCBiKSA9PiB7XG4gICAgICByZXR1cm4gYSArIGJcbiAgICB9KSlcbiAgfVxuXG4gIGNvbnN0IGZpcnN0TiA9IChuLCBhcnIpID0+IHtcbiAgICByZXR1cm4gYXJyLnNwbGljZSgwLCBuKVxuICB9XG5cbiAgLy8gZ2VuZXJpYyBodHRwIHJlcXVlc3QgZnVuY3Rpb25cbiAgY29uc3QgciA9ICh1cmwpID0+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IHJlcSA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKVxuICAgICAgcmVxLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHJlcS5yZWFkeVN0YXRlID09PSA0ICYmIHJlcS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXEucmVzcG9uc2VUZXh0KSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVxLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSlcbiAgICAgIHJlcS5zZW5kKClcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5mcmVlemUoe1xuICAgIG1lYW4sIGRpc3RhbmNlLCBmaXJzdE4sIHIsIG51bWVyaWNLZXlzXG4gIH0pXG59XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWwoKVxuXG4iXX0=
