import { Controller } from '@hotwired/stimulus'

const supportsClosedBy = 'closedBy' in HTMLDialogElement.prototype

export default class extends Controller {
  static targets = ['dialog']

  connect() {
    document.addEventListener('turbo:before-render', this.forceClose)
    this.dialogTarget.showModal()
    document.dispatchEvent(new CustomEvent('dialog:open'))
  }

  disconnect() {
    document.removeEventListener('turbo:before-render', this.forceClose)
    document.dispatchEvent(new CustomEvent('dialog:close'))
  }

  close() {
    this.dialogTarget.close()
  }

  closeOnBackdrop(event) {
    if (supportsClosedBy || event.target !== this.dialogTarget) return

    this.close()
  }

  remove() {
    const cleanup = () => {
      clearTimeout(fallback)
      this.element.remove()
    }

    this.dialogTarget.addEventListener('transitionend', cleanup, { once: true })
    const fallback = setTimeout(cleanup, 300)
  }

  forceClose = () => {
    this.element.remove()
  }
}
