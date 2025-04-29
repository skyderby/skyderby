import { Controller } from 'stimulus'
import { createPopper } from '@popperjs/core'

export default class HotSelect extends Controller {
  static targets = [
    'dropdown',
    'searchInput',
    'selectInput',
    'displayValue',
    'placeholder'
  ]

  connect() {
    this.onClickOutside = this.onClickOutside.bind(this)
    this.close = this.close.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)

    this.focusedOptionIndex = -1

    document.addEventListener('click', this.onClickOutside)
    document.addEventListener('turbo:before-render', this.close)
    if (
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
    document.removeEventListener('click', this.onClickOutside)
    document.removeEventListener('turbo:before-render', this.close)
    document.removeEventListener('keydown', this.onKeyDown)

    if (this.isOpen) this.close()
  }

  toggle() {
    this.element.classList.toggle('hot-select--open')
    this.element.setAttribute('aria-expanded', this.isOpen ? 'true' : 'false')

    if (!this.isOpen) return this.close()

    this.dropdownRoot.innerHTML = this.dropdownTarget.innerHTML
    this.copyOptionsFromSelect()
    this.selectableContainer.addEventListener('click', this.choose.bind(this))

    this.focusedOptionIndex = -1

    document.addEventListener('keydown', this.onKeyDown)

    if (this.hasSearch) this.searchInput.focus()

    createPopper(this.element, this.dropdown, {
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8]
          }
        },
        {
          name: 'sameWidth',
          enabled: true,
          fn: ({ state }) => {
            state.styles.popper.width = `${state.rects.reference.width}px`
          },
          phase: 'beforeWrite',
          requires: ['computeStyles']
        }
      ]
    })
  }

  close() {
    this.dropdownRoot.replaceChildren()
    this.element.classList.remove('hot-select--open')
    this.element.setAttribute('aria-expanded', 'false')
    document.removeEventListener('keydown', this.onKeyDown)
    this.focusedOptionIndex = -1
  }

  onClickOutside(event) {
    if (!this.isOpen) return

    if (!this.element.contains(event.target)) {
      this.close()
    }
  }

  onKeyDown(event) {
    if (!this.isOpen) return

    const options = this.getOptions()

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        this.focusedOptionIndex = Math.min(
          this.focusedOptionIndex + 1,
          options.length - 1
        )
        this.updateFocusedOption()
        this.scrollToFocusedOption()
        break
      case 'ArrowUp':
        event.preventDefault()
        this.focusedOptionIndex = Math.max(this.focusedOptionIndex - 1, 0)
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
      const value = option.getAttribute('data-value')
      const text = option.textContent

      this.selectOption(value, text)
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
    const value = optionElement.getAttribute('data-value')
    const text = optionElement.innerHTML

    this.selectOption(value, text)
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

  copyOptionsFromSelect() {
    const options = this.selectInputTarget.options
    if (options.length > 0) {
      this.optionsContainer.innerHTML = ''
      Array.from(this.selectInputTarget.options).forEach(this.createOption.bind(this))
    }
  }

  createOption(option) {
    const div = document.createElement('div')
    div.classList.add('hot-select-option')
    div.textContent = option.text
    div.setAttribute('data-value', option.value)
    div.setAttribute('tabindex', '-1')
    div.setAttribute('role', 'option')
    div.setAttribute('tabindex', '-1') // Make it programmatically focusable but not in tab order
    div.setAttribute('role', 'option')
    this.optionsContainer.insertAdjacentHTML('beforeend', div.outerHTML)
  }

  getOptions() {
    return Array.from(this.optionsContainer.querySelectorAll('.hot-select-option'))
  }

  get isOpen() {
    return this.element.classList.contains('hot-select--open')
  }

  get dropdownRoot() {
    return document.getElementById('dropdown-root')
  }

  get dropdown() {
    return this.dropdownRoot.querySelector('.hot-select-dropdown')
  }

  get optionsContainer() {
    return this.dropdownRoot.querySelector('.hot-select-options')
  }

  get selectableContainer() {
    return this.dropdownRoot.querySelector('.hot-select-selectable')
  }

  get hasSearch() {
    return this.dropdown.querySelector('[data-target="hot-select.searchInput"]') !== null
  }

  get searchInput() {
    return this.dropdown.querySelector('[data-target="hot-select.searchInput"]')
  }
}
