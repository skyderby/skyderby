import { Controller } from 'stimulus'
import { createPopper } from '@popperjs/core'

export default class OmniSearchController extends Controller {
  static targets = ['model', 'typeSelect', 'tagsContainer', 'tagTemplate']

  connect() {
    this.onClickOutside = this.onClickOutside.bind(this)
    this.close = this.close.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)

    this.focusedOptionIndex = -1
    this.currentView = null
    this.currentType = null
    this.currentTypeLabel = null

    document.addEventListener('click', this.onClickOutside)
    document.addEventListener('turbo:before-render', this.close)
  }

  disconnect() {
    document.removeEventListener('click', this.onClickOutside)
    document.removeEventListener('turbo:before-render', this.close)
    document.removeEventListener('keydown', this.onKeyDown)

    if (this.element.classList.contains('hot-select--open')) this.close()
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

    this.currentView = 'type'
    this.focusedOptionIndex = -1
    document.addEventListener('keydown', this.onKeyDown)
  }

  selectType({ target }) {
    const optionElement = target.closest('.hot-select-option')
    if (!optionElement) return

    this.currentType = optionElement.dataset.value
    this.currentTypeLabel = optionElement.dataset.label

    setTimeout(() => this.openModelDropdown(), 0)
  }

  openModelDropdown() {
    const modelElement = this.modelTargets.find(
      model => model.dataset.name === this.currentType
    )

    if (!modelElement)
      throw new Error(`Can not find elements dropdown for type: ${this.currentType}`)

    this.dropdownRoot.innerHTML = modelElement.innerHTML

    const optionsContainer = this.dropdownRoot.querySelector('.hot-select-dropdown')
    if (!optionsContainer)
      throw new Error(`Can not find dropdown element for ${this.currentType}`)

    optionsContainer.addEventListener('click', this.selectModel.bind(this))

    const searchInput = this.dropdownRoot.querySelector(
      '[data-target="hot-select.searchInput"]'
    )
    if (searchInput) searchInput.focus()

    this.positionDropdown()

    this.currentView = 'model'
    this.focusedOptionIndex = -1
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

    const value = optionElement.dataset.value
    const text = optionElement.textContent.trim()

    this.addFilterTag(this.currentType, this.currentTypeLabel, value, text)

    this.close()
  }

  addFilterTag(type, label, value, text) {
    const tagElement = this.tagTemplateTarget.content
      .querySelector('.filter-tag')
      .cloneNode(true)
    tagElement.dataset.value = value
    tagElement.dataset.type = type
    tagElement.querySelector('.filter-tag-type').textContent = label
    tagElement.querySelector('.filter-tag-value').textContent = text

    this.tagsContainerTarget.appendChild(tagElement)

    this.element.dispatchEvent(
      new CustomEvent('filter:added', {
        detail: { type, value }
      })
    )
  }

  removeTag(event) {
    event.preventDefault()
    event.stopPropagation()

    const tagElement = event.target.closest('.filter-tag')
    const type = tagElement.dataset.type
    const value = tagElement.dataset.value

    tagElement.remove()

    this.element.dispatchEvent(
      new CustomEvent('filter:removed', {
        detail: { type, value }
      })
    )
  }

  clear() {
    this.element.dispatchEvent(new CustomEvent('filter:clear'))
    this.tagsContainerTarget.replaceChildren()
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
    if (!this.element.classList.contains('hot-select--open')) return

    const options = this.getOptions()

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        this.focusedOptionIndex = Math.min(
          this.focusedOptionIndex + 1,
          options.length - 1
        )
        this.updateFocusedOption()
        break
      case 'ArrowUp':
        event.preventDefault()
        this.focusedOptionIndex = Math.max(this.focusedOptionIndex - 1, 0)
        this.updateFocusedOption()
        break
      case 'Enter':
        event.preventDefault()
        if (this.focusedOptionIndex >= 0 && this.focusedOptionIndex < options.length) {
          const selectedOption = options[this.focusedOptionIndex]
          if (this.currentView === 'type') {
            this.selectType({ target: selectedOption })
          } else if (this.currentView === 'model') {
            this.selectModel({ target: selectedOption })
          }
        }
        break
      case 'Escape':
        event.preventDefault()
        if (this.currentView === 'model') {
          this.openTypeSelect()
        } else {
          this.close()
        }
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

    this.scrollToFocusedOption()
  }

  scrollToFocusedOption() {
    const options = this.getOptions()
    if (this.focusedOptionIndex >= 0 && this.focusedOptionIndex < options.length) {
      const focusedOption = options[this.focusedOptionIndex]
      const container = this.dropdownRoot.querySelector('.hot-select-selectable')

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

  getOptions() {
    return Array.from(this.dropdownRoot.querySelectorAll('.hot-select-option'))
  }

  close() {
    this.dropdownRoot.replaceChildren()
    this.element.classList.remove('hot-select--open')
    document.removeEventListener('keydown', this.onKeyDown)
    this.focusedOptionIndex = -1
    this.currentView = null
    this.currentType = null
  }

  get dropdownRoot() {
    return document.getElementById('dropdown-root')
  }
}
