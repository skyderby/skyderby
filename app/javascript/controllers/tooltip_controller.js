import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    this.element.addEventListener('mouseenter', this.show)
    this.element.addEventListener('mouseleave', this.hide)
  }

  disconnect() {
    this.element.removeEventListener('mouseenter', this.show)
    this.element.removeEventListener('mouseleave', this.hide)
    this.hide()
  }

  show = () => {
    const sr = this.element.querySelector('.for-screen-reader')
    if (!sr) return

    this.timeout = setTimeout(() => {
      const tooltip = this.tooltipContainer
      tooltip.innerHTML = sr.innerHTML
      tooltip.showPopover()

      const triggerRect = this.element.getBoundingClientRect()
      const tooltipRect = tooltip.getBoundingClientRect()

      let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
      const gap = 4
      const fitsAbove = triggerRect.top - tooltipRect.height - gap >= 0
      const top = fitsAbove
        ? triggerRect.top - tooltipRect.height - gap
        : triggerRect.bottom + gap

      if (left < 8) left = 8
      if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8
      }

      tooltip.style.left = `${left}px`
      tooltip.style.top = `${top}px`
    }, 250)
  }

  hide = () => {
    clearTimeout(this.timeout)
    try {
      this.tooltipContainer.hidePopover()
    } catch {
      // ignore if not shown
    }
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
