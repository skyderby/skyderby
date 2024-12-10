import { Controller } from 'stimulus'
import { createPopper } from '@popperjs/core'

export default class HotSelect extends Controller {
  static targets = ['dropdown', 'searchInput', 'selectInput', 'displayValue', 'options']

  connect() {
    const options = this.selectInputTarget.options
    if (options.length > 0) {
      this.optionsTarget.innerHTML = ''
      Array.from(this.selectInputTarget.options).forEach(this.createOption.bind(this))
    }

    this.hasSearch =
      this.element.querySelector('[data-target="hot-select.searchInput"]') !== null

    if (this.selectInputTarget.selectedOptions.length > 0) {
      this.displayValueTarget.innerHTML = this.selectInputTarget.selectedOptions[0].text
    }
  }

  toggle() {
    this.dropdownTarget.classList.toggle('hot-select--hidden')
    const isOpen = !this.dropdownTarget.classList.contains('hot-select--hidden')

    if (!isOpen) return

    if (this.hasSearch) this.searchInputTarget.focus()

    createPopper(this.element, this.dropdownTarget, {
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
    this.dropdownTarget.classList.add('hot-select--hidden')
  }

  choose(event) {
    const value = event.target.getAttribute('data-value')
    const option = [...this.selectInputTarget.options].find(opt => opt.value === value)
    if (!option) {
      const option = document.createElement('option')
      option.value = value
      option.textContent = value
      this.selectInputTarget.appendChild(option)
    }
    this.selectInputTarget.value = value
    this.displayValueTarget.innerHTML = event.target.innerHTML

    this.close()
  }

  clear() {
    this.selectInputTarget.value = ''
    this.displayValueTarget.innerHTML = '&nbsp;'
  }

  createOption(option) {
    const div = document.createElement('div')
    div.classList.add('hot-select-option')
    div.textContent = option.text
    div.setAttribute('data-value', option.value)
    div.setAttribute('data-action', 'click->hot-select#choose')
    this.optionsTarget.insertAdjacentHTML('beforeend', div.outerHTML)
  }
}
