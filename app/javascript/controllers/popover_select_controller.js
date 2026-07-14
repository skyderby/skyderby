import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  close() {
    this.dropdownTarget.hidePopover()
  }

  get isOpen() {
    return this.dropdownTarget.matches(':popover-open')
  }

  get selectableContainer() {
    return this.dropdownTarget.querySelector('.hot-select-selectable')
  }

  getOptions() {
    return Array.from(this.dropdownTarget.querySelectorAll('.hot-select-option'))
  }

  updateFocusedOption() {
    const options = this.getOptions()

    options.forEach(option => {
      option.classList.remove('hot-select-option--focused')
    })

    if (this.focusedOptionIndex >= 0 && this.focusedOptionIndex < options.length) {
      options[this.focusedOptionIndex].classList.add('hot-select-option--focused')
    }

    this.scrollToFocusedOption()
  }

  scrollToFocusedOption() {
    const options = this.getOptions()
    if (this.focusedOptionIndex >= 0 && this.focusedOptionIndex < options.length) {
      const focusedOption = options[this.focusedOptionIndex]
      const container = this.selectableContainer

      const optionTop = focusedOption.offsetTop
      const optionBottom = optionTop + focusedOption.offsetHeight
      const containerTop = container.scrollTop
      const containerBottom = containerTop + container.offsetHeight

      if (optionBottom > containerBottom) {
        container.scrollTop = optionBottom - container.offsetHeight
      } else if (optionTop < containerTop) {
        container.scrollTop = optionTop
      }
    }
  }

  updateFrameSearch(frame, term) {
    const url = new URL(frame.src, window.location.origin)
    url.searchParams.set('term', term)
    url.searchParams.set('page', '1')
    frame.src = url.toString()
  }
}
