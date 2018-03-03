import { Controller } from 'stimulus'
import 'select2'
import { fix_open_on_clear } from 'utils/select2/fix_open_on_clear'
import common_options from 'utils/select2/common_options'

export default class extends Controller {
  connect() {
    var options = Object.assign(common_options, {
      placeholder: $(this.element).attr('placeholder'),
      ajax: {
        url: '/places/select_options',
        cache: true
      }
    })

    const $element = $(this.element)
    fix_open_on_clear($element);
    $element.select2(options);

    $(document).one('turbolinks:before-cache', this.teardown.bind(this))
  }

  teardown() {
    const $element = $(this.element)
    if ($element.next().is('.select2')) $element.select2('destroy')
  }
}
