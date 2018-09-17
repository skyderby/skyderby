import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = [ 'menu', 'overlay', 'locale_menu' ]

  connect() {
    let menu_width = this.menu.offsetWidth
    this.menu.style.right = `${-menu_width}px`

    document.addEventListener('turbolinks:before-cache', this.close_menu.bind(this), {once: true})
  }

  open_menu() {
    this.menu.classList.add('active')
    this.overlay.classList.remove('overlay--hidden')
  }

  close_menu() {
    this.menu.classList.remove('active')
    this.overlay.classList.add('overlay--hidden')
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
