/* global fonts */

// logging function
const log = (text) => {
  console.log('log', text)
  document.getElementById('log').innerHTML = `<br>${text}` + document.getElementById('log').innerHTML
}

var saveData = (function () {
  var a = document.createElement('a')
  document.body.appendChild(a)
  a.style = 'display: none'
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

// generic http request function
const r = (url) => {
  return new Promise((resolve, reject) => {
    let req = new window.XMLHttpRequest()
    req.onreadystatechange = () => {
      if (req.readyState === 4 && req.status === 200) {
        resolve(JSON.parse(req.responseText))
      }
    }
    req.open('GET', url, true)
    req.send()
  })
}

const analyzeFonts = () => {
  return new Promise((resolve, reject) => {
    r('fonts.json').then((urls) => {
      analyst.analyze(urls)
      .then((analysis) => {
        saveData(analysis, 'analysis.json')
        return resolve(analysis)
      })
    })
  })
}

analyzeFonts()
