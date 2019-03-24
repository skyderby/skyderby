import color_by_speed from 'utils/color_by_speed'

export default class Trajectory {
  constructor(points) {
    this.points = points
    this.points.forEach(el => { el.color = color_by_speed(el.h_speed) })
  }

  get polylines() {
    return this.segments.map( coordinates => {
      return {
        path: coordinates.map( (el) => { return { lat: Number(el.latitude), lng: Number(el.longitude) } }),
        color: coordinates[0].color
      }
    })
  }

  get segments() {
    return this.pairs.reduce( (result, [first, second]) =>  {
      let last_segment = result[result.length - 1]

      last_segment.push(first)

      if (first.color !== second.color) {
        last_segment.push(second)
        result.push([])
      }

      return result
    }, [[]])
      .filter(coordinates => { return coordinates.length > 0 })
  }

  // Convert array of points to pairs:
  // [1,2,3,4,5] => [[1,2], [2,3], [3,4], [4,5]]
  get pairs() {
    return this.points.reduce( (result, value, index, array) => {
      if (index === array.length - 1) return result
      result.push(array.slice(index, index + 2))
      return result
    }, [])
  }
}
