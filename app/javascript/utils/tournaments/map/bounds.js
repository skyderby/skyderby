import Bounds from 'utils/maps/bounds'

export default function(paths) {
  let points = paths
    .map( el => { return el.path })
    .reduce( (result, value) => { return result.concat(value) }, [])
    .map( el => { return { latitude: el.lat, longitude: el.lng } })

  return new Bounds(points)
}
