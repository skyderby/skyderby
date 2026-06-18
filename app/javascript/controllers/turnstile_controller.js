import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static values = {
    sitekey: String,
    responseFieldName: { type: String, default: 'cf_turnstile_response' }
  }

  connect() {
    this.renderWidget()
  }

  disconnect() {
    if (this.retryTimeout) clearTimeout(this.retryTimeout)
    if (this.widgetId && window.turnstile?.remove) {
      window.turnstile.remove(this.widgetId)
      this.widgetId = null
    }
  }

  renderWidget() {
    if (!window.turnstile?.render) {
      this.retryTimeout = setTimeout(() => this.renderWidget(), 100)
      return
    }

    this.widgetId = window.turnstile.render(this.element, {
      sitekey: this.sitekeyValue,
      'response-field-name': this.responseFieldNameValue
    })
  }
}
