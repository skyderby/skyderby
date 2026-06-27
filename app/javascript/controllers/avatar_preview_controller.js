import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['input', 'image']

  preview() {
    const file = this.inputTarget.files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    this.imageTargets.forEach(image => (image.src = url))
  }
}
