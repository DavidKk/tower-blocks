import { isWeChat } from '../share/device'
import { createCanvas } from '../share/adapter'
import { pxToRem } from '../share/styles'

export default class UI {
  public canvas: HTMLCanvasElement
  public context: CanvasRenderingContext2D
  public score: number
  public message: string
  public playButtonVisible: boolean
  public playButtonOpacity: number
  public playButtonTransitionToken: Symbol
  public messageVisible: boolean
  public messageOpacity: number
  public messageTransitionToken: Symbol
  public transitions: Array<Symbol>

  constructor (canvas?: HTMLCanvasElement) {
    this.score = 0
    this.playButtonVisible = true
    this.playButtonOpacity = 100
    this.messageVisible = false
    this.messageOpacity = 0
    this.transitions = []

    this.canvas = canvas || createCanvas()
    this.context = this.canvas.getContext('2d')

    if (!isWeChat) {
      window.addEventListener('resize', this.resize.bind(this))
      this.resize()
    }

    this.togglePlayButton(true)
  }

  public async togglePlayButton (isOpen: boolean): Promise<void> {
    if (this.playButtonVisible === isOpen) {
      return
    }

    if (this.playButtonTransitionToken) {
      this.cancelTransition(this.playButtonTransitionToken)
    }

    if (isOpen === true) {
      this.playButtonVisible = true
      this.playButtonTransitionToken = this.genTransitionToken()
      await this.transition(0, 100, 260, (opacity) => this.playButtonOpacity = opacity, this.playButtonTransitionToken)
      return
    }

    this.playButtonTransitionToken = this.genTransitionToken()
    await this.transition(100, 0, 260, (opacity) => this.playButtonOpacity = opacity, this.playButtonTransitionToken)
    this.playButtonVisible = false
  }

  public async toggleMessage (isOpen: boolean): Promise<void> {
    if (this.messageVisible === isOpen) {
      return
    }

    if (this.messageTransitionToken) {
      this.cancelTransition(this.messageTransitionToken)
    }

    if (isOpen === true) {
      this.messageVisible = true
      this.messageTransitionToken = this.genTransitionToken()
      await this.transition(0, 40, 260, (opacity) => this.messageOpacity = opacity, this.messageTransitionToken)
      return
    }

    this.messageTransitionToken = this.genTransitionToken()
    await this.transition(40, 0, 260, (opacity) => this.messageOpacity = opacity, this.messageTransitionToken)
    this.messageVisible = false
  }

  public setScore (score: number): void {
    this.score = score * 100
  }

  public setMessage (message: string): void {
    this.message = message
  }

  public render (): void {
    let screenWidth = window.innerWidth
    let screenHeight = window.innerHeight
    this.context.clearRect(0, 0, screenWidth, screenHeight)

    this.drawScore(this.score)
    this.messageVisible === true && this.drawMessage(this.message)
    this.playButtonVisible === true && this.drawPlayButton()
  }

  public resize (): void {
    let screenWidth = window.innerWidth
    let screenHeight = window.innerHeight
    this.canvas.width = screenWidth
    this.canvas.height = screenHeight
    this.canvas.style.width = screenWidth + 'px'
    this.canvas.style.height = screenHeight + 'px'
  }

  private drawPlayButton (): void {
    let screenWidth = window.innerWidth
    let screenHeight = window.innerHeight
    let textColor = `rgba(51,51,51,${this.playButtonOpacity / 100})`
    let textContent = 'Tap Start Game'
    let textX = screenWidth / 2
    let textY = screenHeight * 0.9

    this.context.font = `bold ${pxToRem(48)} 微软雅黑`
    this.context.textAlign = 'center'
    this.context.textBaseline = 'middle'
    this.context.fillStyle = textColor
    this.context.fillText(textContent, textX, textY)

    this.context.save()
    this.context.restore()
  }

  private drawScore (score?: number): void {
    let screenWidth = window.innerWidth
    let screenHeight = window.innerHeight
    let textColor = `rgba(51,51,51,1)`
    let textContent = `Score: ${score || 0}`
    let textX = screenWidth / 2
    let textY = screenHeight * 0.1

    this.context.font = `bold ${pxToRem(48)} 微软雅黑`
    this.context.textAlign = 'center'
    this.context.textBaseline = 'middle'
    this.context.fillStyle = textColor
    this.context.fillText(textContent, textX, textY)

    this.context.save()
    this.context.restore()
  }

  private drawMessage (message?: string): void {
    let screenWidth = window.innerWidth
    let screenHeight = window.innerHeight
    this.context.fillStyle = `rgba(255,255,255,${this.messageOpacity / 100})`
    this.context.fillRect(0, (screenHeight - 192) / 2, screenWidth, 192)

    this.context.save()
    this.context.restore()

    let textColor = `rgba(68,68,68,${this.messageOpacity / 100})`
    let textContent = message || ''
    let textX = screenWidth / 2
    let textY = screenHeight / 2

    this.context.font = `bold ${pxToRem(96)} 微软雅黑`
    this.context.textAlign = 'center'
    this.context.textBaseline = 'middle'
    this.context.fillStyle = textColor
    this.context.fillText(textContent, textX, textY)
  }

  private genTransitionToken (): Symbol {
    let token = Symbol('Transition Cancel Token')
    this.transitions.push(token)
    return token
  }

  private cancelTransition (token: Symbol): void {
    let index = this.transitions.indexOf(token)
    index !== -1 && this.transitions.splice(index, 1)
  }

  private transition (from: number, to: number, duration: number, callback: (value: number) => void, token?: Symbol): Promise<void> {
    if (from > to) {
      return this.transition(to, from, duration, (value) => callback(from - value))
    }

    return new Promise((resolve, reject) => {
      let startTime = Date.now()

      const tick = () => {
        if (token && -1 === this.transitions.indexOf(token)) {
          reject(new Error('Cancel transition'))
          return
        }

        let elapsed = Date.now() - startTime
        callback(this.easeInOut(elapsed, from, to, duration))

        requestAnimationFrame(() => {
          if (elapsed < duration) {
            tick()
            return
          }

          callback(to)
          resolve()
        })
      }

      tick()
    })
  }

  private easeInOut (elapsed: number, initialValue: number, amountOfChange: number, duration: number): number {
    elapsed /= duration / 2

    if (elapsed < 1) {
      return amountOfChange / 2 * elapsed * elapsed + initialValue
    }

    elapsed --
    return -amountOfChange / 2 * (elapsed * (elapsed - 2) - 1) + initialValue
  }
}
