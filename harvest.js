'use strict';

var _phridge = require('phridge');

var _phridge2 = _interopRequireDefault(_phridge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sites = require('./alexa-top-1m.json');

var firstN = function firstN(n, arr) {
  return arr.splice(0, n);
};

var url = 'http://monks.co';
_phridge2.default.spawn({
  loadImages: false
}).then(function (phantom) {
  console.log('getting fonts from', url);
  phantom.openPage(url).then(function (page) {
    var concat = function concat(a, b) {
      return a.concat(b);
    };
    var makeNodeList = function makeNodeList(selector) {
      return Array.prototype.slice.call(document.querySelectorAll(selector));
    };
    var ff = ['div', 'p', 'h1', 'h2', 'h3', 'code', 'span'].map(makeNodeList).reduce(concat).map(function (el) {
      console.log('processing');
      return window.getComputedStyle(el, null).getPropertyValue('font-family');
    }).map(function (f) {
      return f.split(',')[0].replace('"', '').replace('"', '');
    });

    return ff;
  }).then(function (n) {
    console.log(n);
  });
  phantom.dispose();
});