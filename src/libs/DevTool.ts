import Stats from 'stats.js'
import { getRootFontSize } from '../share/responsive'

export default class DevTool {
  stats: Stats
  isCheat: boolean

  constructor () {
    if (process.env.NODE_ENV === 'development') {
      this.stats = new Stats()
      this.stats.showPanel(0)

      window.addEventListener('resize', () => this.resize())
      this.resize()

      document.body.appendChild(this.stats.dom)
    }

    this.isCheat = process.env.NODE_ENV === 'development' && -1 !== window.location.search.search('c=whoesyourdady')
  }

  cheat (isCheat: boolean): void {
    this.isCheat = process.env.NODE_ENV === 'development' ? false : isCheat
  }

  resize (): void {
    if (this.stats) {
      Array.prototype.forEach.call(this.stats.dom.children, (canvas) => {
        if (canvas.tagName && canvas.tagName.toLowerCase() === 'canvas') {
          const rootFontSize = getRootFontSize()
          canvas.style.width = `${canvas.width / rootFontSize}rem`
          canvas.style.height = `${canvas.height / rootFontSize}rem`
        }
      })
    }
  }

  begin (): void {
    this.stats && this.stats.begin()
  }

  end (): void {
    this.stats && this.stats.end()
  }
}
