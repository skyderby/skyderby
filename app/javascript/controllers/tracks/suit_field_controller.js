import { Controller } from 'stimulus'

const SELECT = 'select'
const TEXT = 'text'

export default class extends Controller {
  static targets = [ 'link', 'caption', 'text', 'select' ]

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

    this.resetSuitName()

    this.linkText = I18n.t('tracks.form.toggle_suit_link')
    this.caption = I18n.t('tracks.form.toggle_suit_caption')
  }

  setTextMode() {
    this.suitSelectVisibility = false
    this.suitNameVisibility = true

    this.resetSuitSelectValue()

    this.linkText = I18n.t('tracks.form.toggle_suit_link_select')
    this.caption = I18n.t('tracks.form.toggle_suit_caption_select')
  }

  resetSuitName() {
    this.textTarget.value = ''
  }

  resetSuitSelectValue() {
    $(this.selectTarget).val(null).trigger('change')
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
