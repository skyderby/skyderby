import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = [ 'container', 'table' ]

  connect() {
    window.addEventListener('resize', this.on_resize_listener)
    window.addEventListener('scroll', this.on_scroll_listener)
    window.addEventListener('load', this.on_resize_listener, { once: true })
    window.addEventListener('turbolinks:load', this.on_resize_listener, { once: true })

    this.init()
  }

  disconnect() {
    this.header_container.remove()

    window.removeEventListener('resize', this.on_resize_listener)
    window.removeEventListener('scroll', this.on_scroll_listener)
  }

  init() {
    this.containerTarget.insertAdjacentElement('afterbegin', this.header_container)

    this.on_resize()
  }

  on_resize() {
    const original_cells = this.tableTarget.querySelectorAll('th')
    this.fixed_header.style.width = this.tableTarget.offsetWidth + 'px'

    this.fixed_header.querySelectorAll('th').forEach( (el, index) => {
      el.style.width = original_cells[index].offsetWidth + 'px'
    })
  }

  on_scroll() {
    if (this.offset_top < this.table_offset_top || this.offset_top > this.table_offset_bottom) {
      this.container_display_mode = 'none'
    } else if (this.offset_top > this.table_offset_top && this.offset_top < this.table_offset_bottom) {
      if (this.container_display_mode === 'block') return

      this.on_resize()
      this.container_display_mode = 'block'
    }
  }

  on_horizontal_scroll() {
    this.fixed_header.style.left = `-${this.containerTarget.scrollLeft}px`
  }

  get offset_top() {
    return document.scrollingElement.scrollTop + this.page_header_height
  }

  get table_offset_top() {
    return this.element.getBoundingClientRect().top + pageYOffset
  }

  get table_offset_bottom() {
    return this.element.getBoundingClientRect().bottom + pageYOffset - this.table_header_height
  }

  get on_resize_listener() {
    if (!this._on_resize_listener) {
      this._on_resize_listener = () => { this.on_resize() }
    }

    return this._on_resize_listener
  }

  get on_scroll_listener() {
    if (!this._on_scroll_listener) {
      this._on_scroll_listener = () => { this.on_scroll() }
    }

    return this._on_scroll_listener
  }

  get page_header_height() {
    return document.querySelector('.header').offsetHeight
  }

  get container_display_mode() {
    return this.header_container.style.display
  }

  set container_display_mode(value) {
    this.header_container.style.display = value
  }

  get header_container() {
    if (!this._header_container) {
      this._header_container = document.createElement('div')
      this._header_container.style.top = `${this.page_header_height}px`;
      this._header_container.style.position = 'fixed'
      this._header_container.style.display = 'none'
      this._header_container.style.zIndex = 10
      this._header_container.style.height = `${this.table_header_height + 1}px`
      this._header_container.style.left = `${this.container_left}px`
      this._header_container.style.right = `${this.container_right}px`
      this._header_container.style.overflowX= 'hidden'

      this.header_container.insertAdjacentElement('afterbegin', this.fixed_header)
    }

    return this._header_container
  }

  get fixed_header() {
    if (!this._fixed_header) {
      this._fixed_header = this.tableTarget.cloneNode(true)
      this._fixed_header.removeAttribute('data-target')
      this._fixed_header.querySelectorAll('tbody').forEach( (el) => { el.remove() })

      this._fixed_header.style.position = 'absolute'
      this._fixed_header.style.top = 0
      this._fixed_header.style.left = 0
    }

    return this._fixed_header
  }

  get table_header_height() {
    return this.tableTarget.querySelector('thead').offsetHeight
  }

  get container_left() {
    return this.element.offsetLeft
  }

  get container_right() {
    return window.innerWidth - (this.container_left + this.element.offsetWidth)
  }
}
