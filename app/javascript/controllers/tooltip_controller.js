import { Controller } from '@hotwired/stimulus'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

export default class extends Controller {
  connect() {
    tippy(this.element, {
      content: this.element.getAttribute('data-tooltip'),
      theme: 'light-border',
      arrow: true
    })
  }
}
