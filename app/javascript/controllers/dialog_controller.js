import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['dialog']

  initialize() {
    this.forceClose = this.forceClose.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  connect() {
    document.addEventListener('turbo:before-render', this.forceClose)
    this.dialogTarget.addEventListener('click', this.handleClick)
    this.dialogTarget.showModal()
    document.body.classList.add('overflow-hidden')
  }

  disconnect() {
    document.removeEventListener('turbo:before-render', this.forceClose)
    this.dialogTarget.removeEventListener('click', this.handleClick)
    document.body.classList.remove('overflow-hidden')
  }

  handleClick(event) {
    if (event.target === this.dialogTarget) {
      this.close()
    }
  }

  close() {
    this.dialogTarget.addEventListener(
      'transitionend',
      () => {
        this.element.remove()
      },
      { once: true }
    )

    this.dialogTarget.close()
  }

  forceClose() {
    this.element.remove()
  }
}
