import map from 'lodash/map'
import fromPairs from 'lodash/fromPairs'

export const RootFontSize = 16
export const DesignClientWidth = 750

export function unusual (): boolean {
  if (navigator.appVersion.match(/(iphone|ipad|ipod)/ig)) {
    return false
  }

  let userAgent = navigator.userAgent
  let webKitVersionMatch = userAgent.match(/Android[\S\s]+AppleWebkit\/(\d{3})/i)
  if (webKitVersionMatch && parseInt(webKitVersionMatch[1], 10) > 534) {
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

export function getRootFontSize (rootFontSize = RootFontSize, designClientWidth = DesignClientWidth): number {
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
  return originClientWidth === docElement.clientWidth
    ? rootFontSize * docElement.clientWidth / designClientWidth
    : rootFontSize / flexRatio * window.devicePixelRatio
}

export function metaFlex (rootFontSize = RootFontSize, designClientWidth = DesignClientWidth) {
  let docElement = document.documentElement
  docElement.style.fontSize = `${getRootFontSize(rootFontSize, designClientWidth)}px`
  docElement.style.display = 'none'

  // Force rerender - important to new Android devices
  // tslint:disable-next-line no-unused-expression
  docElement.clientWidth
  docElement.style.display = ''
}

export default function responsive (rootFontSize = RootFontSize, designWidth = DesignClientWidth) {
  return metaFlex(rootFontSize, designWidth)
}
