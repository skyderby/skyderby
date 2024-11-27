import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['dialog']

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
  }

  disconnect() {
    document.removeEventListener('turbo:before-render', this.forceClose)
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
