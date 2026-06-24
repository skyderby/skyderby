import { Controller } from '@hotwired/stimulus'

const PAUSE = 2400

export default class extends Controller {
  static targets = ['slide']
  static values = {
    slideSeconds: { type: Number, default: 12 },
    scrollSeconds: { type: Number, default: 11 }
  }

  connect() {
    this.index = 0
    this.tickScroll = this.tickScroll.bind(this)
    this.onKeydown = this.onKeydown.bind(this)

    this.showSlide(0)
    this.scheduleNext()
    this.scrollRaf = requestAnimationFrame(this.tickScroll)
    window.addEventListener('keydown', this.onKeydown)
  }

  disconnect() {
    if (this.timer) clearTimeout(this.timer)
    if (this.scrollRaf) cancelAnimationFrame(this.scrollRaf)
    window.removeEventListener('keydown', this.onKeydown)
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
  }

  scheduleNext() {
    if (this.slideTargets.length <= 1) return

    const slide = this.slideTargets[this.index]
    const seconds = Number(slide.dataset.slideshowDuration) || this.slideSecondsValue

    this.timer = setTimeout(() => {
      this.showSlide((this.index + 1) % this.slideTargets.length)
      this.scheduleNext()
    }, seconds * 1000)
  }

  tickScroll(now) {
    this.scrollRaf = requestAnimationFrame(this.tickScroll)

    const slide = this.slideTargets[this.index]
    const el = slide && slide.querySelector('[data-slideshow-scroll]')
    if (!el) return

    const max = el.scrollHeight - el.clientHeight
    if (max <= 1) {
      el.scrollTop = 0
      return
    }

    const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
    const scroll = Math.max(1500, this.scrollSecondsValue * 1000)
    if (this.scrollT0 == null) this.scrollT0 = now

    const cycle = PAUSE + scroll + PAUSE + scroll
    const p = (now - this.scrollT0) % cycle

    let pos
    if (p < PAUSE) pos = max
    else if (p < PAUSE + scroll) pos = max * (1 - ease((p - PAUSE) / scroll))
    else if (p < PAUSE + scroll + PAUSE) pos = 0
    else pos = max * ease((p - PAUSE - scroll - PAUSE) / scroll)

    el.scrollTop = pos
  }
}
