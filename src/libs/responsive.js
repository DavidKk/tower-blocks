import map from 'lodash/map'
import fromPairs from 'lodash/fromPairs'

export function metaFlex (rootFontSize = 16, designClientWidth = 750) {
  let meta = document.querySelector('meta[name="viewport"]')

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'viewport')
    document.head.appendChild(meta)
  }

  let originScale = 1
  let viewPortContent = meta.getAttribute('content')
  if (viewPortContent) {
    let viewPortQuery = map(viewPortContent.split(','), (values) => values.split('='))
    let viewPortParams = fromPairs(viewPortQuery)
    originScale = viewPortParams['initial-scale'] * 1 || 1
  }

  let docElement = document.documentElement
  let originClientWidth = docElement.clientWidth * originScale
  let flexRatio = designClientWidth / originClientWidth
  let screenPixelRatio = unusual() ? 1 : 1 / window.devicePixelRatio
  meta.setAttribute('content', `width=device-width,user-scalable=no,initial-scale=${screenPixelRatio},maximum-scale=${screenPixelRatio},minimum-scale=${screenPixelRatio}`)

  // Detect support for meta viewport scaling
  let fontSize = originClientWidth === docElement.clientWidth
    ? `${rootFontSize * docElement.clientWidth / designClientWidth}px`
    : `${rootFontSize / flexRatio * window.devicePixelRatio}px`

  docElement.style.fontSize = fontSize
  docElement.style.display = 'none'

  // Force rerender - important to new Android devices
  // eslint-disable-next-line no-unused-expressions
  docElement.clientWidth
  docElement.style.display = ''
}

export default function responsive (rootFontSize = 16, designWidth = 750) {
  metaFlex(rootFontSize, designWidth)
}

function unusual () {
  if (navigator.appVersion.match(/(iphone|ipad|ipod)/ig)) {
    return false
  }

  let userAgent = navigator.userAgent
  let webKitVersionMatch = userAgent.match(/Android[\S\s]+AppleWebkit\/(\d{3})/i)
  if (webKitVersionMatch && webKitVersionMatch[1] > 534) {
    return false
  }

  let UCVersionMatch = navigator.userAgent.match(/U3\/((\d+|\.){5,})/i)

  if (UCVersionMatch) {
    let UCVersion = parseInt(UCVersionMatch[1].split('.').join(''), 10)
    if (UCVersion < 80) {
      return true
    }
  }

  return false
}
