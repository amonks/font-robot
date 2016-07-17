/* global fonts */

import u from './util.js'
import fonts from './fonts.js'

// logging function
const log = (text) => {
  console.log('log', text)
  document.getElementById('log').innerHTML = `<br>${text}` + document.getElementById('log').innerHTML
}

var saveData = (function () {
  let a = document.createElement('a')
  a.style.display = 'none'
  document.body.appendChild(a)
  return function (data, fileName) {
    const json = JSON.stringify(data)
    const blob = new window.Blob([json], {type: 'octet/stream'})
    const url = window.URL.createObjectURL(blob)
    a.href = url
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(url)
  }
}())

const analyst = fonts({
  canvas: {
    ctx: document.getElementById('canvas').getContext('2d'),
    width: 100,
    height: 100
  },
  log
})

const analyzeFonts = () => {
  return new Promise((resolve, reject) => {
    u.r('fonts.json').then((urls) => {
      analyst.analyze(urls)
      .then((analysis) => {
        saveData(analysis, 'analysis.json')
        return resolve(analysis)
      })
    })
  })
}

analyzeFonts()
