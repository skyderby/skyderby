import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    this.element.querySelector('input[name="category[name]"]').focus()
  }
}
