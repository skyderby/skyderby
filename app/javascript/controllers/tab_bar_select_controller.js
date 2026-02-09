import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['select', 'tabBar']

  connect() {
    this.syncToSelect()
  }

  syncToSelect() {
    const checkedRadio = this.tabBarTarget.querySelector('input[type="radio"]:checked')
    const selectInput = this.selectTarget.querySelector('select')
    if (checkedRadio && selectInput) {
      selectInput.value = checkedRadio.value
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
