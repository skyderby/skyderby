import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  closeOnBackdrop(event) {
    if (event.target.matches('dialog')) event.target.close()
  }
}
