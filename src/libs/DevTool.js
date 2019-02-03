import Stats from 'stats-js'
import { getRootFontSize } from './responsive'

export default class DevTool {
  constructor () {
    if (process.env.NODE_ENV === 'development') {
      this.stats = new Stats()
      this.stats.showPanel(0)

      let rootFontSize = getRootFontSize()

      Array.prototype.forEach.call(this.stats.dom.children, (canvas) => {
        if (canvas.tagName && canvas.tagName.toLowerCase() === 'canvas') {
          canvas.style.width = `${canvas.width / rootFontSize}rem`
          canvas.style.height = `${canvas.height / rootFontSize}rem`
        }
      })

      document.body.appendChild(this.stats.dom)

      this.nextTick()
    }

    this.isCheat = process.env.NODE_ENV === 'development' && -1 !== window.location.search.search('c=whoesyourdady')
  }

  cheat (isCheat) {
    this.isCheat = process.env.NODE_ENV === 'development' ? false : !!isCheat
  }

  nextTick () {
    if (this.stats) {
      this.stats.begin()
      this.stats.end()
  
      requestAnimationFrame(this.nextTick.bind(this))
    }
  }
}
