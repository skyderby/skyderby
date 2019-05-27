export default class FinishLine {
  constructor(points) {
    this.points = points
  }

  get path() {
    return this.points.map(el => {
      return {
        lat: Number(el.latitude),
        lng: Number(el.longitude)
      }
    })
  }

  get center() {
    return {
      lat: this.start_latitude + (this.end_latitude - this.start_latitude) / 2,
      lng: this.start_longitude + (this.end_longitude - this.start_longitude) / 2
    }
  }

  get start_latitude() {
    return Number(this.start_point.latitude)
  }

  get start_longitude() {
    return Number(this.start_point.longitude)
  }

  get end_latitude() {
    return Number(this.end_point.latitude)
  }

  get end_longitude() {
    return Number(this.end_point.longitude)
  }

  get start_point() {
    return this.points[0]
  }

  get end_point() {
    return this.points[1]
  }
}
