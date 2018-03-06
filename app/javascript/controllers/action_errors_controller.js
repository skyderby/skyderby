import { Controller } from 'stimulus'

const DEFAULT_MESSAGE = 'Something went wrong with that request. Please try again.'
const ESC_KEY = 27

export default class extends Controller {
  static targets = [ 'message' ]

  connect() {
    document.addEventListener('ajax:error', this.handle_ajax_error.bind(this))
    document.addEventListener('action:error', this.handle_action_error.bind(this))
    document.addEventListener('keydown', this.handle_esc_keypress.bind(this))
  }

  handle_ajax_error(event) {
    if (!event.target.getAttribute('data-remote')) return

    const [_text, _status_text, xhr] = event.detail
    if (xhr.status === 422) return

    this.show(DEFAULT_MESSAGE)
  }

  handle_action_error(event) {
    const message = event.detail.message
    this.show(message)
  }

  handle_esc_keypress(event) {
    if (event.which === ESC_KEY) this.hide()
  }

  show(message) {
    this.clear_timeout()

    this.messageTarget.innerText = message
    this.element.classList.add('visible')
    this.data.set('timer-id', setTimeout(() => { this.hide() }, 5000))
  }

  hide() {
    this.element.classList.remove('visible')
  }

  clear_timeout() {
    clearTimeout(this.data.get('timer-id'))
  }
}
