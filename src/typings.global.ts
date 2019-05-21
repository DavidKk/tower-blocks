type TouchEventHandle = (event: TouchEvent | MouseEvent | PointerEvent | MSPointerEvent) => void

interface WeChatSystemInfo {
  windowWidth: number
  windowHeight: number
}

interface WeChatGlobalVariables {
  createCanvas: () => HTMLCanvasElement
  getSystemInfoSync: () => WeChatSystemInfo
  onTouchStart: (TouchEventHandle) => void
  offTouchStart: (TouchEventHandle) => void
}

declare const wx: WeChatGlobalVariables
declare const canvas: HTMLCanvasElement
