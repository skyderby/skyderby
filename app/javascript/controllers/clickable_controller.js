import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    const url = this.element.getAttribute('data-url')

    this.element.addEventListener('click', () => {
      Turbo.visit(url)
    })
  }
}
