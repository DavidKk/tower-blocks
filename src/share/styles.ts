import { getRootFontSize } from '../share/responsive'
import { isWeChat } from './device'

export const pxToRem = (fontSize: number): string => {
  const rootFontSize = getRootFontSize()
  return isWeChat ? `${fontSize / 2}px` : `${fontSize / rootFontSize}rem`
}
