import { describe, it, expect, vi } from 'vitest'
import TimeViewport from './TimeViewport'

const build = () => {
  const onChange = vi.fn()
  return {
    viewport: new TimeViewport({ min: 0, max: 100, minSpan: 2, onChange }),
    onChange
  }
}

describe('TimeViewport', () => {
  it('zooms around the anchor', () => {
    const { viewport, onChange } = build()
    viewport.zoom(4, 50)

    expect(viewport.range).toEqual({ from: 37.5, to: 62.5 })
    expect(onChange).toHaveBeenCalledWith({ from: 37.5, to: 62.5 }, null)
  })

  it('clamps panning to the bounds', () => {
    const { viewport } = build()
    viewport.set({ from: 10, to: 20 })
    viewport.pan(200)

    expect(viewport.range).toEqual({ from: 90, to: 100 })
  })

  it('does not pan the full range', () => {
    const { viewport, onChange } = build()
    viewport.pan(10)

    expect(viewport.range).toBeNull()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('resets when zoomed out past the full range', () => {
    const { viewport } = build()
    viewport.zoom(2, 50)
    viewport.zoom(0.25, 50)

    expect(viewport.range).toBeNull()
  })

  it('keeps the minimum span', () => {
    const { viewport } = build()
    viewport.zoom(1000, 50)

    expect(viewport.span).toBeCloseTo(2)
  })
})
