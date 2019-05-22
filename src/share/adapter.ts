import { isWeChat, isMobile } from './device'
import * as Typings from '../typings'

export const createCanvas = (): HTMLCanvasElement => {
  if (isWeChat) {
    return wx.createCanvas()
  }

  let canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  canvas.style.position = 'fixed'
  canvas.style.left = '0'
  canvas.style.top = '0'
  canvas.style.zIndex = '400'
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'

  document.body.append(canvas)
  return canvas
}

export const bindTapEvent = (handle: Typings.TouchEventHandle): void => {
  if (isWeChat) {
    wx.onTouchStart(handle)

  } else {
    isMobile
    ? document.addEventListener('touchstart', handle)
    : document.addEventListener('click', handle)
  }
}

export const unbindTapEvent = (handle: Typings.TouchEventHandle): void => {
  if (isWeChat) {
    wx.offTouchStart(handle)

  } else {
    isMobile
    ? document.removeEventListener('touchstart', handle)
    : document.removeEventListener('click', handle)
  }
}
