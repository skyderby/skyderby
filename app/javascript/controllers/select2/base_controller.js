import { Controller } from 'stimulus'
import 'select2/dist/js/select2.full'
import 'select2/dist/css/select2.css'

export class BaseController extends Controller {
  connect() {
    const options = Object.assign(this.default_options, this.options)

    this.fix_open_on_clear()

    this.$element
      .select2(options)
      .on('select2:select', () => this.dispatchChange())
      .on('select2:unselect', () => {
        this.element.value = undefined
        this.dispatchChange()
      })

    $(document).one('turbolinks:before-cache', () => this.teardown())
  }

  dispatchChange() {
    this.element.dispatchEvent(new Event('change', { bubbles: true }))
  }

  teardown() {
    if (this.$element.next().is('.select2') && this.$element.data('select2')) {
      this.$element.select2('destroy')
    }
  }

  fix_open_on_clear() {
    this.$element
      .select2()
      .on('select2:unselecting', this.on_unselecting)
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

  get $element() {
    return $(this.element)
  }

  get options() {
    return {}
  }

  get default_options() {
    return {
      theme: 'bootstrap',
      containerCssClass: ':all:',
      width: '100%',
      allowClear: true,
      placeholder: this.placeholder,
      ajax: {
        dataType: 'json',
        type: 'GET',
        quietMillis: 50,
        data: params => {
          return {
            query: params.term,
            page: params.page
          }
        },
        cache: true
      }
    }
  }

  get placeholder() {
    return this.element.getAttribute('placeholder')
  }
}
