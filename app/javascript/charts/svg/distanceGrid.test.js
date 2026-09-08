import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  distanceLineStep,
  distanceLabelStep,
  renderDistanceGrid,
  renderWindowLines
} from './distanceGrid'

const fakeElement = tag => ({
  tag,
  attrs: {},
  children: [],
  textContent: '',
  setAttribute(name, value) {
    this.attrs[name] = String(value)
  },
  appendChild(child) {
    this.children.push(child)
    return child
  }
})

beforeEach(() => {
  vi.stubGlobal('document', { createElementNS: (_ns, tag) => fakeElement(tag) })
})

const plot = { left: 100, top: 10, width: 800, height: 500 }

describe('distanceLineStep / distanceLabelStep', () => {
  test('pick steps by range and label spacing', () => {
    expect(distanceLineStep(4000)).toBe(500)
    expect(distanceLineStep(400)).toBe(50)
    expect(distanceLabelStep(4000, 800, 500)).toBe(1000)
    expect(distanceLabelStep(400, 800, 50)).toBe(100)
  })
})

describe('renderDistanceGrid', () => {
  test('draws a line per step and labels on the label step', () => {
    const grid = fakeElement('g')
    renderDistanceGrid(grid, {
      range: { min: -50, max: 1100 },
      plot,
      lineStep: 500,
      labelOffset: 15
    })

    const lines = grid.children.filter(c => c.tag === 'line')
    const labels = grid.children.filter(c => c.tag === 'text')
    expect(lines.map(l => l.attrs.class)).toEqual(Array(3).fill('grid-line-vertical'))
    expect(labels.map(l => l.textContent)).toEqual(['0', '500', '1000'])
    expect(labels[0].attrs.y).toBe(String(plot.top + plot.height + 15))
    expect(Number(lines[1].attrs.x1)).toBeCloseTo(100 + (550 / 1150) * 800)
  })

  test('honours fromZero, custom label step and formatting', () => {
    const grid = fakeElement('g')
    renderDistanceGrid(grid, {
      range: { min: -120, max: 260 },
      plot,
      lineStep: 50,
      labelStep: 100,
      fromZero: true,
      format: value => `${value}m`
    })

    const lines = grid.children.filter(c => c.tag === 'line')
    const labels = grid.children.filter(c => c.tag === 'text')
    expect(lines).toHaveLength(6)
    expect(labels.map(l => l.textContent)).toEqual(['0m', '100m', '200m'])
  })
})

describe('renderWindowLines', () => {
  test('draws start and end lines with optional labels', () => {
    const grid = fakeElement('g')
    renderWindowLines(grid, {
      plot,
      startY: 50,
      endY: 400,
      labels: { start: '3000', end: '2000' }
    })

    expect(grid.children.map(c => c.attrs.class)).toEqual([
      'grid-line-window-start',
      'grid-line-window-end',
      'grid-label grid-label-window',
      'grid-label grid-label-window'
    ])
    expect(grid.children[0].attrs.x2).toBe('900')
    expect(grid.children[2].textContent).toBe('3000')
    expect(grid.children[3].attrs.y).toBe('404')
  })

  test('skips labels when not given', () => {
    const grid = fakeElement('g')
    renderWindowLines(grid, { plot, startY: 50, endY: 400 })
    expect(grid.children).toHaveLength(2)
  })
})
