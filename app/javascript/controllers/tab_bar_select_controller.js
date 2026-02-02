import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['select', 'tabBar']

  syncToSelect(event) {
    const value = event.target.value
    const selectInput = this.selectTarget.querySelector('select')
    if (selectInput) {
      selectInput.value = value
    }
  }

  syncToRadio(event) {
    const value = event.target.value
    const radio = this.tabBarTarget.querySelector(`input[type="radio"][value="${value}"]`)
    if (radio) {
      radio.checked = true
    }
  }
}
