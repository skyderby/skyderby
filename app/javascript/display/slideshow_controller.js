import { Controller } from '@hotwired/stimulus'

const PAUSE = 2400

export default class extends Controller {
  static targets = ['slide']
  static values = {
    slideSeconds: { type: Number, default: 12 },
    rowsPerSecond: { type: Number, default: 0.5 },
    minScrollSeconds: { type: Number, default: 4 }
  }

  connect() {
    this.index = 0
    this.currentScrollMs = 0
    this.tickScroll = this.tickScroll.bind(this)
    this.onKeydown = this.onKeydown.bind(this)
    this.onBeforeMorphAttribute = this.onBeforeMorphAttribute.bind(this)

    this.showSlide(0)
    this.scheduleNext()
    this.scrollRaf = requestAnimationFrame(this.tickScroll)
    window.addEventListener('keydown', this.onKeydown)
    document.addEventListener('turbo:before-morph-attribute', this.onBeforeMorphAttribute)
  }

  disconnect() {
    if (this.timer) clearTimeout(this.timer)
    if (this.scrollRaf) cancelAnimationFrame(this.scrollRaf)
    window.removeEventListener('keydown', this.onKeydown)
    document.removeEventListener(
      'turbo:before-morph-attribute',
      this.onBeforeMorphAttribute
    )
  }

  // The refreshed markup never carries is-active, so let the running slideshow
  // keep ownership of it through a morph — otherwise the active slide would
  // blank out and any live replay on it would restart on every refresh.
  onBeforeMorphAttribute(event) {
    const { attributeName } = event.detail
    const target = event.target
    const isSlide = target?.classList?.contains('display-slide')
    // Keep is-active on the running slide, and keep any slideshow-duration a
    // replay controller computed client-side (the server markup carries the
    // static default, which would cut a variable-length replay short).
    if (
      isSlide &&
      (attributeName === 'class' || attributeName === 'data-slideshow-duration')
    ) {
      event.preventDefault()
    }
  }

  onKeydown(event) {
    if (event.key === 'ArrowRight') this.go(1)
    else if (event.key === 'ArrowLeft') this.go(-1)
  }

  go(step) {
    const count = this.slideTargets.length
    if (count <= 1) return

    if (this.timer) clearTimeout(this.timer)
    this.showSlide((this.index + step + count) % count)
    this.scheduleNext()
  }

  showSlide(index) {
    this.slideTargets.forEach((el, idx) => {
      el.classList.toggle('is-active', idx === index)
    })
    this.index = index
    this.scrollT0 = null
    this.currentScrollMs = this.scrollDurationMs(this.currentScroller())
  }

  scheduleNext() {
    if (this.slideTargets.length <= 1) return

    const slide = this.slideTargets[this.index]
    let ms
    if (this.currentScrollMs > 0) {
      ms = PAUSE + this.currentScrollMs + PAUSE
    } else {
      ms = (Number(slide.dataset.slideshowDuration) || this.slideSecondsValue) * 1000
    }

    this.timer = setTimeout(() => {
      this.maybeRefresh()
      this.showSlide((this.index + 1) % this.slideTargets.length)
      this.scheduleNext()
    }, ms)
  }

  // Run a due page refresh here, at the boundary between two slides, so a morph
  // never lands mid-replay and resets the animation.
  maybeRefresh() {
    const refresh = this.application.getControllerForElementAndIdentifier(
      this.element,
      'refresh'
    )
    if (refresh) refresh.refreshIfDue()
  }

  currentScroller() {
    const slide = this.slideTargets[this.index]
    return slide && slide.querySelector('[data-slideshow-scroll]')
  }

  // Scroll duration proportional to how many rows are off-screen, so the
  // reading pace stays constant no matter how many athletes are listed.
  scrollDurationMs(el) {
    if (!el) return 0

    const max = el.scrollHeight - el.clientHeight
    if (max <= 1) return 0

    const row = el.querySelector('.display-lb-row')
    const rowHeight = (row && row.offsetHeight) || 90
    const rows = max / rowHeight

    return Math.max(this.minScrollSecondsValue, rows / this.rowsPerSecondValue) * 1000
  }

  tickScroll(now) {
    this.scrollRaf = requestAnimationFrame(this.tickScroll)

    const el = this.currentScroller()
    if (!el) return

    const max = el.scrollHeight - el.clientHeight
    if (max <= 1 || this.currentScrollMs <= 0) {
      el.scrollTop = 0
      return
    }

    const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
    const scroll = this.currentScrollMs
    if (this.scrollT0 == null) this.scrollT0 = now

    const p = now - this.scrollT0

    let pos
    if (p < PAUSE) pos = 0
    else if (p < PAUSE + scroll) pos = max * ease((p - PAUSE) / scroll)
    else pos = max

    el.scrollTop = pos
  }
}
