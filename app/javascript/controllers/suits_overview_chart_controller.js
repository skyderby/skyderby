import { Controller } from '@hotwired/stimulus'
import DonutChart from 'charts/DonutChart'

const PALETTE = [
  '#7cb5ec',
  '#434348',
  '#90ed7d',
  '#f7a35c',
  '#8085e9',
  '#f15c80',
  '#e4d354',
  '#2b908f',
  '#f45b5b',
  '#91e8e1'
]
const MANUFACTURER_LABEL_MIN = 5
const SUIT_LABEL_MIN = 1

const brighten = (hex, amount) => {
  const channels = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16))
  const shifted = channels.map(value =>
    Math.min(255, Math.max(0, Math.round(value + amount * 255)))
  )
  return `rgb(${shifted.join(', ')})`
}

export default class extends Controller {
  static targets = ['chart', 'data']
  static values = { title: String, manufacturersLabel: String, suitsLabel: String }

  connect() {
    const data = JSON.parse(this.dataTarget.textContent)
    const { manufacturers, suits } = this.groupData(data)

    this.chart = new DonutChart(this.chartTarget, {
      title: this.titleValue,
      valueSuffix: '%',
      rings: [
        {
          name: this.manufacturersLabelValue,
          inner: 0,
          outer: 0.6,
          data: manufacturers,
          labelInside: true,
          label: item => (item.value > MANUFACTURER_LABEL_MIN ? item.name : null)
        },
        {
          name: this.suitsLabelValue,
          inner: 0.6,
          outer: 0.8,
          data: suits,
          label: item =>
            item.value > SUIT_LABEL_MIN ? `${item.name}: ${item.value}%` : null
        }
      ]
    })
  }

  disconnect() {
    this.chart?.destroy()
  }

  groupData(data) {
    const groups = new Map()
    data.forEach(suit => {
      if (!groups.has(suit.manufacturer_name)) groups.set(suit.manufacturer_name, [])
      groups.get(suit.manufacturer_name).push(suit)
    })

    const manufacturers = []
    const suits = []

    Array.from(groups.entries()).forEach(([name, items], index) => {
      const color = PALETTE[index % PALETTE.length]
      const total = items.reduce((sum, suit) => sum + parseFloat(suit.popularity), 0)
      manufacturers.push({ name, value: Math.round(total * 100) / 100, color })

      items.forEach((suit, i) => {
        suits.push({
          name: suit.name,
          value: parseFloat(suit.popularity),
          color: brighten(color, 0.2 - i / items.length / 5)
        })
      })
    })

    return { manufacturers, suits }
  }
}
