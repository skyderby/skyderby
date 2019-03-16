import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    $(document).one('turbolinks:before-cache', () => $(this.element).modal('hide'))
  }
}
