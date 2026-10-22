import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['dialog']

  disconnect() {
    document.body.classList.remove('overflow-hidden')
  }

  open() {
    document.body.classList.add('overflow-hidden')
    this.dialogTarget.showModal()
  }

  closed() {
    document.body.classList.remove('overflow-hidden')
  }

  closeOnBackdrop(event) {
    if (event.target === this.dialogTarget) this.dialogTarget.close()
  }
}
