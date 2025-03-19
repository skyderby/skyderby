import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    $(document).one('turbo:before-cache', () => $(this.element).modal('hide'))
  }
}
