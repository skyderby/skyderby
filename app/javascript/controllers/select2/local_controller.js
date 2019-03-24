import { Controller } from 'stimulus'
import 'select2/dist/js/select2.full'

export default class extends Controller {
  connect() {
    const options = {
      theme: 'bootstrap',
      containerCssClass: ':all:',
      width: '100%',
      minimumResultsForSearch: 10
    }

    this.$element.select2(options)
      .on('select2:select', () => this.dispatchChange())
      .on('select2:unselect', () => {
        this.element.value = undefined
        this.dispatchChange()
      })

    $(document).one('turbolinks:before-cache', () => this.teardown())
  }

  dispatchChange() {
    const event = new Event('change', { bubbles: true })
    this.element.dispatchEvent(event)
  }

  teardown() {
    if (this.$element.next().is('.select2')) this.$element.select2('destroy')
  }

  get $element() {
    return $(this.element)
  }
}
