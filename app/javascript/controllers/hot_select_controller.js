import { Controller } from '@hotwired/stimulus'
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

    document.addEventListener('click', this.onClickOutside)
    document.addEventListener('turbo:before-render', this.close)
    if (
      this.selectInputTarget.selectedOptions.length > 0 &&
      this.selectInputTarget.selectedOptions[0].value
    ) {
      this.displayValueTarget.innerHTML = this.selectInputTarget.selectedOptions[0].text
      if (this.hasPlaceholderTarget) this.placeholderTarget.classList.add('hide')
    } else {
      this.displayValueTarget.classList.add('hide')
    }
  }

  disconnect() {
    document.removeEventListener('click', this.onClickOutside)
    document.removeEventListener('turbo:before-render', this.close)

    if (this.isOpen) this.close()
  }

  toggle() {
    this.element.classList.toggle('hot-select--open')
    if (!this.isOpen) return this.close()

    this.dropdownRoot.innerHTML = this.dropdownTarget.innerHTML
    this.copyOptionsFromSelect()
    this.selectableContainer.addEventListener('click', this.choose.bind(this))

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
    this.dropdownRoot?.replaceChildren()
    this.element.classList.remove('hot-select--open')
  }

  onClickOutside(event) {
    if (!this.isOpen) return

    if (!this.element.contains(event.target)) {
      this.close()
    }
  }

  choose(event) {
    const value = event.target.closest('.hot-select-option').getAttribute('data-value')
    const option = [...this.selectInputTarget.options].find(opt => opt.value === value)
    if (!option) {
      const option = document.createElement('option')
      option.value = value
      option.textContent = event.target.innerHTML
      this.selectInputTarget.appendChild(option)
    }
    this.selectInputTarget.value = value
    this.displayValueTarget.innerHTML = event.target.innerHTML
    this.displayValueTarget.classList.remove('hide')
    if (this.hasPlaceholderTarget) this.placeholderTarget.classList.add('hide')
    this.selectInputTarget.dispatchEvent(new Event('change', { bubbles: true }))

    this.close()
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
    if (this.hasPlaceholderTarget) this.placeholderTarget.classList.remove('hide')
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
    div.setAttribute('data-action', 'click->hot-select#choose')
    this.optionsContainer.insertAdjacentHTML('beforeend', div.outerHTML)
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
    return this.dropdown.querySelector('[data-hot-select-target="searchInput"]') !== null
  }

  get searchInput() {
    return this.dropdown.querySelector('[data-hot-select-target="searchInput"]')
  }
}
