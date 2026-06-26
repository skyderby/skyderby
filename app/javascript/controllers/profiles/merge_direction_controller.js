import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['flip', 'currentLabel', 'otherLabel', 'arrow']
  static values = { destination: String, source: String }

  connect() {
    this.flipped = false
    this.update()
  }

  flip() {
    this.flipped = !this.flipped
    this.update()
  }

  update() {
    this.flipTarget.value = this.flipped ? '1' : ''
    this.currentLabelTarget.textContent = this.flipped
      ? this.sourceValue
      : this.destinationValue
    this.otherLabelTarget.textContent = this.flipped
      ? this.destinationValue
      : this.sourceValue
    this.arrowTarget.classList.toggle('merge-direction__arrow--flipped', this.flipped)
  }
}
