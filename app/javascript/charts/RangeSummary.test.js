import { test, describe, expect } from 'vitest'
import RangeSummary from './RangeSummary'

import points from '../test/fixtures/points'

describe('RangeSummary', () => {
  describe('happy path', () => {
    describe('distance', () => {
      test('by trajectory', () => {
        const summary = new RangeSummary(points, { straightLine: false })

        expect(Math.round(Number(summary.distance))).toEqual(5630)
      })

      test('straight line', () => {
        const summary = new RangeSummary(points, { straightLine: true })

        expect(Math.round(Number(summary.distance))).toEqual(3355)
      })
    })

    describe('horizontalSpeed', () => {
      test('by trajectory', () => {
        const summary = new RangeSummary(points, { straightLine: false })

        expect(Math.round(Number(summary.horizontalSpeed.avg))).toEqual(42)
        expect(Math.round(Number(summary.horizontalSpeed.min))).toEqual(16)
        expect(Math.round(Number(summary.horizontalSpeed.max))).toEqual(53)
      })

      test('straightLine', () => {
        const summary = new RangeSummary(points, { straightLine: true })

        expect(Math.round(Number(summary.horizontalSpeed.avg))).toEqual(25)
        expect(Math.round(Number(summary.horizontalSpeed.min))).toEqual(16)
        expect(Math.round(Number(summary.horizontalSpeed.max))).toEqual(53)
      })
    })

    describe('glideRatio', () => {
      test('by trajectory', () => {
        const summary = new RangeSummary(points, { straightLine: false })

        expect(Math.round(Number(summary.glideRatio.avg) * 100) / 100).toEqual(1.79)
        expect(Math.round(Number(summary.glideRatio.min) * 100) / 100).toEqual(0.71)
        expect(Math.round(Number(summary.glideRatio.max) * 100) / 100).toEqual(3.51)
      })

      test('straightLine', () => {
        const summary = new RangeSummary(points, { straightLine: true })

        expect(Math.round(Number(summary.glideRatio.avg) * 100) / 100).toEqual(1.06)
        expect(Math.round(Number(summary.glideRatio.min) * 100) / 100).toEqual(0.71)
        expect(Math.round(Number(summary.glideRatio.max) * 100) / 100).toEqual(3.51)
      })
    })

    test('#time', () => {
      const summary = new RangeSummary(points)

      expect(summary.time).toEqual(133.2)
    })

    test('#elevation', () => {
      const summary = new RangeSummary(points)

      expect(summary.elevation).toEqual(3152.748)
    })

    test('#verticalSpeed', () => {
      const summary = new RangeSummary(points)

      expect(Math.round(Number(summary.verticalSpeed.avg))).toEqual(24)
      expect(Math.round(Number(summary.verticalSpeed.min))).toEqual(9)
      expect(Math.round(Number(summary.verticalSpeed.max))).toEqual(33)
    })
  })

  describe('empty data', () => {
    test('#time', () => {
      const summary = new RangeSummary([])

      expect(summary.time).toEqual(null)
    })

    test('#elevation', () => {
      const summary = new RangeSummary([])

      expect(summary.elevation).toEqual(null)
    })
  })
})
