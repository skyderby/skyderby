import { Controller } from '@hotwired/stimulus'
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

    this.close()
  }

  toggle() {
    this.element.classList.toggle('dropdown--open')
    if (!this.isOpen) return this.close()

    this.dropdownRoot.innerHTML = this.menuTarget.innerHTML
    this.dropdown = this.dropdownRoot.querySelector('.sd-dropdown-menu')
    this.dropdown.addEventListener('turbo:submit-end', this.close.bind(this))

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
    this.dropdownRoot?.replaceChildren()
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
