import phridge from 'phridge'
const sites = require('./alexa-top-1m.json')

const firstN = (n, arr) => {
  return arr.splice(0, n)
}

const url = 'http://monks.co'
phridge.spawn({
  loadImages: false
}).then(function (phantom) {
  console.log('getting fonts from', url)
  phantom.openPage(url)
    .then(function (page) {
      var concat = function concat (a, b) {
        return a.concat(b)
      }
      var makeNodeList = function makeNodeList (selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector))
      }
      var ff = ['div', 'p', 'h1', 'h2', 'h3', 'code', 'span']
        .map(makeNodeList)
        .reduce(concat)
        .map(function (el) {
          console.log('processing')
          return window.getComputedStyle(el, null).getPropertyValue('font-family')
        })
        .map(function (f) {
          return f.split(',')[0].replace('"', '').replace('"', '')
        })

      return ff
    })
    .then((n) => { console.log(n) })
  phantom.dispose()
})
