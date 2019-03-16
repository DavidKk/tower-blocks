type TouchEventHandle = (event: TouchEvent | MouseEvent | PointerEvent | MSPointerEvent) => void

interface WeChatGlobalVariables {
  createCanvas: () => HTMLCanvasElement
  onTouchStart: (TouchEventHandle) => void
  offTouchStart: (TouchEventHandle) => void
}

declare const wx: WeChatGlobalVariables
declare const canvas: HTMLCanvasElement
