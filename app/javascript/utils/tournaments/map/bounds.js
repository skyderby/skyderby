import Bounds from 'utils/maps/bounds'

export default function (paths) {
  const points = paths
    .map(el => el.path)
    .reduce((result, value) => result.concat(value), [])
    .map(el => ({ latitude: el.lat, longitude: el.lng }))

  return new Bounds(points)
}
