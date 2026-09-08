import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['dialog']
  static values = { trackId: Number, defaults: { type: Object, default: {} } }

  dialogTargetConnected(dialog) {
    this.observer = new MutationObserver(() => {
      document.body.classList.toggle('overflow-hidden', dialog.open)
    })
    this.observer.observe(dialog, { attributeFilter: ['open'] })
  }

  dialogTargetDisconnected() {
    this.observer?.disconnect()
    document.body.classList.remove('overflow-hidden')
  }

  open() {
    if (this.hasDialogTarget) this.dialogTarget.showModal()
  }

  select(event) {
    const item = event.target.closest('a.tracks-item')
    if (!item) return

    event.preventDefault()

    const trackId = item.dataset.id
    if (!trackId || Number(trackId) === this.trackIdValue) return

    const url = new URL(window.location)
    url.searchParams.set('compare_id', trackId)

    const defaults = Object.entries(this.defaultsValue)
    if (defaults.every(([name]) => !url.searchParams.has(name))) {
      defaults.forEach(([name, value]) => url.searchParams.set(name, value))
    }

    Turbo.visit(url.toString())
  }
}
