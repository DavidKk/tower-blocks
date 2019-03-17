export type TouchEventHandle = (event: TouchEvent | MouseEvent | PointerEvent | MSPointerEvent) => void

export interface BlockPosition {
  x?: number
  y?: number
  z?: number
}

export interface BlockDimension {
  width: number
  height: number
}

export interface WindowSizeInfo {
  width: number
  height: number
}

export enum BlockDirection {
  x = 'x',
  z = 'z'
}

export interface BlockOptions {
  position?: BlockPosition
  dimension?: BlockDimension
  moving?: boolean
  dropping?: boolean
  direction?: keyof typeof BlockDirection
  speed?: number
  moveXStart?: number
  moveXEnd?: number
  moveZStart?: number
  moveZEnd?: number
  color?: number
}
