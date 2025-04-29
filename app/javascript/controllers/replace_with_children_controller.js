import { Controller } from 'stimulus'

export default class extends Controller {
  trigger({ target }) {
    this.element.replaceWith(...target.children)
  }
}
