import { Controller } from '@hotwired/stimulus'

const STRENGTHS = ['light', 'medium', 'strong']

export default class extends Controller {
  static targets = ['strength', 'direction', 'cell', 'caption']
  static values = { hint: String }

  connect() {
    this.render()
  }

  select(event) {
    const cell = event.currentTarget

    if (cell === this.selectedCell) {
      this.strengthTarget.value = ''
      this.directionTarget.value = ''
    } else {
      this.strengthTarget.value = cell.dataset.strength
      this.directionTarget.value = cell.dataset.direction
    }

    this.render()
  }

  key(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    this.select(event)
  }

  render() {
    const selected = this.selectedCell

    this.cellTargets.forEach(cell => {
      cell.classList.toggle('wind-target__cell--selected', cell === selected)
      cell.classList.toggle('wind-target__cell--filled', this.isFilled(cell, selected))
      cell.setAttribute('aria-checked', cell === selected)
    })
    this.captionTarget.textContent = selected
      ? selected.getAttribute('aria-label')
      : this.hintValue
  }

  isFilled(cell, selected) {
    if (!selected || selected.dataset.direction !== cell.dataset.direction) return false

    return (
      STRENGTHS.indexOf(cell.dataset.strength) <=
      STRENGTHS.indexOf(selected.dataset.strength)
    )
  }

  get selectedCell() {
    const strength = this.strengthTarget.value
    const direction = this.directionTarget.value
    if (!strength) return undefined

    return this.cellTargets.find(
      cell => cell.dataset.strength === strength && cell.dataset.direction === direction
    )
  }
}
