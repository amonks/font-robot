import u from './util.js'

const add = (a, b) => {
  return a + b
}

const wrap = (el) => {
  return (html) => {
    return `<${el}>${html}</${el}>`
  }
}

const showFont = (font) => {
  return `
    <span onclick="showDistances(window.analysis['${font.name}'])" style="font-family: '${font.name}';" id="${font.name}">
      ${font.name} [ A O M N x l i ]
    </span>`
}

const showDistance = (distance) => {
  if (distance.distance) {
    return `${showFont(distance.a)} and ${showFont(distance.b)}`
  }
  return ''
}

const showDistances = (font) => {
  const html = Object.keys(font.distances)
    .map((otherFontName) => {
      return {
        a: font,
        b: window.analysis[otherFontName],
        distance: font.distances[otherFontName]
      }
    })
    .sort((a, b) => {
      if (a.distance === b.distance) return 0
      if (b.distance === null || a.distance > b.distance) return 1
      if (a.distance === null || a.distance < b.distance) return -1
      return 0
    })
    .map(showDistance)
    .map(wrap('div'))
    .reduce(add)
  document.getElementById('distances').innerHTML = `
    <p>most similar</p>
    ${html}
    </p>most different</p>`
}

const fontFace = (font) => {
  return `
  @font-face {
    font-family: "${font.name}";
    src: url("${font.fontUrl}")
  }`
}

const fontRow = (font) => {
  return `
    <tr>
      <td>${showFont(font)}</td>
      <td>${font.xHeight}</td>
      <td>${font.contrast}</td>
      <td>${font.widthRatio}</td>
      <td>${font.widthVariance}</td>
    </tr>`
}

const fontTable = (rows) => {
  return `
    <table>
      <tr>
        <th onclick="sort('font')">font</th>
        <th onclick="sort('xHeight')">x height</th>
        <th onclick="sort('contrast')">contrast</th>
        <th onclick="sort('widthRatio')">width ratio</th>
        <th onclick="sort('widthVariance')">width variance</th>
      </tr>
      ${rows}
    </table>`
}

u.r('analysis.json')
  .then((analysis) => {
    window.analysis = analysis
    const fonts = Object.keys(analysis)
      .map((key) => { return analysis[key] })
    window.dataWhatevers = u.numericKeys(fonts[0])

    const style = wrap('style')(
      fonts
        .map(fontFace)
        .reduce(add)
    )
    document.head.innerHTML += style

    const by = (sortBy) => {
      return (a, b) => {
        if (a[sortBy] < b[sortBy]) return -1
        if (a[sortBy] > b[sortBy]) return 1
        return 0
      }
    }

    const sort = (sortBy) => {
      const table = fontTable(
        fonts
          .sort(by(sortBy))
          .map(fontRow)
          .reduce(add)
        )
      document.getElementById('show').innerHTML = table
    }
    sort('xHeight')
    window.sort = sort
  })

