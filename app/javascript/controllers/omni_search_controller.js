import { Controller } from 'stimulus'
import { createPopper } from '@popperjs/core'

export default class OmniSearchController extends Controller {
  static targets = ['model', 'typeSelect', 'tagsContainer', 'tagTemplate']

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

    const type = optionElement.dataset.value
    const label = optionElement.dataset.label

    setTimeout(() => this.openModelDropdown(type, label), 0)
  }

  openModelDropdown(type, label) {
    const modelElement = this.modelTargets.find(model => model.dataset.name === type)

    if (!modelElement) throw new Error(`Can not find elements dropdown for type: ${type}`)

    this.dropdownRoot.innerHTML = modelElement.innerHTML

    const optionsContainer = this.dropdownRoot.querySelector('.hot-select-dropdown')
    if (!optionsContainer) throw new Error(`Can not find dropdown element for ${type}`)

    optionsContainer.addEventListener('click', event =>
      this.selectModel(event, type, label)
    )

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

  selectModel(event, type, label) {
    const optionElement = event.target.closest('.hot-select-option')
    if (!optionElement) return

    const value = optionElement.dataset.value
    const text = optionElement.textContent.trim()

    this.addFilterTag(type, label, value, text)

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
