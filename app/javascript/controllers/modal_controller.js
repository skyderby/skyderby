import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['dialog', 'overlay']

  initialize() {
    super.initialize()
    this.forceClose = this.forceClose.bind(this)
  }

  connect() {
    document.addEventListener('turbo:before-render', this.forceClose)
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        this.close()
      }
    })
    this.overlayTarget.addEventListener('click', event => {
      if (event.target === this.overlayTarget) this.close()
    })
    document.body.classList.add('overflow-hidden')
  }

  disconnect() {
    document.removeEventListener('turbo:before-render', this.forceClose)
    document.body.classList.remove('overflow-hidden')
  }

  close() {
    this.dialogTarget.setAttribute('closing', '')

    Promise.all(
      this.dialogTarget.getAnimations().map(animation => animation.finished)
    ).then(() => {
      this.dialogTarget.removeAttribute('closing')
      this.element.remove()
    })
  }

  forceClose() {
    this.element.remove()
  }
}
