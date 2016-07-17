import u from './util.js'

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

window.showDistances = (font) => {
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
    .reduce(u.add)
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
  const keys = u.numericKeys(font)
  const tds = keys
    .map((key) => { return font[key] })
    .map(wrap('td'))
    .reduce(u.add)
  return `
    <tr>
      <td>${showFont(font)}</td>
      ${tds}
    </tr>`
}

const fontTable = (fonts) => {
  const keys = u.numericKeys(fonts[0])
  const ths = keys
    .map((key) => { return `<th onclick="sort('${key}')">${key}</th>` })
    .reduce(u.add)
  const rows = fonts
    .map(fontRow)
    .reduce(u.add)
  return `
    <table>
      <tr>
        <th onclick="sort('font')">font</th>
        ${ths}
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
        .reduce(u.add)
    )
    document.head.innerHTML += style

    const by = (sortBy) => {
      return (a, b) => {
        if (a[sortBy] < b[sortBy]) return 1
        if (a[sortBy] > b[sortBy]) return -1
        return 0
      }
    }

    const sort = (sortBy) => {
      const table = fontTable(
        fonts.sort(by(sortBy))
      )
      document.getElementById('show').innerHTML = table
    }
    sort('xHeight')
    window.sort = sort
  })

