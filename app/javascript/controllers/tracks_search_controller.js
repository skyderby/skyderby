import { Controller } from 'stimulus'

export default class TracksSearchController extends Controller {
  handleFilterAdd(event) {
    const { type, value } = event.detail
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = type
    input.value = value
    this.element.appendChild(input)

    this.element.closest('form').requestSubmit()
  }

  handleFilterRemove(event) {
    const { type, value } = event.detail
    this.element.querySelector(`input[name="${type}"][value="${value}"]`)?.remove()

    this.element.closest('form').requestSubmit()
  }
}
