import { Controller } from '@hotwired/stimulus'
import debounce from 'lodash.debounce'

export default class HotSelect extends Controller {
  static targets = [
    'dropdown',
    'searchInput',
    'selectInput',
    'displayValue',
    'initialOptions',
    'placeholder',
    'options',
    'frame'
  ]

  connect() {
    this.close = this.close.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onToggle = this.onToggle.bind(this)
    this.syncDisplay = this.syncDisplay.bind(this)
    this.search = debounce(this.search.bind(this), 300)

    this.focusedOptionIndex = -1

    this.dropdownTarget.addEventListener('toggle', this.onToggle)
    this.selectInputTarget.addEventListener('change', this.syncDisplay)
    document.addEventListener('turbo:before-render', this.close)

    const initialSelected =
      this.hasInitialOptionsTarget &&
      this.initialOptionsTarget.querySelector('[aria-selected="true"]')

    if (initialSelected) {
      this.displayValueTarget.innerHTML = initialSelected.innerHTML
      this.placeholderTarget.classList.add('hide')
    } else if (
      this.selectInputTarget.selectedOptions.length > 0 &&
      this.selectInputTarget.selectedOptions[0].value
    ) {
      this.displayValueTarget.innerHTML = this.selectInputTarget.selectedOptions[0].text
      this.placeholderTarget.classList.add('hide')
    } else {
      this.displayValueTarget.classList.add('hide')
    }
  }

  disconnect() {
    this.dropdownTarget.removeEventListener('toggle', this.onToggle)
    this.selectInputTarget.removeEventListener('change', this.syncDisplay)
    document.removeEventListener('turbo:before-render', this.close)
    document.removeEventListener('keydown', this.onKeyDown)

    if (this.isOpen) this.close()
  }

  toggle() {
    if (this.isOpen) {
      this.dropdownTarget.hidePopover()
    } else {
      this.dropdownTarget.showPopover()
    }
  }

