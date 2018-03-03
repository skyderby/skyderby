import { Controller } from 'stimulus'
import 'select2'

export default class extends Controller {
  connect() {
    var options = {
      theme: 'bootstrap',
      width: '100%',
      minimumResultsForSearch: 10
    }

    const $element = $(this.element)

    $element.select2(options);

    $(document).one('turbolinks:before-cache', this.teardown.bind(this))
  }

  teardown() {
    const $element = $(this.element)
    if ($element.next().is('.select2')) $element.select2('destroy')
  }
}
