import { Controller } from '@hotwired/stimulus'

export default class ModalTriggerController extends Controller {
  open() {
    const templateId = this.element.getAttribute('data-template-id')
    const template = document.getElementById(templateId)
    const modalRoot = document.getElementById('modal-root')

    modalRoot.innerHTML = template.innerHTML
  }
}
