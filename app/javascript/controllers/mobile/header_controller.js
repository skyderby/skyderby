import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = [ 'menu', 'overlay' ]

  connect() {
    let menu_width = this.menu.offsetWidth
    this.menu.style.right = `${-menu_width}px`
  }

  open_menu() {
    this.menu.classList.add('active')
    this.overlay.classList.remove('overlay--hidden')
  }

  close_menu() {
    this.menu.classList.remove('active')
    this.overlay.classList.add('overlay--hidden')
  }

  get menu() {
    return this.menuTarget
  }

  get overlay() {
    return this.overlayTarget
  }
}
