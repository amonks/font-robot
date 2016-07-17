function util () {
  const mean = (arr) => {
    return arr.reduce((a, b) => { return a + b }) / arr.length
  }

  const numericKeys = (obj) => {
    return Object.keys(obj).filter((key) => {
      if (typeof obj[key] === 'number') { return true }
      return false
    })
  }

  const distance = (a, b) => {
    const keys = numericKeys(a)
    return Math.sqrt(keys.map((key) => {
      return a[key] - b[key]
    }).map((diff) => {
      return diff * diff
    }).reduce((a, b) => {
      return a + b
    }))
  }

  const firstN = (n, arr) => {
    return arr.splice(0, n)
  }

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

  return Object.freeze({
    mean, distance, firstN, r, numericKeys
  })
}

export default util()

