import { colorBySpeed } from 'utils/colorBySpeed'
import { msToKmh } from 'utils/unitsConversion'

const getPairs = points =>
  points.reduce((acc, _val, idx, arr) => {
    if (idx === arr.length - 1) return acc

    acc.push(arr.slice(idx, idx + 2))

    return acc
  }, [])

const splitByColor = pairs =>
  pairs
    .reduce(
      (result, [first, second]) => {
        const last_segment = result[result.length - 1]

        last_segment.push(first)

        if (first.color !== second.color) {
          last_segment.push(second)
          result.push([])
        }

        return result
      },
      [[]]
    )
    .filter(coordinates => {
      return coordinates.length > 0
    })

const convertSegmentToPolyline = segment =>
  segment.map(points => ({
    path: points.map(point => ({ lat: point.latitude, lng: point.longitude })),
    color: points[0].color
  }))

export const polylinesBySpeed = points => {
  const coloredPoints = points.map(point => ({
    ...point,
    color: colorBySpeed(msToKmh(point.hSpeed))
  }))

  const pairs = getPairs(coloredPoints)
  const segments = splitByColor(pairs)

  return convertSegmentToPolyline(segments)
}
