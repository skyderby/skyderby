import { Controller } from 'stimulus'
import 'select2'
import { fix_open_on_clear } from 'utils/select2/fix_open_on_clear'
import common_options from 'utils/select2/common_options'

export default class extends Controller {
  connect() {
    var options = Object.assign(common_options, {
      placeholder: $(this.element).data('placeholder'),
      ajax: {
        url: '/users/select_options',
        cache: true
      }
    })

    const $element = $(this.element)
    fix_open_on_clear($element);
    $element.select2(options);
  }
}
