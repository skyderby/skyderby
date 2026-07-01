import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static values = {
    intervalSeconds: { type: Number, default: 300 }
  }

  connect() {
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
    this.timer = setInterval(() => this.refresh(), this.intervalSecondsValue * 1000)
  }

  stop() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  onVisibilityChange() {
    if (document.hidden) this.stop()
    else this.start()
  }

  refresh() {
    if (document.hidden) return
    window.location.reload()
  }
}
