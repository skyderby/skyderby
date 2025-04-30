import { Controller } from 'stimulus'

export default class extends Controller {
  trigger() {
    this.ensureGroupUniqueness()
    this.element.replaceWith(
      ...this.element.querySelector('.hot-select-options').children
    )
  }

  ensureGroupUniqueness() {
    const parent = this.element.parentElement

    if (!parent || !parent.classList.contains('.hot-select-options')) return

    const existingGroups = parent.querySelectorAll('.hot-select-option-group')
    const lastGroup =
      existingGroups.length > 0 ? existingGroups[existingGroups.length - 1] : null

    const firstNewGroup = this.element.querySelector('.hot-select-option-group')

    if (
      lastGroup &&
      firstNewGroup &&
      lastGroup.textContent.trim() === firstNewGroup.textContent.trim()
    ) {
      firstNewGroup.remove()
    }
  }
}
