import { RootFontSize } from '../services/responsive'
import { isWeChat } from './device'

export const pxToRem = (fontSize: number): string => {
  return isWeChat ? `${fontSize / 2}px` : `${fontSize / RootFontSize}rem`
}
