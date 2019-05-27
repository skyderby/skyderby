import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['menu', 'overlay', 'locale_menu']

  connect() {
    const menu_width = this.menu.offsetWidth
    this.menu.style.right = `${-menu_width}px`

    document.addEventListener('turbolinks:before-cache', this.close_menu.bind(this), {
      once: true
    })
  }

  open_menu() {
    this.set_menu_visibility(true)
  }

  close_menu() {
    this.set_menu_visibility(false)
  }

  set_menu_visibility(visibility) {
    this.menu.classList.toggle('active', visibility)
    this.overlay.classList.toggle('overlay--hidden', !visibility)
  }

  toggle_locale_menu() {
    this.locale_menu.classList.toggle('active')
  }

  get menu() {
    return this.menuTarget
  }

  get overlay() {
    return this.overlayTarget
  }

  get locale_menu() {
    return this.locale_menuTarget
  }
}