  onControlKeyDown(event) {
    if (this.isOpen) return

    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault()
      this.dropdownTarget.showPopover()
    }
  }

  syncDisplay() {
    const selected = this.selectInputTarget.selectedOptions[0]

    if (selected && selected.value) {
      this.displayValueTarget.innerHTML = selected.text
      this.displayValueTarget.classList.remove('hide')
      this.placeholderTarget.classList.add('hide')
    } else {
      this.displayValueTarget.classList.add('hide')
      this.placeholderTarget.classList.remove('hide')
    }
  }

  onToggle(event) {
    this.element.setAttribute(
      'aria-expanded',
      event.newState === 'open' ? 'true' : 'false'
    )

    if (event.newState === 'open') {
      this.copyOptionsFromSelect()
      this.selectableContainer.addEventListener('click', this.choose.bind(this))
      this.focusedOptionIndex = -1
      document.addEventListener('keydown', this.onKeyDown)
      if (this.hasSearchInputTarget) {
        this.searchInputTarget.disabled = false
        this.searchInputTarget.focus()
      }
    } else {
      document.removeEventListener('keydown', this.onKeyDown)
      this.focusedOptionIndex = -1
      if (this.hasSearchInputTarget) {
        this.searchInputTarget.disabled = true
      }
    }
  }

  close() {
    this.dropdownTarget.hidePopover()
  }

  onKeyDown(event) {
    if (!this.isOpen) return

    const options = this.getOptions()

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        this.focusedOptionIndex = this.nextEnabledIndex(this.focusedOptionIndex, 1)
        this.updateFocusedOption()
        this.scrollToFocusedOption()
        break
      case 'ArrowUp':
        event.preventDefault()
        this.focusedOptionIndex = this.nextEnabledIndex(this.focusedOptionIndex, -1)
        this.updateFocusedOption()
        this.scrollToFocusedOption()
        break
      case 'Enter':
        event.preventDefault()
        if (this.focusedOptionIndex >= 0 && this.focusedOptionIndex < options.length) {
          this.chooseOptionByIndex(this.focusedOptionIndex)
        }
        break
      case 'Escape':
        event.preventDefault()
        this.close()
        break
      case 'Tab':
        this.close()
        break
    }
  }

  nextEnabledIndex(from, direction) {
    const options = this.getOptions()
    let index = from

    while (true) {
      index += direction
      if (index < 0 || index >= options.length) return from
      if (!options[index].classList.contains('hot-select-option--disabled')) return index
    }
  }

  updateFocusedOption() {
    const options = this.getOptions()

    options.forEach(option => {
      option.classList.remove('hot-select-option--focused')
    })

    if (this.focusedOptionIndex >= 0 && this.focusedOptionIndex < options.length) {
      options[this.focusedOptionIndex].classList.add('hot-select-option--focused')
    }
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

  chooseOptionByIndex(index) {
    const options = this.getOptions()
    if (index >= 0 && index < options.length) {
      const option = options[index]
      if (option.classList.contains('hot-select-option--disabled')) return

      const value = option.getAttribute('data-value')

      this.selectOption(value, this.optionLabel(option))
    }
  }

  selectOption(value, text) {
    const option = [...this.selectInputTarget.options].find(opt => opt.value === value)
    if (!option) {
      const option = document.createElement('option')
      option.value = value
      option.textContent = text
      this.selectInputTarget.appendChild(option)
    }
    this.selectInputTarget.value = value
    this.displayValueTarget.innerHTML = text
    this.displayValueTarget.classList.remove('hide')
    this.placeholderTarget.classList.add('hide')
    this.selectInputTarget.dispatchEvent(new Event('change', { bubbles: true }))

    this.close()
  }

  choose(event) {
    const optionElement = event.target.closest('.hot-select-option')
    if (!optionElement) return
    if (optionElement.classList.contains('hot-select-option--disabled')) return

    const value = optionElement.getAttribute('data-value')

    this.selectOption(value, this.optionLabel(optionElement))
  }

  optionLabel(optionElement) {
    const label = optionElement.querySelector('.hot-select-option-label')
    return label ? label.innerHTML : optionElement.innerHTML
  }

  clear() {
    const option = [...this.selectInputTarget.options].find(opt => opt.value === '')
    if (!option) {
      const option = document.createElement('option')
      option.value = ''
      option.textContent = ''
      this.selectInputTarget.appendChild(option)
    }
    this.selectInputTarget.value = ''
    this.placeholderTarget.classList.remove('hide')
    this.displayValueTarget.classList.add('hide')
    this.displayValueTarget.innerHTML = '&nbsp;'
    this.selectInputTarget.dispatchEvent(new Event('change', { bubbles: true }))
  }

  search() {
    if (!this.hasFrameTarget) return

    const term = this.searchInputTarget.value
    const url = new URL(this.frameTarget.src, window.location.origin)
    url.searchParams.set('term', term)
    url.searchParams.set('page', '1')
    this.frameTarget.src = url.toString()
  }

  copyOptionsFromSelect() {
    if (!this.hasOptionsTarget) return

    const options = this.selectInputTarget.options
    if (options.length > 0) {
      this.optionsTarget.innerHTML = ''
      Array.from(this.selectInputTarget.options).forEach(this.createOption.bind(this))
    }
  }

  createOption(option) {
    const div = document.createElement('div')
    div.classList.add('hot-select-option')
    div.setAttribute('data-value', option.value)
    div.setAttribute('tabindex', '-1')
    div.setAttribute('role', 'option')

    if (option.disabled) {
      div.classList.add('hot-select-option--disabled')
      div.setAttribute('aria-disabled', 'true')
    }

    if (option.dataset.icon) {
      const icon = document.createElement('span')
      icon.className = `icon icon--${option.dataset.icon} hot-select-option-icon`
      if (option.dataset.iconClass) icon.classList.add(option.dataset.iconClass)
      div.appendChild(icon)
    }

    const label = document.createElement('span')
    label.classList.add('hot-select-option-label')
    label.textContent = option.text
    div.appendChild(label)

    this.optionsTarget.insertAdjacentHTML('beforeend', div.outerHTML)
  }

  getOptions() {
    return Array.from(this.dropdownTarget.querySelectorAll('.hot-select-option'))
  }

  get isOpen() {
    return this.dropdownTarget.matches(':popover-open')
  }

  get selectableContainer() {
    return this.dropdownTarget.querySelector('.hot-select-selectable')
  }
}
