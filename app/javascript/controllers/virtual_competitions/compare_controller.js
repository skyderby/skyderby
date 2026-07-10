import { Controller } from '@hotwired/stimulus'
import amplitude from 'utils/amplitude'
import I18n from 'i18n'

export default class extends Controller {
  static targets = ['startButton', 'panel', 'slot', 'submit', 'trackA', 'trackB', 'row']
  static values = {
    competitionId: Number,
    kind: String,
    discipline: String
  }

  connect() {
    this.selected = []
  }

  activate() {
    this.active = true
    this.element.classList.add('vc-compare-active')
    this.startButtonTarget.hidden = true
    this.panelTarget.hidden = false

    amplitude.track('competition_compare_activated', {
      source: 'virtual_competitions',
      competition_id: this.competitionIdValue,
      kind: this.kindValue,
      discipline: this.disciplineValue
    })

    this.render()
  }

  cancel() {
    this.active = false
    this.selected = []
    this.element.classList.remove('vc-compare-active')
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
        slot.classList.add('vc-compare-slot--filled')
        slot.innerHTML = `
          <div class="vc-compare-slot__info">
            <span class="vc-compare-slot__pilot">${track.pilot}</span>
            <span class="vc-compare-slot__result">${track.result}</span>
          </div>
          <button type="button" class="vc-compare-slot__remove" aria-label="remove"
                  data-index="${index}"
                  data-action="virtual-competitions--compare#removeSlot">&times;</button>
        `
      } else {
        slot.classList.remove('vc-compare-slot--filled')
        slot.innerHTML = `<span class="vc-compare-slot__placeholder">${I18n.t('virtual_competitions.compare.slot_placeholder')}</span>`
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
