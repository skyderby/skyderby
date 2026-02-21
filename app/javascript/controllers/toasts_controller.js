import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['template', 'toast']

  connect() {
    this.element.showPopover()
  }

  toastTargetConnected(element) {
    setTimeout(() => this.dismiss(element), 5000)
  }

  dismiss(element) {
    element.classList.add('toast-dismissed')
    setTimeout(() => element.remove(), 500)
  }

  dismissClick(event) {
    const toast = event.target.closest('.toast')
    if (toast) this.dismiss(toast)
  }

  show(message, type = 'error') {
    const template = this.templateTarget.content.cloneNode(true)
    const toast = template.querySelector('.toast')
    const messageEl = toast.querySelector('.toast-message')
    const icon = toast.querySelector(`[data-icon="${type}"]`)

    messageEl.textContent = message
    if (icon) icon.classList.remove('hidden')

    this.element.appendChild(toast)
  }
}
