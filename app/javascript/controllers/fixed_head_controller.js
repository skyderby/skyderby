import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    window.addEventListener('resize', this.on_resize_listener)
    window.addEventListener('scroll', this.on_scroll_listener)
    window.addEventListener('load', this.on_resize_listener, { once: true })

    this.init()
  }

  disconnect() {
    this.fixed_header.remove()
    window.removeEventListener('resize', this.on_resize_listener)
    window.removeEventListener('scroll', this.on_scroll_listener)
  }

  init() {
    this.fixed_header = this.element.cloneNode(true)
    this.fixed_header.setAttribute('data-controller', undefined)
    this.fixed_header.id = this.fixed_header.id + '-fixed-header'
    this.fixed_header.querySelectorAll('tbody').forEach( (el) => { el.remove() })
    this.fixed_header.style.position = 'fixed'
    this.fixed_header.style.top = '50px';
    this.fixed_header.style.display = 'none'
    this.fixed_header.style.zIndex = 10

    this.element.insertAdjacentElement('beforebegin', this.fixed_header)

    this.on_resize()
  }

  on_resize() {
    const original_cells = this.element.querySelectorAll('th')
    this.fixed_header.style.width = this.element.offsetWidth + 'px'

    this.fixed_header.querySelectorAll('th').forEach( (el, index) => {
      el.style.width = original_cells[index].offsetWidth + 'px'
    })
  }

  on_scroll() {
    if (this.offset_top < this.table_offset_top || this.offset_top > this.table_offset_bottom) {
      this.fixed_header.style.display = 'none'
    } else if (this.offset_top > this.table_offset_top && this.offset_top < this.table_offset_bottom) {
      this.fixed_header.style.display = 'table'
    }

    this.fixed_header.style.left = (this.table_offset_left - this.offset_left) + 'px'
  }

  get offset_top() {
    return document.scrollingElement.scrollTop + 50
  }

  get offset_left() {
    return document.scrollingElement.scrollLeft
  }

  get table_offset_top() {
    return this.element.getBoundingClientRect().top + pageYOffset
  }

  get table_offset_bottom() {
    return this.element.getBoundingClientRect().bottom + pageYOffset - this.header.offsetHeight
  }

  get table_offset_left() {
    return this.element.getBoundingClientRect().left + pageXOffset
  }

  get header() {
    return this.element.querySelector('thead')
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
}
