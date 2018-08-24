export default class CenterLine {
  constructor(finish_line, exit_point) {
    this.finish_line = finish_line
    this.exit_point = exit_point
  }

  get path() {
    return [ this.finish_line.center, this.exit_coordinates ]
  }

  get exit_coordinates() {
    return {
      lat: Number(this.exit_point.latitude),
      lng: Number(this.exit_point.longitude)
    }
  }
}
