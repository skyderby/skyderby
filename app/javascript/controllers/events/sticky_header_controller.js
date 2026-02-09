import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['container', 'table']

  connect() {
    this.onResize = this.onResize.bind(this)
    this.onScroll = this.onScroll.bind(this)

    window.addEventListener('resize', this.onResize)
    window.addEventListener('scroll', this.onScroll)

    this.element.addEventListener('turbo:before-morph-element', event => {
      if (event.target === this._popover) event.preventDefault()
    })

    this.element.addEventListener('turbo:morph-element', () => {
      if (this._refreshPending) return
      this._refreshPending = true
      queueMicrotask(() => {
        this._refreshPending = false
        this.refreshContent()
      })
    })

    this.buildPopover()
    this.onScroll()
  }

  disconnect() {
    if (this._popover) {
      this._popover.hidePopover()
      this._popover.remove()
      this._popover = null
    }

    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('scroll', this.onScroll)
  }

  buildPopover() {
    this._popover = document.createElement('div')
    this._popover.popover = 'manual'
    this._popover.classList.add('sticky-header-popover')
    this.containerTarget.insertAdjacentElement('beforebegin', this._popover)
    this.refreshContent()
  }

  refreshContent() {
    const clone = this.tableTarget.cloneNode(true)
    clone.removeAttribute('data-events--sticky-header-target')
    clone.querySelectorAll('tbody').forEach(el => el.remove())
    clone.querySelectorAll('[popover]').forEach(el => el.remove())
    clone.querySelectorAll('[data-controller]').forEach(el => {
      el.removeAttribute('data-controller')
    })

    this._popover.replaceChildren(clone)
    this.onResize()
  }

  onResize() {
    if (!this._popover) return

    const clone = this._popover.querySelector('table')
    if (!clone) return

    clone.style.width = this.tableTarget.offsetWidth + 'px'

    const dataRow = this.tableTarget.querySelector('tbody tr:has(td + td)')
    if (dataRow) {
      let colgroup = clone.querySelector('colgroup')
      if (!colgroup) {
        colgroup = document.createElement('colgroup')
        clone.insertAdjacentElement('afterbegin', colgroup)
      }
      colgroup.innerHTML = ''
      Array.from(dataRow.cells).forEach(td => {
        const col = document.createElement('col')
        col.style.width = `${td.getBoundingClientRect().width}px`
        colgroup.appendChild(col)
      })
    }

    this._popover.style.left = `${this.containerLeft}px`
    this._popover.style.right = `${this.containerRight}px`
  }

  onScroll() {
    if (!this._popover) return

    const scrollTop = document.scrollingElement.scrollTop
    const tableTop = this.element.getBoundingClientRect().top + pageYOffset
    const headerHeight = this.tableTarget.querySelector('thead').offsetHeight
    const tableBottom =
      this.element.getBoundingClientRect().bottom + pageYOffset - headerHeight

    if (scrollTop > tableTop && scrollTop < tableBottom) {
      if (!this._visible) {
        this._popover.showPopover()
        this._visible = true
        this.onResize()
      }
    } else if (this._visible) {
      this._popover.hidePopover()
      this._visible = false
    }
  }

  on_horizontal_scroll() {
    const clone = this._popover?.querySelector('table')
    if (clone) clone.style.marginLeft = `-${this.containerTarget.scrollLeft}px`
  }

  get containerLeft() {
    return this.element.offsetLeft
  }

  get containerRight() {
    return window.innerWidth - (this.containerLeft + this.element.offsetWidth)
  }
}
