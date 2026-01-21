import { Controller } from '@hotwired/stimulus'
import { orient } from 'helpers/orientation_helpers'

export default class extends Controller {
  connect() {
    this.element.addEventListener('mouseenter', this.mouseEnter)
    this.element.addEventListener('mouseout', this.mouseOut)
  }

  disconnect() {
    this.element.removeEventListener('mouseenter', this.mouseEnter)
    this.element.removeEventListener('mouseout', this.mouseOut)
  }

  mouseEnter = () => {
    if (this.#tooltipElement) orient(this.#tooltipElement)
  }

  mouseOut = () => {
    if (this.#tooltipElement) orient(this.#tooltipElement, false)
  }

  get #tooltipElement() {
    return this.element.querySelector('.for-screen-reader')
  }
}
