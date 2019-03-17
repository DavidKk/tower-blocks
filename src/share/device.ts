export const isWeChat = typeof wx !== 'undefined'

const ua = window.navigator.userAgent.toLocaleLowerCase()
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
export const isSafari = ua.indexOf('safari') !== -1
