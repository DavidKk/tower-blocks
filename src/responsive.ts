import responsive from './share/responsive'

window.addEventListener('resize', () => responsive())
responsive()

/**
 * Safari prevent zoom screen
 */
let lastTouchEnd = 0
const handleStopZoom = (event) => {
  let now = Date.now()
  now - lastTouchEnd <= 300 && event.preventDefault()
  lastTouchEnd = now
}

document.addEventListener('touchstart', (event) => event.touches.length > 1 && event.preventDefault())
document.addEventListener('touchend', handleStopZoom, false)
document.addEventListener('gesturestart', (event) => event.preventDefault())
