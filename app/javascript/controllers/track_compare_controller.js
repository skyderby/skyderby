import { Controller } from '@hotwired/stimulus'
import amplitude from 'utils/amplitude'

export default class extends Controller {
  static targets = ['startButton', 'panel', 'slot', 'submit', 'trackA', 'trackB', 'row']
  static values = {
    source: String,
    competitionId: Number,
    kind: String,
    discipline: String,
    slotPlaceholder: String
  }

  connect() {
    this.selected = []
  }

  activate() {
    this.active = true
    this.element.classList.add('compare-active')
    this.startButtonTarget.hidden = true
    this.panelTarget.hidden = false

    const properties = {
      source: this.sourceValue,
      competition_id: this.competitionIdValue,
      kind: this.kindValue
    }
    if (this.hasDisciplineValue && this.disciplineValue) {
      properties.discipline = this.disciplineValue
    }
    amplitude.track('competition_compare_activated', properties)

    this.render()
  }

  cancel() {
    this.active = false
    this.selected = []
    this.element.classList.remove('compare-active')
    this.startButtonTarget.hidden = false
    this.panelTarget.hidden = true
    this.render()
  }

  selectRow(event) {
    if (!this.active) return
    event.preventDefault()

    const { trackId, pilot, result, kind } = event.currentTarget.dataset
    this.toggleTrack({ id: trackId, pilot, result, kind })
  }

  toggleTrack(track) {
    const existingIndex = this.selected.findIndex(item => item.id === track.id)
    if (existingIndex !== -1) {
      this.selected.splice(existingIndex, 1)
    } else if (this.selected.length < 2 && this.kindAllowed(track.kind)) {
      this.selected.push(track)
    }

    this.render()
  }

  kindAllowed(kind) {
    return this.selected.length === 0 || this.selected[0].kind === kind
  }

  removeSlot(event) {
    const index = Number(event.currentTarget.dataset.index)
    if (this.selected[index]) {
      this.selected.splice(index, 1)
      this.render()
    }
  }

  swap() {
    this.selected.reverse()
    this.render()
  }

  render() {
    this.slotTargets.forEach((slot, index) => {
      const track = this.selected[index]
      if (track) {
        slot.classList.add('compare-slot--filled')
        slot.innerHTML = `
          <div class="compare-slot__info">
            <span class="compare-slot__pilot">${track.pilot || ''}</span>
            <span class="compare-slot__result">${track.result || ''}</span>
          </div>
          <button type="button" class="compare-slot__remove" aria-label="remove"
                  data-index="${index}"
                  data-action="track-compare#removeSlot">&times;</button>
        `
      } else {
        slot.classList.remove('compare-slot--filled')
        slot.innerHTML = `<span class="compare-slot__placeholder">${this.slotPlaceholderValue}</span>`
      }
    })

    const ready = this.selected.length === 2
    this.submitTarget.disabled = !ready
    this.trackATarget.value = this.selected[0]?.id || ''
    this.trackBTarget.value = this.selected[1]?.id || ''

    const selectedIds = this.selected.map(item => item.id)
    this.rowTargets.forEach(row => {
      row.classList.toggle('is-selected', selectedIds.includes(row.dataset.trackId))
    })
  }
}
