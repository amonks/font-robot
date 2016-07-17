'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* global opentype */

window.fonts = function (opts) {
  var canvas = opts.canvas || {
    width: 100,
    height: 100
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
    var widthRatio = mean([M.width / M.height, N.width / N.height]);
    var widthVariance = Math.abs(mean([l.width, i.width]) - mean([A.width, M.width, O.width]));

    return {
      name: name, fontUrl: fontUrl,
      xHeight: xHeight, contrast: contrast, widthRatio: widthRatio, widthVariance: widthVariance
    };
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
      var keys = numericKeys(analysis[0]);
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
      var keys = numericKeys(analysis[0]);
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
          return { name: otherFont.name, distance: distance(font, otherFont) };
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