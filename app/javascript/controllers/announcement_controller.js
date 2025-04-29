import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    this.element.addEventListener('click', event => {
      if (event.target.tagName !== 'A') return

      event.preventDefault()

      const url = event.target.getAttribute('href')

      gtag('event', 'click', {
        event_category: 'announcement',
        event_label: url,
        transport_type: 'beacon',
        event_callback: function () {
          document.location = url
        }
      })
    })
  }
}
