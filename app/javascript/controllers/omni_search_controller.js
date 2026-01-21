import { Controller } from '@hotwired/stimulus'
import debounce from 'lodash.debounce'

export default class OmniSearchController extends Controller {
  static targets = ['model', 'typeSelect', 'tagsContainer', 'tagTemplate', 'dropdown']

  connect() {
    this.close = this.close.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onToggle = this.onToggle.bind(this)
    this.onClick = this.onClick.bind(this)
    this.search = debounce(this.search.bind(this), 300)

    this.focusedOptionIndex = -1
    this.currentView = null
    this.currentType = null
    this.currentTypeLabel = null

    this.dropdownTarget.addEventListener('toggle', this.onToggle)
    document.addEventListener('turbo:before-render', this.close)
  }

  disconnect() {
    this.dropdownTarget.removeEventListener('toggle', this.onToggle)
    this.dropdownTarget.removeEventListener('click', this.onClick)
    document.removeEventListener('turbo:before-render', this.close)
    document.removeEventListener('keydown', this.onKeyDown)

    if (this.isOpen) this.close()
  }

  toggle() {
    if (this.isOpen) {
      this.dropdownTarget.hidePopover()
    } else {
      this.openTypeSelect()
      this.dropdownTarget.showPopover()
    }
  }

  onToggle(event) {
    if (event.newState === 'open') {
      document.addEventListener('keydown', this.onKeyDown)
      this.dropdownTarget.addEventListener('click', this.onClick)
    } else {
      document.removeEventListener('keydown', this.onKeyDown)
      this.dropdownTarget.removeEventListener('click', this.onClick)
      this.focusedOptionIndex = -1
      this.currentView = null
      this.currentType = null
    }
  }

  onClick(event) {
    const optionElement = event.target.closest('.hot-select-option')
    if (!optionElement) return

    if (this.currentView === 'type') {
      this.selectType({ target: optionElement })
    } else if (this.currentView === 'model') {
      this.selectModel({ target: optionElement })
    }
  }

  openTypeSelect() {
    this.dropdownTarget.innerHTML = this.typeSelectTarget.innerHTML
    this.currentView = 'type'
    this.focusedOptionIndex = -1
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

    this.dropdownTarget.innerHTML = modelElement.innerHTML

    const searchInput = this.dropdownTarget.querySelector('.hot-select-search')
    if (searchInput) {
      searchInput.disabled = false
      searchInput.focus()
    }

    this.currentView = 'model'
    this.focusedOptionIndex = -1
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
      const container = this.dropdownTarget.querySelector('.hot-select-selectable')

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
    return Array.from(this.dropdownTarget.querySelectorAll('.hot-select-option'))
  }

  close() {
    this.dropdownTarget.hidePopover()
  }

  search(event) {
    const frame = this.dropdownTarget.querySelector('turbo-frame')
    if (!frame) return

    const term = event.target.value
    const url = new URL(frame.src)
    url.searchParams.set('term', term)
    url.searchParams.set('page', '1')
    frame.src = url.toString()
  }

  get isOpen() {
    return this.dropdownTarget.matches(':popover-open')
  }
}
