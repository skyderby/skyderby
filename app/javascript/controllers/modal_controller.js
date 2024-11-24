import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    $(document).one('turbo:before-cache', () => $(this.element).modal('hide'))
  }
}
