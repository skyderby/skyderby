import { getWindEffect, subtractWind } from 'utils/windCancellation'
import { RangeSummary } from 'components/TrackInsights/Summary/RangeSummary'

import points from 'fixtures/trackPoints'
import windData from 'fixtures/windData'

describe('wind cancellation', () => {
  it('getWindEffect', () => {
    const sortedData = windData

    const windEffect = getWindEffect(sortedData, 2995.627)

    expect(Math.round(windEffect.windSpeed * 100) / 100).toEqual(9.09)
    expect(Math.round(windEffect.windDirection * 100) / 100).toEqual(85.88)
  })

  it('subtractWind', () => {
    const zeroWindPoints = subtractWind(points, windData)

    expect(zeroWindPoints.length).toEqual(points.length)

    const summary = new RangeSummary(zeroWindPoints)

    expect(Math.round(summary.distance)).toEqual(5006)
    expect(Math.round(summary.horizontalSpeed.avg)).toEqual(38)
    expect(Math.round(summary.glideRatio.avg * 100) / 100).toEqual(1.59)
  })
})
