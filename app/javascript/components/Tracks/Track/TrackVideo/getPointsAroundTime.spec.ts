import getPointsAroundTime from './getPointsAroundTime'

describe('getPointsAroundTime', () => {
  const points = [
    { flTime: 5, altitude: 1000 },
    { flTime: 6, altitude: 900 },
    { flTime: 7, altitude: 800 }
  ]
  const lastPoint = points[points.length - 1]

  it('time before start', () => {
    const result = getPointsAroundTime(points, 1)

    expect(result).toEqual(null)
  })

  it('time after end', () => {
    const result = getPointsAroundTime(points, 8)

    expect(result).toEqual(null)
  })

  it('time is equal to end', () => {
    const result = getPointsAroundTime(points, lastPoint.flTime)

    expect(result).toEqual([lastPoint, lastPoint])
  })

  it('time is equal to some point', () => {
    const result = getPointsAroundTime(points, 6)

    expect(result).toEqual([points[1], points[2]])
  })

  it('time is in between two points', () => {
    const result = getPointsAroundTime(points, 6.5)

    expect(result).toEqual([points[1], points[2]])
  })
})
