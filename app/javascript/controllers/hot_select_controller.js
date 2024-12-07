import { Controller } from 'stimulus'
import { createPopper } from '@popperjs/core'

export default class HotSelect extends Controller {
  static targets = ['dropdown', 'searchInput', 'selectInput', 'displayValue']

  connect() {}

  toggle() {
    this.dropdownTarget.classList.toggle('hot-select--hidden')

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

    this.searchInputTarget.focus()
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
}
