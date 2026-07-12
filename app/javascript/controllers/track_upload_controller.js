import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = [
    'number',
    'matches',
    'file',
    'feedback',
    'keepAdding',
    'overlay',
    'spinner',
    'success'
  ]
  static values = { competitors: Array, notFoundText: String }

  connect() {
    this.element.addEventListener('turbo:submit-start', this.submitStart)
    this.element.addEventListener('turbo:submit-end', this.submitEnd)
    this.numberTarget.focus()
  }

  disconnect() {
    this.element.removeEventListener('turbo:submit-start', this.submitStart)
    this.element.removeEventListener('turbo:submit-end', this.submitEnd)
    clearTimeout(this.successTimeout)
  }

  match = () => {
    const number = this.numberTarget.value.trim()

    if (!number) {
      this.matchesTarget.innerHTML = ''
      return
    }

    const found = this.competitorsValue.filter(competitor => competitor.number === number)

    if (found.length === 0) {
      this.matchesTarget.innerHTML = `<span class="track-upload-no-match">${this.escape(this.notFoundTextValue)}</span>`
      return
    }

    this.matchesTarget.innerHTML = found
      .map(
        competitor => `
          <div class="track-upload-match">
            <span class="track-upload-match-name">${this.escape(competitor.name)}</span>
            <span class="track-upload-match-category">${this.escape(competitor.category)}</span>
          </div>`
      )
      .join('')
  }

  submitStart = () => {
    clearTimeout(this.successTimeout)
    this.feedbackTarget.innerHTML = ''
    this.successTarget.hidden = true
    this.spinnerTarget.hidden = false
    this.overlayTarget.hidden = false
  }

  submitEnd = event => {
    if (event.target !== this.element) return

    if (!event.detail.success) {
      this.overlayTarget.hidden = true
      return
    }

    this.spinnerTarget.hidden = true
    this.successTarget.hidden = false

    this.successTimeout = setTimeout(() => {
      this.overlayTarget.hidden = true

      if (this.hasKeepAddingTarget && this.keepAddingTarget.checked) {
        this.reset()
      } else {
        this.element.dispatchEvent(new CustomEvent('form:submit-success'))
      }
    }, 700)
  }

  reset() {
    this.numberTarget.value = ''
    this.fileTarget.value = ''
    this.matchesTarget.innerHTML = ''
    this.numberTarget.focus()
  }

  escape(value) {
    const div = document.createElement('div')
    div.textContent = value ?? ''
    return div.innerHTML
  }
}
