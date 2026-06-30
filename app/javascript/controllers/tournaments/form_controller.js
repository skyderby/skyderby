import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['finishLineSelect']

  on_change_place(event) {
    const placeId = event.target.value

    this.resetFinishLine()
    this.updateFinishLineSource(placeId)
  }

  resetFinishLine() {
    if (!this.hasFinishLineSelectTarget) return

    const select = this.finishLineSelectTarget
    select.innerHTML = ''
    select.value = ''
    select.dispatchEvent(new Event('change', { bubbles: true }))
  }

  updateFinishLineSource(placeId) {
    if (!this.hasFinishLineSelectTarget) return

    const frame = this.finishLineSelectTarget
      .closest('.hot-select-container')
      ?.querySelector('[data-hot-select-target="frame"]')
    if (!frame) return

    const url = new URL(frame.src, window.location.origin)

    if (placeId) {
      url.searchParams.set('place_id', placeId)
    } else {
      url.searchParams.delete('place_id')
    }
    url.searchParams.set('page', '1')

    frame.src = url.toString()
  }
}
