const WHEEL_ZOOM_SPEED = 0.01

const centerOf = touches => ({
  x: (touches[0].clientX + touches[1].clientX) / 2,
  y: (touches[0].clientY + touches[1].clientY) / 2
})

const spreadOf = touches =>
  Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  )

export default class ViewportGestures {
  constructor(element, { onZoom, onPan, onStart = null, onEnd = null, freePan = null }) {
    this.element = element
    this.onZoom = onZoom
    this.onPan = onPan
    this.onStart = onStart
    this.onEnd = onEnd
    this.freePan = freePan
    this.active = false

    element.addEventListener('touchstart', this.onTouchStart, { passive: false })
    element.addEventListener('touchmove', this.onTouchMove, { passive: false })
    element.addEventListener('touchend', this.onTouchEnd)
    element.addEventListener('touchcancel', this.onTouchEnd)
    element.addEventListener('wheel', this.onWheel, { passive: false })
  }

  onTouchStart = event => {
    if (event.touches.length !== 2) return

    event.preventDefault()
    this.active = true
    this.center = centerOf(event.touches)
    this.spread = spreadOf(event.touches)
    this.onStart?.()
  }

  onTouchMove = event => {
    if (!this.active || event.touches.length !== 2) return

    event.preventDefault()
    const center = centerOf(event.touches)
    const spread = spreadOf(event.touches)

    if (this.spread > 0 && spread > 0) this.onZoom(spread / this.spread, center)
    this.onPan(center.x - this.center.x, center.y - this.center.y)

    this.center = center
    this.spread = spread
  }

  onTouchEnd = event => {
    if (!this.active || event.touches.length === 2) return

    this.active = false
    this.onEnd?.()
  }

  onWheel = event => {
    if (event.ctrlKey) {
      event.preventDefault()
      this.onZoom(Math.exp(-event.deltaY * WHEEL_ZOOM_SPEED), {
        x: event.clientX,
        y: event.clientY
      })
      return
    }

    if (this.freePan?.()) {
      event.preventDefault()
      this.onPan(-event.deltaX, -event.deltaY)
      return
    }

    const horizontal = event.shiftKey ? event.deltaY : event.deltaX
    if (Math.abs(horizontal) <= Math.abs(event.shiftKey ? 0 : event.deltaY)) return

    event.preventDefault()
    this.onPan(-horizontal, 0)
  }

  destroy() {
    this.element.removeEventListener('touchstart', this.onTouchStart)
    this.element.removeEventListener('touchmove', this.onTouchMove)
    this.element.removeEventListener('touchend', this.onTouchEnd)
    this.element.removeEventListener('touchcancel', this.onTouchEnd)
    this.element.removeEventListener('wheel', this.onWheel)
  }
}
