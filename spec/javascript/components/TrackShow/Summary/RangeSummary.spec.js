import { RangeSummary } from 'components/TrackShow/Summary/RangeSummary'

import points from './pointsFixture'

describe('RangeSummary', () => {
  describe('happy path', () => {
    it('#time', () => {
      const summary = new RangeSummary(points)

      expect(summary.time).toEqual(133.2)
    })

    it('#elevation', () => {
      const summary = new RangeSummary(points)

      expect(summary.elevation).toEqual(3152.748)
    })

    it('#verticalSpeed', () => {
      const summary = new RangeSummary(points)

      expect(Math.round(summary.verticalSpeed.avg)).toEqual(24)
      expect(Math.round(summary.verticalSpeed.min)).toEqual(32)
      expect(Math.round(summary.verticalSpeed.max)).toEqual(118)
    })
  })

  describe('empty data', () => {
    it('#time', () => {
      const summary = new RangeSummary([])

      expect(summary.time).toEqual(null)
    })

    it('#elevation', () => {
      const summary = new RangeSummary([])

      expect(summary.elevation).toEqual(null)
    })
  })
})
