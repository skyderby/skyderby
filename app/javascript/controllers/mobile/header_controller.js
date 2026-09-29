import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['menu', 'overlay', 'toggle', 'closeButton']

  initialize() {
    this.close_menu = this.close_menu.bind(this)
  }

  connect() {
    document.addEventListener('turbo:before-cache', this.close_menu, { once: true })
  }

  disconnect() {
    document.removeEventListener('turbo:before-cache', this.close_menu)
    this.lock_page_scroll(false)
  }

  open_menu() {
    this.set_menu_visibility(true)

    if (this.hasCloseButtonTarget) this.closeButtonTarget.focus()
  }

  close_menu(event) {
    if (event?.type === 'keydown' && document.querySelector('#modal-root dialog[open]'))
      return

    const was_open = this.menu.classList.contains('active')

    this.set_menu_visibility(false)

    if (was_open && this.hasToggleTarget) this.toggleTarget.focus()
  }

  set_menu_visibility(visibility) {
    this.menu.classList.toggle('active', visibility)
    this.overlay.classList.toggle('overlay--hidden', !visibility)
    this.lock_page_scroll(visibility)

    if (this.hasToggleTarget) {
      this.toggleTarget.setAttribute('aria-expanded', String(visibility))
    }
  }

  sync_page_scroll() {
    this.lock_page_scroll(this.menu.classList.contains('active'))
  }

  lock_page_scroll(locked) {
    document.body.classList.toggle('overflow-hidden', locked)
  }

  get menu() {
    return this.menuTarget
  }

  get overlay() {
    return this.overlayTarget
  }
}
