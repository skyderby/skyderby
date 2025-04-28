import { Controller } from '@hotwired/stimulus'

export default class RemovableController extends Controller {
  remove() {
    const destroyField = this.element.querySelector('[name$="[_destroy]"]')

    if (destroyField) {
      destroyField.value = true
      this.element.classList.add('hide')
    } else {
      this.element.remove()
    }
  }
}
