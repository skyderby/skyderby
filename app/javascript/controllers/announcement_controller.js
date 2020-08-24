import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    this.element.addEventListener('click', event => {
      if (event.target.tagName !== 'A') return

      event.preventDefault()

      const url = event.target.getAttribute('href')

      ga('send', 'event', 'announcement', 'click', url, {
        transport: 'beacon',
        hitCallback: function () {
          document.location = url
        }
      })
    })
  }
}
