/* global opentype */

import u from './util.js'

export default (opts) => {
  const canvas = opts.canvas || {
    width: 100,
    height: 100
  }

  const clear = (ctx) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const drawString = (ctx, font, str) => {
    clear(ctx)
    return font.draw(ctx, str, 0, 72)
  }

  const getCoords = (i, w) => {
    const x = i % w
    const y = Math.floor(i / w)
    return {x, y}
  }

  // return statistics about a string (like a character) in a font
  const measureString = (ctx, font, str) => {
    drawString(ctx, font, str)

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imgData.data
    let firstRow, lastRow, firstColumn, lastColumn
    let area = 0
    for (let i in data) {
      const coords = getCoords(i, canvas.width)
      const value = data[i]
      if (value > 0) {
        area = area + 1
        firstRow = firstRow ? Math.min(coords.y, firstRow) : coords.y
        firstColumn = firstColumn ? Math.min(coords.x, firstColumn) : coords.x
        lastRow = lastRow ? Math.max(coords.y, lastRow) : coords.y
        lastColumn = lastColumn ? Math.max(coords.x, lastColumn) : coords.x
      }
    }
    const width = Math.abs(lastRow - firstRow)
    const height = Math.abs(lastColumn - firstColumn)
    const box = width * height
    const contrast = area / box

    return {
      width, height, area, box, contrast
    }
  }

  // return statistics about a font
  const measureFont = (ctx, font, fontUrl) => {
    let name
    if (font.names.fullName) {
      name = font.names.fullName.en
    } else if (font.names.fontFamily) {
      name = font.names.fontFamily.en
    } else { return null }

    const A = measureString(ctx, font, 'A')
    const x = measureString(ctx, font, 'x')
    const O = measureString(ctx, font, 'O')
    const M = measureString(ctx, font, 'M')
    const N = measureString(ctx, font, 'N')
    const l = measureString(ctx, font, 'l')
    const i = measureString(ctx, font, 'i')

    const xHeight = x.height / A.height
    const contrast = O.contrast
    const widthRatio = u.mean([M.width / M.height, N.width / N.height])
    const widthVariance = Math.abs(u.mean([l.width, i.width]) - u.mean([A.width, M.width, O.width]))

    return {
      name, fontUrl,
      xHeight, contrast, widthRatio, widthVariance
    }
  }

  const examine = (fontUrl) => {
    return new Promise((resolve, reject) => {
      try {
        opentype.load(fontUrl, (err, font) => {
          if (err) { console.log(err); return resolve(null) }
          const measurement = measureFont(opts.canvas.ctx, font, fontUrl)
          return resolve(measurement)
        })
      } catch (e) {
        opts.log(e)
        resolve(null)
      }
    })
  }

  const filterNull = (analysis) => {
    opts.log('removing errored fonts')
    return new Promise((resolve, reject) => {
      const keys = u.numericKeys(analysis[0])
      const filtered = analysis.filter((item) => {
        if (!item) return false
        for (let key of keys) {
          const val = item[key]
          console.log(val)
          if ((typeof val !== 'number') || (isNaN(val))) {
            return false
          }
        }
        return true
      })
      console.log('filtered', filtered)
      resolve(filtered)
    })
  }

  const normalize = (analysis) => {
    opts.log('normalizing values')
    return new Promise((resolve, reject) => {
      const keys = u.numericKeys(analysis[0])
      let newAnalysis = analysis
      console.log(keys[0])
      keys.map((key) => {
        console.log('starting key', key)
        console.log('newanalysis', newAnalysis)
        const vals = newAnalysis.map((font) => { return font[key] })
        const min = Math.min(...vals)
        const max = Math.max(...vals)
        const range = max - min
        console.log(vals, min, max, range)
        const normer = (v) => {
          console.log(v, min, range)
          return (v - min) / range
        }
        newAnalysis = newAnalysis.map((font) => {
          font[key] = normer(font[key])
          return font
        })
      })
      resolve(newAnalysis)
    })
  }

  const calculateDistances = (analysis) => {
    opts.log('calculating distances')
    return new Promise((resolve, reject) => {
      let count = 0
      const withDistances = analysis.map((font) => {
        count += 1
        if (count % 50 === 0) { opts.log(`${count} out of ${analysis.length}`) }
        const distances = analysis.map((otherFont) => {
          return { name: otherFont.name, distance: u.distance(font, otherFont) }
        }).reduce((a, b) => {
          a[b.name] = b.distance
          return a
        }, {})
        return Object.assign({}, font, { distances })
      })
      return resolve(withDistances)
    })
  }

  const clean = (analysis) => {
    return new Promise((resolve, reject) => {
      let output = {}
      analysis.map((font) => {
        output[font.name] = font
      })
      resolve(output)
    })
  }

  const analyze = (urls) => {
    return new Promise((resolve, reject) => {
      Promise.all(urls.map(examine))
        .then(filterNull)
        .then(normalize)
        .then(calculateDistances)
        .then(clean)
        .then(resolve)
    })
  }

  return Object.freeze({
    analyze
  })
}
