import { Controller } from '@hotwired/stimulus'

const POPOVER_DISMISS_GRACE_MS = 300

export default class extends Controller {
  static targets = ['menu', 'overlay', 'toggle', 'closeButton']

  initialize() {
    this.close_menu = this.close_menu.bind(this)
    this.track_popover = this.track_popover.bind(this)
    this.popover_open = false
    this.last_popover_close_at = 0
  }

  connect() {
    this.element.addEventListener('toggle', this.track_popover, true)
    document.addEventListener('turbo:before-cache', this.close_menu, { once: true })
  }

  disconnect() {
    this.element.removeEventListener('toggle', this.track_popover, true)
    document.removeEventListener('turbo:before-cache', this.close_menu)
    this.lock_page_scroll(false)
  }

  open_menu() {
    this.set_menu_visibility(true)

    if (this.hasCloseButtonTarget) this.closeButtonTarget.focus()
  }

  close_menu(event) {
    if (this.dismissing_popover(event)) return

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

  lock_page_scroll(locked) {
    document.body.classList.toggle('overflow-hidden', locked)
  }

  track_popover(event) {
    if (event.newState === 'open') {
      this.popover_open = true
    } else if (event.newState === 'closed') {
      this.popover_open = false
      this.last_popover_close_at = Date.now()
    }
  }

  dismissing_popover(event) {
    if (!event || (event.type !== 'click' && event.type !== 'keydown')) return false
    if (this.popover_open) return true

    return Date.now() - this.last_popover_close_at < POPOVER_DISMISS_GRACE_MS
  }

  get menu() {
    return this.menuTarget
  }

  get overlay() {
    return this.overlayTarget
  }
}
