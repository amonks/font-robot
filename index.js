'use strict';

/* global fonts */

// logging function
var log = function log(text) {
  console.log('log', text);
  document.getElementById('log').innerHTML = '<br>' + text + document.getElementById('log').innerHTML;
};

var saveData = function () {
  var a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';
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

var analyst = fonts({
  canvas: {
    ctx: document.getElementById('canvas').getContext('2d'),
    width: 100,
    height: 100
  },
  log: log
});

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

var analyzeFonts = function analyzeFonts() {
  return new Promise(function (resolve, reject) {
    r('fonts.json').then(function (urls) {
      analyst.analyze(urls).then(function (analysis) {
        saveData(analysis, 'analysis.json');
        return resolve(analysis);
      });
    });
  });
};

analyzeFonts();