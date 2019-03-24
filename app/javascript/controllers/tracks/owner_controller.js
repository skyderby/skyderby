import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = [ 'type', 'select' ]

  connect() {
    this.setVisibility()
  }

  setVisibility() {
    const type = this.typeTarget.value.toLowerCase()
    this.selectTargets.forEach(group => {
      const visibility = group.getAttribute('data-type') === type ? 'block' : 'none'
      group.style.display = visibility
    })
  }
}
