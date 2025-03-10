import { Controller } from 'stimulus'
import { createPopper } from '@popperjs/core'

export default class extends Controller {
  static targets = ['menu']

  initialize() {
    this.hide = this.hide.bind(this)
  }

  connect() {
    document.addEventListener('click', this.hide)
    document.addEventListener('turbo:before-render', this.forceClose)
  }

  disconnect() {
    document.removeEventListener('click', this.hide)
    document.removeEventListener('turbo:before-render', this.forceClose)
  }

  toggle() {
    this.element.classList.toggle('dropdown--open')
    if (!this.isOpen) return this.close()

    this.dropdownRoot.innerHTML = this.menuTarget.innerHTML
    this.dropdown = this.dropdownRoot.querySelector('.sd-dropdown-menu')

    createPopper(this.element, this.dropdown, {
      placement: 'bottom-end',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8]
          }
        }
      ]
    })
  }

  close() {
    this.element.classList.remove('dropdown--open')
    this.dropdownRoot.replaceChildren()
  }

  hide(event) {
    if (!this.isOpen) return
    if (!this.dropdown?.contains(event.target) && !this.element.contains(event.target)) {
      this.close()
    }
  }

  get isOpen() {
    return this.element.classList.contains('dropdown--open')
  }

  get dropdownRoot() {
    return document.getElementById('dropdown-root')
  }
}
