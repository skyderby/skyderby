import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['dialog']

  initialize() {
    this.forceClose = this.forceClose.bind(this)
    this.handleOverlayClick = this.handleOverlayClick.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
  }

  connect() {
    document.addEventListener('turbo:before-render', this.forceClose)
    document.addEventListener('keydown', this.handleKeydown)
    this.createOverlay()
    this.dialogTarget.show()
    document.body.classList.add('overflow-hidden')
  }

  disconnect() {
    document.removeEventListener('turbo:before-render', this.forceClose)
    document.removeEventListener('keydown', this.handleKeydown)
    this.removeOverlay()
    document.body.classList.remove('overflow-hidden')
  }

  createOverlay() {
    this.overlay = document.createElement('div')
    this.overlay.classList.add('dialog-overlay')
    this.overlay.addEventListener('click', this.handleOverlayClick)
    this.element.insertBefore(this.overlay, this.dialogTarget)
    requestAnimationFrame(() => this.overlay.classList.add('dialog-overlay-visible'))
  }

  removeOverlay() {
    if (this.overlay) {
      this.overlay.removeEventListener('click', this.handleOverlayClick)
      this.overlay.remove()
      this.overlay = null
    }
  }

  handleOverlayClick() {
    this.close()
  }

  handleKeydown(event) {
    if (event.key === 'Escape') this.close()
  }

  close() {
    this.dialogTarget.addEventListener(
      'transitionend',
      () => {
        this.element.remove()
      },
      { once: true }
    )

    this.overlay?.classList.remove('dialog-overlay-visible')
    this.dialogTarget.close()
  }

  forceClose() {
    this.element.remove()
  }
}
