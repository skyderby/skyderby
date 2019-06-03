import { Controller } from 'stimulus'

const SELECT = 'select'
const TEXT = 'text'

export default class extends Controller {
  static targets = ['link', 'caption', 'text', 'select']

  connect() {
    this.mode = this.element.getAttribute('data-mode')
    this.setMode()
  }

  trigger(e) {
    e.preventDefault()

    if (this.mode === SELECT) {
      this.mode = TEXT
    } else {
      this.mode = SELECT
    }

    this.setMode()
  }

  setMode() {
    if (this.mode === SELECT) {
      this.setSelectMode()
    } else {
      this.setTextMode()
    }
  }

  setSelectMode() {
    this.suitSelectVisibility = true
    this.suitNameVisibility = false

    this.linkText = this.selectModeLinkText
    this.caption = this.selectModeCaption
  }

  setTextMode() {
    this.suitSelectVisibility = false
    this.suitNameVisibility = true

    this.linkText = this.textModeLinkText
    this.caption = this.textModeCaption
  }

  set suitSelectVisibility(visible) {
    const value = visible ? 'block' : 'none'
    this.selectTarget.style.display = value
    this.selectTarget.nextElementSibling.style.display = value
  }

  set suitNameVisibility(visible) {
    const value = visible ? 'block' : 'none'
    this.textTarget.style.display = value
  }

  set linkText(val) {
    this.linkTarget.innerText = val
  }

  set caption(val) {
    this.captionTarget.innerText = val
  }
}
