import { Controller } from 'stimulus'
import 'select2'
import { select2_fix_open_on_clear } from 'helpers/select2_fix_open_on_clear'

export default class extends Controller {
  connect() {
    var options = {
      theme: 'bootstrap',
      containerCssClass: ':all:',
      width: '100%',
      allowClear: true,
      placeholder: $(this.element).data('placeholder'),
      ajax: {
        url: '/users/select_options',
        dataType: 'json',
        type: "GET",
        quietMillis: 50,
        data: function (params) {
          return {
            query: params.term,
            page: params.page
          };
        },
        cache: true
      }
    }

    const $element = $(this.element)
    select2_fix_open_on_clear($element);
    $element.select2(options);
  }
}
