import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['select']

  sync(event) {
    const value = event.target.value
    const selectInput = this.selectTarget.querySelector('select')
    if (selectInput) {
      selectInput.value = value
    }
  }
}
