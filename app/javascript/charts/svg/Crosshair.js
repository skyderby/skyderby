import { svgEl } from './elements'

export default class Crosshair {
  constructor(parent, { markerRadius = 5, compare = false } = {}) {
    this.group = svgEl('g', { class: 'crosshair-group' })
    this.group.style.display = 'none'

    this.vLine = svgEl('line', { class: 'crosshair' })
    this.hLine = svgEl('line', { class: 'crosshair' })
    this.marker = svgEl('circle', { class: 'crosshair-marker', r: markerRadius })
    this.group.append(this.vLine, this.hLine, this.marker)

    if (compare) {
      this.compareMarker = svgEl('circle', { class: 'crosshair-marker--compare', r: 5 })
      this.group.appendChild(this.compareMarker)
    }

    parent.appendChild(this.group)
  }

  setBounds({ x1, x2, y1, y2 }) {
    this.bounds = { x1, x2, y1, y2 }
  }

  show(x, y) {
    const { x1, x2, y1, y2 } = this.bounds

    this.vLine.setAttribute('x1', x)
    this.vLine.setAttribute('y1', y1)
    this.vLine.setAttribute('x2', x)
    this.vLine.setAttribute('y2', y2)

    this.hLine.setAttribute('x1', x1)
    this.hLine.setAttribute('y1', y)
    this.hLine.setAttribute('x2', x2)
    this.hLine.setAttribute('y2', y)

    this.marker.setAttribute('cx', x)
    this.marker.setAttribute('cy', y)

    this.group.style.display = ''
  }

  showCompare(x, y) {
    if (!this.compareMarker) return

    this.compareMarker.setAttribute('cx', x)
    this.compareMarker.setAttribute('cy', y)
    this.compareMarker.style.display = ''
  }

  hideCompare() {
    if (this.compareMarker) this.compareMarker.style.display = 'none'
  }

  hide() {
    this.group.style.display = 'none'
  }

  remove() {
    this.group.remove()
  }
}
