import { RootFontSize } from '../services/responsive'

export const pxToRem = (fontSize): number => {
  return fontSize / RootFontSize
}
