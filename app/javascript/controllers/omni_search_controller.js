import { Controller } from 'stimulus'
import { createPopper } from '@popperjs/core'

export default class OmniSearchController extends Controller {
  static targets = ['model', 'typeSelect']

  connect() {
    this.onClickOutside = this.onClickOutside.bind(this)
    this.close = this.close.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)

    document.addEventListener('click', this.onClickOutside)
    document.addEventListener('turbo:before-render', this.close)
  }

  toggle() {
    this.element.classList.toggle('hot-select--open')

    if (!this.element.classList.contains('hot-select--open')) {
      this.close()
      return
    }

    this.openTypeSelect()
  }

  openTypeSelect() {
    this.dropdownRoot.innerHTML = this.typeSelectTarget.innerHTML

    const optionsContainer = this.dropdownRoot.querySelector('.hot-select-dropdown')
    optionsContainer.addEventListener('click', this.selectType.bind(this))

    this.positionDropdown()

    document.addEventListener('keydown', this.onKeyDown)
  }

  selectType(event) {
    const optionElement = event.target.closest('.hot-select-option')
    if (!optionElement) return

    const type = optionElement.getAttribute('data-value')

    const matchingModel = this.modelTargets.find(
      model => model.getAttribute('name') === type
    )

    if (matchingModel) {
      setTimeout(() => {
        this.openModelDropdown(matchingModel)
      }, 0)
    }
  }

  openModelDropdown(modelElement) {
    this.dropdownRoot.innerHTML = modelElement.innerHTML

    const optionsContainer = this.dropdownRoot.querySelector('.hot-select-dropdown')
    if (optionsContainer) {
      optionsContainer.addEventListener('click', this.selectModel.bind(this))
    }

    const searchInput = this.dropdownRoot.querySelector(
      '[data-target="hot-select.searchInput"]'
    )
    if (searchInput) searchInput.focus()

    this.positionDropdown()
  }

  positionDropdown() {
    createPopper(this.element, this.dropdownRoot.querySelector('.hot-select-dropdown'), {
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

  selectModel(event) {
    const optionElement = event.target.closest('.hot-select-option')
    if (!optionElement) return

    const value = optionElement.getAttribute('data-value')
    const text = optionElement.textContent.trim()

    console.log(`Selected: ${text} (${value})`)

    this.close()
  }

  onClickOutside(event) {
    if (!this.element.classList.contains('hot-select--open')) return

    if (
      !this.element.contains(event.target) &&
      !this.dropdownRoot.contains(event.target)
    ) {
      this.close()
    }
  }

  onKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      this.close()
    }
  }

  close() {
    const dropdownRoot = document.getElementById('dropdown-root')
    dropdownRoot.innerHTML = ''
    this.element.classList.remove('hot-select--open')
    document.removeEventListener('keydown', this.onKeyDown)
  }

  get dropdownRoot() {
    return document.getElementById('dropdown-root')
  }
}
