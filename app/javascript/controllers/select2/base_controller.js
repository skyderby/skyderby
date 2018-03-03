import { Controller } from 'stimulus'
import 'select2'

export class BaseController extends Controller {
  connect() {
    var options = Object.assign(this.default_options(), this.options())

    const $element = $(this.element)

    this.fix_open_on_clear($element);
    $element.select2(options);

    $(document).one('turbolinks:before-cache', this.teardown.bind(this))
  }

  teardown() {
    const $element = $(this.element)
    if ($element.next().is('.select2')) $element.select2('destroy')
  }

  fix_open_on_clear($element) {
    $element.select2()
            .on("select2:unselecting", this.on_unselecting)
            .on('select2:open', this.on_open)
  }

  on_unselecting() {
    $(this).data('unselecting', true)
  }

  on_open() {
    if ($(this).data('unselecting')) {
      $(this).select2('close')
      $(this).data('unselecting', false)
    }
  }

  options() {
    return {}
  }

  default_options() {
    return {
      theme: 'bootstrap',
      containerCssClass: ':all:',
      width: '100%',
      allowClear: true,
      ajax: {
        dataType: 'json',
        type: "GET",
        quietMillis: 50,
        data: (params) => {
          return {
            query: params.term,
            page: params.page
          }
        },
        cache: true
      }
    }
  }
}
