import { Controller } from '@hotwired/stimulus'

const ANCHOR_NAME = '--tooltip-anchor'
let anchoredElement = null

export default class extends Controller {
  static values = { variant: String }

  connect() {
    this.element.addEventListener('mouseenter', this.show)
    this.element.addEventListener('mouseleave', this.hide)
    this.element.addEventListener('focusin', this.show)
    this.element.addEventListener('focusout', this.hide)
  }

  disconnect() {
    this.element.removeEventListener('mouseenter', this.show)
    this.element.removeEventListener('mouseleave', this.hide)
    this.element.removeEventListener('focusin', this.show)
    this.element.removeEventListener('focusout', this.hide)
    this.hide()
  }

  show = () => {
    const sr = this.element.querySelector('.for-screen-reader')
    if (!sr) return

    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      const tooltip = this.tooltipContainer
      tooltip.innerHTML = sr.innerHTML
      tooltip.className = 'tooltip-popover'
      if (this.variantValue)
        tooltip.classList.add(`tooltip-popover--${this.variantValue}`)
      if (tooltip.matches(':popover-open')) tooltip.hidePopover()

      this.anchor()
      tooltip.showPopover()
    }, 250)
  }

  hide = () => {
    clearTimeout(this.timeout)
    if (anchoredElement !== this.element) return

    this.tooltipContainer.hidePopover()
    this.element.style.removeProperty('anchor-name')
    anchoredElement = null
  }

  anchor() {
    anchoredElement?.style.removeProperty('anchor-name')
    anchoredElement = this.element
    this.element.style.setProperty('anchor-name', ANCHOR_NAME)
  }

  get tooltipContainer() {
    let el = document.getElementById('tooltip-popover')
    if (!el) {
      el = document.createElement('div')
      el.id = 'tooltip-popover'
      el.setAttribute('popover', 'manual')
      el.classList.add('tooltip-popover')
      document.body.appendChild(el)
    }
    return el
  }
}
