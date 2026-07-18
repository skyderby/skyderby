import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['tab', 'panel']

  select(event) {
    const index = this.tabTargets.indexOf(event.currentTarget)
    if (index === -1) return

    this.tabTargets.forEach((tab, position) =>
      tab.setAttribute('aria-selected', String(position === index))
    )
    this.panelTargets.forEach((panel, position) => {
      panel.hidden = position !== index
    })
  }
}
