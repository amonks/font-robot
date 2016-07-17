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

  var drawString = function drawString(ctx, font, str) {
    clear(ctx);
    return font.draw(ctx, str, 0, 72);
  };

  var getCoords = function getCoords(i, w) {
    var x = i % w;
    var y = Math.floor(i / w);
    return { x: x, y: y };
  };

  // return statistics about a string (like a character) in a font
  var measureString = function measureString(ctx, font, str) {
    drawString(ctx, font, str);

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
    var width = Math.abs(lastRow - firstRow);
    var height = Math.abs(lastColumn - firstColumn);
    var box = width * height;
    var contrast = area / box;

    return {
      width: width, height: height, area: area, box: box, contrast: contrast
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

    var xHeight = x.height / A.height;
    var contrast = O.contrast;
    var widthRatio = _util2.default.mean([M.width / M.height, N.width / N.height]);
    var widthVariance = Math.abs(_util2.default.mean([l.width, i.width]) - _util2.default.mean([A.width, M.width, O.width]));

    return {
      name: name, fontUrl: fontUrl,
      xHeight: xHeight, contrast: contrast, widthRatio: widthRatio, widthVariance: widthVariance
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2FuYWx5emUuanMiLCJfc3JjL2ZvbnRzLmpzIiwiX3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNFQTs7OztBQUNBOzs7Ozs7QUFFQTtBQUxBOztBQU1BLElBQU0sTUFBTSxTQUFOLEdBQU0sQ0FBQyxJQUFELEVBQVU7QUFDcEIsVUFBUSxHQUFSLENBQVksS0FBWixFQUFtQixJQUFuQjtBQUNBLFdBQVMsY0FBVCxDQUF3QixLQUF4QixFQUErQixTQUEvQixHQUEyQyxTQUFPLElBQVAsR0FBZ0IsU0FBUyxjQUFULENBQXdCLEtBQXhCLEVBQStCLFNBQTFGO0FBQ0QsQ0FIRDs7QUFLQSxJQUFJLFdBQVksWUFBWTtBQUMxQixNQUFJLElBQUksU0FBUyxhQUFULENBQXVCLEdBQXZCLENBQVI7QUFDQSxJQUFFLEtBQUYsQ0FBUSxPQUFSLEdBQWtCLE1BQWxCO0FBQ0EsV0FBUyxJQUFULENBQWMsV0FBZCxDQUEwQixDQUExQjtBQUNBLFNBQU8sVUFBVSxJQUFWLEVBQWdCLFFBQWhCLEVBQTBCO0FBQy9CLFFBQU0sT0FBTyxLQUFLLFNBQUwsQ0FBZSxJQUFmLENBQWI7QUFDQSxRQUFNLE9BQU8sSUFBSSxPQUFPLElBQVgsQ0FBZ0IsQ0FBQyxJQUFELENBQWhCLEVBQXdCLEVBQUMsTUFBTSxjQUFQLEVBQXhCLENBQWI7QUFDQSxRQUFNLE1BQU0sT0FBTyxHQUFQLENBQVcsZUFBWCxDQUEyQixJQUEzQixDQUFaO0FBQ0EsTUFBRSxJQUFGLEdBQVMsR0FBVDtBQUNBLE1BQUUsUUFBRixHQUFhLFFBQWI7QUFDQSxNQUFFLEtBQUY7QUFDQSxXQUFPLEdBQVAsQ0FBVyxlQUFYLENBQTJCLEdBQTNCO0FBQ0QsR0FSRDtBQVNELENBYmUsRUFBaEI7O0FBZUEsSUFBTSxVQUFVLHFCQUFNO0FBQ3BCLFVBQVE7QUFDTixTQUFLLFNBQVMsY0FBVCxDQUF3QixRQUF4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Q0FBQyxHQUFELEVBQVM7QUFDakIsV0FBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3RDLFVBQUksTUFBTSxJQUFJLE9BQU8sY0FBWCxFQUFWO0FBQ0EsVUFBSSxrQkFBSixHQUF5QixZQUFNO0FBQzdCLFlBQUksSUFBSSxVQUFKLEtBQW1CLENBQW5CLElBQXdCLElBQUksTUFBSixLQUFlLEdBQTNDLEVBQWdEO0FBQzlDLGtCQUFRLEtBQUssS0FBTCxDQUFXLElBQUksWUFBZixDQUFSO0FBQ0Q7QUFDRixPQUpEO0FBS0EsVUFBSSxJQUFKLENBQVMsS0FBVCxFQUFnQixHQUFoQixFQUFxQixJQUFyQjtBQUNBLFVBQUksSUFBSjtBQUNELEtBVE0sQ0FBUDtBQVVELEdBWEQ7O0FBYUEsU0FBTyxPQUFPLE1BQVAsQ0FBYztBQUNuQixjQURtQixFQUNiLGtCQURhLEVBQ0gsY0FERyxFQUNLLElBREwsRUFDUTtBQURSLEdBQWQsQ0FBUDtBQUdEOztrQkFFYyxNIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGdsb2JhbCBmb250cyAqL1xuXG5pbXBvcnQgdSBmcm9tICcuL3V0aWwuanMnXG5pbXBvcnQgZm9udHMgZnJvbSAnLi9mb250cy5qcydcblxuLy8gbG9nZ2luZyBmdW5jdGlvblxuY29uc3QgbG9nID0gKHRleHQpID0+IHtcbiAgY29uc29sZS5sb2coJ2xvZycsIHRleHQpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2cnKS5pbm5lckhUTUwgPSBgPGJyPiR7dGV4dH1gICsgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZycpLmlubmVySFRNTFxufVxuXG52YXIgc2F2ZURhdGEgPSAoZnVuY3Rpb24gKCkge1xuICBsZXQgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICBhLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKVxuICByZXR1cm4gZnVuY3Rpb24gKGRhdGEsIGZpbGVOYW1lKSB7XG4gICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGRhdGEpXG4gICAgY29uc3QgYmxvYiA9IG5ldyB3aW5kb3cuQmxvYihbanNvbl0sIHt0eXBlOiAnb2N0ZXQvc3RyZWFtJ30pXG4gICAgY29uc3QgdXJsID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYilcbiAgICBhLmhyZWYgPSB1cmxcbiAgICBhLmRvd25sb2FkID0gZmlsZU5hbWVcbiAgICBhLmNsaWNrKClcbiAgICB3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpXG4gIH1cbn0oKSlcblxuY29uc3QgYW5hbHlzdCA9IGZvbnRzKHtcbiAgY2FudmFzOiB7XG4gICAgY3R4OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJykuZ2V0Q29udGV4dCgnMmQnKSxcbiAgICB3aWR0aDogMTAwLFxuICAgIGhlaWdodDogMTAwXG4gIH0sXG4gIGxvZ1xufSlcblxuY29uc3QgYW5hbHl6ZUZvbnRzID0gKCkgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHUucignZm9udHMuanNvbicpLnRoZW4oKHVybHMpID0+IHtcbiAgICAgIGFuYWx5c3QuYW5hbHl6ZSh1cmxzKVxuICAgICAgLnRoZW4oKGFuYWx5c2lzKSA9PiB7XG4gICAgICAgIHNhdmVEYXRhKGFuYWx5c2lzLCAnYW5hbHlzaXMuanNvbicpXG4gICAgICAgIHJldHVybiByZXNvbHZlKGFuYWx5c2lzKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufVxuXG5hbmFseXplRm9udHMoKVxuIiwiLyogZ2xvYmFsIG9wZW50eXBlICovXG5cbmltcG9ydCB1IGZyb20gJy4vdXRpbC5qcydcblxuZXhwb3J0IGRlZmF1bHQgKG9wdHMpID0+IHtcbiAgY29uc3QgY2FudmFzID0gb3B0cy5jYW52YXMgfHwge1xuICAgIHdpZHRoOiAxMDAsXG4gICAgaGVpZ2h0OiAxMDBcbiAgfVxuXG4gIGNvbnN0IGNsZWFyID0gKGN0eCkgPT4ge1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KVxuICB9XG5cbiAgY29uc3QgZHJhd1N0cmluZyA9IChjdHgsIGZvbnQsIHN0cikgPT4ge1xuICAgIGNsZWFyKGN0eClcbiAgICByZXR1cm4gZm9udC5kcmF3KGN0eCwgc3RyLCAwLCA3MilcbiAgfVxuXG4gIGNvbnN0IGdldENvb3JkcyA9IChpLCB3KSA9PiB7XG4gICAgY29uc3QgeCA9IGkgJSB3XG4gICAgY29uc3QgeSA9IE1hdGguZmxvb3IoaSAvIHcpXG4gICAgcmV0dXJuIHt4LCB5fVxuICB9XG5cbiAgLy8gcmV0dXJuIHN0YXRpc3RpY3MgYWJvdXQgYSBzdHJpbmcgKGxpa2UgYSBjaGFyYWN0ZXIpIGluIGEgZm9udFxuICBjb25zdCBtZWFzdXJlU3RyaW5nID0gKGN0eCwgZm9udCwgc3RyKSA9PiB7XG4gICAgZHJhd1N0cmluZyhjdHgsIGZvbnQsIHN0cilcblxuICAgIGNvbnN0IGltZ0RhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcbiAgICBjb25zdCBkYXRhID0gaW1nRGF0YS5kYXRhXG4gICAgbGV0IGZpcnN0Um93LCBsYXN0Um93LCBmaXJzdENvbHVtbiwgbGFzdENvbHVtblxuICAgIGxldCBhcmVhID0gMFxuICAgIGZvciAobGV0IGkgaW4gZGF0YSkge1xuICAgICAgY29uc3QgY29vcmRzID0gZ2V0Q29vcmRzKGksIGNhbnZhcy53aWR0aClcbiAgICAgIGNvbnN0IHZhbHVlID0gZGF0YVtpXVxuICAgICAgaWYgKHZhbHVlID4gMCkge1xuICAgICAgICBhcmVhID0gYXJlYSArIDFcbiAgICAgICAgZmlyc3RSb3cgPSBmaXJzdFJvdyA/IE1hdGgubWluKGNvb3Jkcy55LCBmaXJzdFJvdykgOiBjb29yZHMueVxuICAgICAgICBmaXJzdENvbHVtbiA9IGZpcnN0Q29sdW1uID8gTWF0aC5taW4oY29vcmRzLngsIGZpcnN0Q29sdW1uKSA6IGNvb3Jkcy54XG4gICAgICAgIGxhc3RSb3cgPSBsYXN0Um93ID8gTWF0aC5tYXgoY29vcmRzLnksIGxhc3RSb3cpIDogY29vcmRzLnlcbiAgICAgICAgbGFzdENvbHVtbiA9IGxhc3RDb2x1bW4gPyBNYXRoLm1heChjb29yZHMueCwgbGFzdENvbHVtbikgOiBjb29yZHMueFxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB3aWR0aCA9IE1hdGguYWJzKGxhc3RSb3cgLSBmaXJzdFJvdylcbiAgICBjb25zdCBoZWlnaHQgPSBNYXRoLmFicyhsYXN0Q29sdW1uIC0gZmlyc3RDb2x1bW4pXG4gICAgY29uc3QgYm94ID0gd2lkdGggKiBoZWlnaHRcbiAgICBjb25zdCBjb250cmFzdCA9IGFyZWEgLyBib3hcblxuICAgIHJldHVybiB7XG4gICAgICB3aWR0aCwgaGVpZ2h0LCBhcmVhLCBib3gsIGNvbnRyYXN0XG4gICAgfVxuICB9XG5cbiAgLy8gcmV0dXJuIHN0YXRpc3RpY3MgYWJvdXQgYSBmb250XG4gIGNvbnN0IG1lYXN1cmVGb250ID0gKGN0eCwgZm9udCwgZm9udFVybCkgPT4ge1xuICAgIGxldCBuYW1lXG4gICAgaWYgKGZvbnQubmFtZXMuZnVsbE5hbWUpIHtcbiAgICAgIG5hbWUgPSBmb250Lm5hbWVzLmZ1bGxOYW1lLmVuXG4gICAgfSBlbHNlIGlmIChmb250Lm5hbWVzLmZvbnRGYW1pbHkpIHtcbiAgICAgIG5hbWUgPSBmb250Lm5hbWVzLmZvbnRGYW1pbHkuZW5cbiAgICB9IGVsc2UgeyByZXR1cm4gbnVsbCB9XG5cbiAgICBjb25zdCBBID0gbWVhc3VyZVN0cmluZyhjdHgsIGZvbnQsICdBJylcbiAgICBjb25zdCB4ID0gbWVhc3VyZVN0cmluZyhjdHgsIGZvbnQsICd4JylcbiAgICBjb25zdCBPID0gbWVhc3VyZVN0cmluZyhjdHgsIGZvbnQsICdPJylcbiAgICBjb25zdCBNID0gbWVhc3VyZVN0cmluZyhjdHgsIGZvbnQsICdNJylcbiAgICBjb25zdCBOID0gbWVhc3VyZVN0cmluZyhjdHgsIGZvbnQsICdOJylcbiAgICBjb25zdCBsID0gbWVhc3VyZVN0cmluZyhjdHgsIGZvbnQsICdsJylcbiAgICBjb25zdCBpID0gbWVhc3VyZVN0cmluZyhjdHgsIGZvbnQsICdpJylcblxuICAgIGNvbnN0IHhIZWlnaHQgPSB4LmhlaWdodCAvIEEuaGVpZ2h0XG4gICAgY29uc3QgY29udHJhc3QgPSBPLmNvbnRyYXN0XG4gICAgY29uc3Qgd2lkdGhSYXRpbyA9IHUubWVhbihbTS53aWR0aCAvIE0uaGVpZ2h0LCBOLndpZHRoIC8gTi5oZWlnaHRdKVxuICAgIGNvbnN0IHdpZHRoVmFyaWFuY2UgPSBNYXRoLmFicyh1Lm1lYW4oW2wud2lkdGgsIGkud2lkdGhdKSAtIHUubWVhbihbQS53aWR0aCwgTS53aWR0aCwgTy53aWR0aF0pKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWUsIGZvbnRVcmwsXG4gICAgICB4SGVpZ2h0LCBjb250cmFzdCwgd2lkdGhSYXRpbywgd2lkdGhWYXJpYW5jZVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGV4YW1pbmUgPSAoZm9udFVybCkgPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBvcGVudHlwZS5sb2FkKGZvbnRVcmwsIChlcnIsIGZvbnQpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7IGNvbnNvbGUubG9nKGVycik7IHJldHVybiByZXNvbHZlKG51bGwpIH1cbiAgICAgICAgICBjb25zdCBtZWFzdXJlbWVudCA9IG1lYXN1cmVGb250KG9wdHMuY2FudmFzLmN0eCwgZm9udCwgZm9udFVybClcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShtZWFzdXJlbWVudClcbiAgICAgICAgfSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgb3B0cy5sb2coZSlcbiAgICAgICAgcmVzb2x2ZShudWxsKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBmaWx0ZXJOdWxsID0gKGFuYWx5c2lzKSA9PiB7XG4gICAgb3B0cy5sb2coJ3JlbW92aW5nIGVycm9yZWQgZm9udHMnKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBrZXlzID0gdS5udW1lcmljS2V5cyhhbmFseXNpc1swXSlcbiAgICAgIGNvbnN0IGZpbHRlcmVkID0gYW5hbHlzaXMuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICAgIGlmICghaXRlbSkgcmV0dXJuIGZhbHNlXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgICAgY29uc3QgdmFsID0gaXRlbVtrZXldXG4gICAgICAgICAgY29uc29sZS5sb2codmFsKVxuICAgICAgICAgIGlmICgodHlwZW9mIHZhbCAhPT0gJ251bWJlcicpIHx8IChpc05hTih2YWwpKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9KVxuICAgICAgY29uc29sZS5sb2coJ2ZpbHRlcmVkJywgZmlsdGVyZWQpXG4gICAgICByZXNvbHZlKGZpbHRlcmVkKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBub3JtYWxpemUgPSAoYW5hbHlzaXMpID0+IHtcbiAgICBvcHRzLmxvZygnbm9ybWFsaXppbmcgdmFsdWVzJylcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qga2V5cyA9IHUubnVtZXJpY0tleXMoYW5hbHlzaXNbMF0pXG4gICAgICBsZXQgbmV3QW5hbHlzaXMgPSBhbmFseXNpc1xuICAgICAgY29uc29sZS5sb2coa2V5c1swXSlcbiAgICAgIGtleXMubWFwKChrZXkpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ3N0YXJ0aW5nIGtleScsIGtleSlcbiAgICAgICAgY29uc29sZS5sb2coJ25ld2FuYWx5c2lzJywgbmV3QW5hbHlzaXMpXG4gICAgICAgIGNvbnN0IHZhbHMgPSBuZXdBbmFseXNpcy5tYXAoKGZvbnQpID0+IHsgcmV0dXJuIGZvbnRba2V5XSB9KVxuICAgICAgICBjb25zdCBtaW4gPSBNYXRoLm1pbiguLi52YWxzKVxuICAgICAgICBjb25zdCBtYXggPSBNYXRoLm1heCguLi52YWxzKVxuICAgICAgICBjb25zdCByYW5nZSA9IG1heCAtIG1pblxuICAgICAgICBjb25zb2xlLmxvZyh2YWxzLCBtaW4sIG1heCwgcmFuZ2UpXG4gICAgICAgIGNvbnN0IG5vcm1lciA9ICh2KSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2codiwgbWluLCByYW5nZSlcbiAgICAgICAgICByZXR1cm4gKHYgLSBtaW4pIC8gcmFuZ2VcbiAgICAgICAgfVxuICAgICAgICBuZXdBbmFseXNpcyA9IG5ld0FuYWx5c2lzLm1hcCgoZm9udCkgPT4ge1xuICAgICAgICAgIGZvbnRba2V5XSA9IG5vcm1lcihmb250W2tleV0pXG4gICAgICAgICAgcmV0dXJuIGZvbnRcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICByZXNvbHZlKG5ld0FuYWx5c2lzKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBjYWxjdWxhdGVEaXN0YW5jZXMgPSAoYW5hbHlzaXMpID0+IHtcbiAgICBvcHRzLmxvZygnY2FsY3VsYXRpbmcgZGlzdGFuY2VzJylcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IGNvdW50ID0gMFxuICAgICAgY29uc3Qgd2l0aERpc3RhbmNlcyA9IGFuYWx5c2lzLm1hcCgoZm9udCkgPT4ge1xuICAgICAgICBjb3VudCArPSAxXG4gICAgICAgIGlmIChjb3VudCAlIDUwID09PSAwKSB7IG9wdHMubG9nKGAke2NvdW50fSBvdXQgb2YgJHthbmFseXNpcy5sZW5ndGh9YCkgfVxuICAgICAgICBjb25zdCBkaXN0YW5jZXMgPSBhbmFseXNpcy5tYXAoKG90aGVyRm9udCkgPT4ge1xuICAgICAgICAgIHJldHVybiB7IG5hbWU6IG90aGVyRm9udC5uYW1lLCBkaXN0YW5jZTogdS5kaXN0YW5jZShmb250LCBvdGhlckZvbnQpIH1cbiAgICAgICAgfSkucmVkdWNlKChhLCBiKSA9PiB7XG4gICAgICAgICAgYVtiLm5hbWVdID0gYi5kaXN0YW5jZVxuICAgICAgICAgIHJldHVybiBhXG4gICAgICAgIH0sIHt9KVxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZm9udCwgeyBkaXN0YW5jZXMgfSlcbiAgICAgIH0pXG4gICAgICByZXR1cm4gcmVzb2x2ZSh3aXRoRGlzdGFuY2VzKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBjbGVhbiA9IChhbmFseXNpcykgPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgb3V0cHV0ID0ge31cbiAgICAgIGFuYWx5c2lzLm1hcCgoZm9udCkgPT4ge1xuICAgICAgICBvdXRwdXRbZm9udC5uYW1lXSA9IGZvbnRcbiAgICAgIH0pXG4gICAgICByZXNvbHZlKG91dHB1dClcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgYW5hbHl6ZSA9ICh1cmxzKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIFByb21pc2UuYWxsKHVybHMubWFwKGV4YW1pbmUpKVxuICAgICAgICAudGhlbihmaWx0ZXJOdWxsKVxuICAgICAgICAudGhlbihub3JtYWxpemUpXG4gICAgICAgIC50aGVuKGNhbGN1bGF0ZURpc3RhbmNlcylcbiAgICAgICAgLnRoZW4oY2xlYW4pXG4gICAgICAgIC50aGVuKHJlc29sdmUpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICBhbmFseXplXG4gIH0pXG59XG4iLCJmdW5jdGlvbiB1dGlsICgpIHtcbiAgY29uc3QgbWVhbiA9IChhcnIpID0+IHtcbiAgICByZXR1cm4gYXJyLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYSArIGIgfSkgLyBhcnIubGVuZ3RoXG4gIH1cblxuICBjb25zdCBudW1lcmljS2V5cyA9IChvYmopID0+IHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5maWx0ZXIoKGtleSkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gJ251bWJlcicpIHsgcmV0dXJuIHRydWUgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGRpc3RhbmNlID0gKGEsIGIpID0+IHtcbiAgICBjb25zdCBrZXlzID0gbnVtZXJpY0tleXMoYSlcbiAgICByZXR1cm4gTWF0aC5zcXJ0KGtleXMubWFwKChrZXkpID0+IHtcbiAgICAgIHJldHVybiBhW2tleV0gLSBiW2tleV1cbiAgICB9KS5tYXAoKGRpZmYpID0+IHtcbiAgICAgIHJldHVybiBkaWZmICogZGlmZlxuICAgIH0pLnJlZHVjZSgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIGEgKyBiXG4gICAgfSkpXG4gIH1cblxuICBjb25zdCBmaXJzdE4gPSAobiwgYXJyKSA9PiB7XG4gICAgcmV0dXJuIGFyci5zcGxpY2UoMCwgbilcbiAgfVxuXG4gIC8vIGdlbmVyaWMgaHR0cCByZXF1ZXN0IGZ1bmN0aW9uXG4gIGNvbnN0IHIgPSAodXJsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCByZXEgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KClcbiAgICAgIHJlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCAmJiByZXEuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVxLnJlc3BvbnNlVGV4dCkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlcS5vcGVuKCdHRVQnLCB1cmwsIHRydWUpXG4gICAgICByZXEuc2VuZCgpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICBtZWFuLCBkaXN0YW5jZSwgZmlyc3ROLCByLCBudW1lcmljS2V5c1xuICB9KVxufVxuXG5leHBvcnQgZGVmYXVsdCB1dGlsKClcblxuIl19
