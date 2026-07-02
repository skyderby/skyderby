import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static values = {
    intervalSeconds: { type: Number, default: 300 }
  }

  connect() {
    this.due = false
    this.onVisibilityChange = this.onVisibilityChange.bind(this)
    this.start()
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  }

  disconnect() {
    this.stop()
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
  }

  start() {
    this.stop()
    this.timer = setInterval(() => this.markDue(), this.intervalSecondsValue * 1000)
  }

  stop() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  onVisibilityChange() {
    if (document.hidden) this.stop()
    else this.start()
  }

  markDue() {
    this.due = true
  }

  // Called by the slideshow at a slide boundary so the morph never lands in the
  // middle of a playing replay and resets it. Morphing (instead of a full
  // reload) keeps the already-initialised Google maps — marked
  // data-turbo-permanent — alive, so a refresh does not bill Google Cloud for a
  // fresh map load each time.
  refreshIfDue() {
    if (!this.due || document.hidden) return
    this.due = false
    window.Turbo.visit(window.location.href, { action: 'replace' })
  }
}
