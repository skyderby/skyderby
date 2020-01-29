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

      expect(summary.verticalSpeed).toEqual({
        avg: 85,
        min: 32,
        max: 118
      })
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
