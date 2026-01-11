import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['input', 'showIcon', 'hideIcon']

  toggle() {
    const isPassword = this.inputTarget.type === 'password'
    this.inputTarget.type = isPassword ? 'text' : 'password'
    this.showIconTarget.classList.toggle('hidden', !isPassword)
    this.hideIconTarget.classList.toggle('hidden', isPassword)
  }
}
