import { colorBySpeed } from 'utils/colorBySpeed'
import { msToKmh } from 'utils/unitsConversion'
import { PointRecord } from 'api/hooks/tracks/points'

type PointWithColor = PointRecord & { color: string }
type Pairs = Array<[PointWithColor, PointWithColor]>
type Segments = Array<Array<PointWithColor>>
type Coordinates = { lat: number; lng: number }
type Polyline = { path: Coordinates[]; color: string }

const getPairs = (points: PointWithColor[]): Pairs =>
  points.reduce((acc: Pairs, _val, idx, arr) => {
    if (idx === arr.length - 1) return acc

    acc.push([arr[idx], arr[idx + 1]])

    return acc
  }, [])

const splitByColor = (pairs: Pairs): Segments =>
  pairs
    .reduce(
      (result: Segments, [first, second]) => {
        const lastSegment = result[result.length - 1]

        lastSegment.push(first)

        if (first.color !== second.color) {
          lastSegment.push(second)
          result.push([])
        }

        return result
      },
      [[]]
    )
    .filter(coordinates => {
      return coordinates.length > 0
    })

const convertSegmentToPolyline = (segments: Segments) =>
  segments.map(points => ({
    path: points.map(point => ({ lat: point.latitude, lng: point.longitude })),
    color: points[0].color
  }))

export const polylinesBySpeed = (points: PointRecord[]): Polyline[] => {
  const coloredPoints = points.map(point => ({
    ...point,
    color: colorBySpeed(msToKmh(point.hSpeed))
  }))

  const pairs = getPairs(coloredPoints)
  const segments = splitByColor(pairs)

  return convertSegmentToPolyline(segments)
}
