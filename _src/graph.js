import u from './util.js'

const analysis = require('../analysis.json')
const fonts = Object.keys(analysis)
  .map((fontName) => { return analysis[fontName] })

const distanceRange = fonts
  .map((font) => {
    return Object.values(font.distances)
  })
  .reduce(u.concat)
  .reduce((prev, cur, ind, arr) => {
    if (!prev.min || cur < prev.min) prev.min = cur
    if (!prev.max || cur > prev.max) prev.max = cur
    return prev
  }, {})

const distanceArr = [distanceRange.min, distanceRange.max]

const constrain = (min, max, fn) => {
  return (val) => {
    let out = fn(val)
    if (out < min) out = min
    if (out > max) out = max
    return out
  }
}

const normer = constrain(0, 100, u.makeNormer(100, -100, distanceArr))

const fontConnections = (font) => {
  return Object.keys(font.distances)
    .filter((otherFontName) => {
      if ([font.name, otherFontName].sort().indexOf(otherFontName) === 0) {
        return true
      } else {
        return false
      }
    })
    .map((otherFontName) => {
      const value = Math.floor(normer(font.distances[otherFontName]))
      return `
        "${font.name}" -- "${otherFontName}"[weight=${value}];`
    })
    .reduce(u.add)
}

const graph = (connections) => {
  return `
    graph {
      ${connections}
    }`
}

console.log(graph(fonts.map(fontConnections)))

