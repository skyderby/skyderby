export default class Bounds {
  constructor(points) {
    this.points = points
  }

  get min_latitude() {
    return Number(this.latitudes[0])
  }

  get max_latitude() {
    return Number(this.latitudes[this.latitudes.length - 1])
  }

  get min_longitude() {
    return Number(this.longitudes[0])
  }

  get max_longitude() {
    return Number(this.longitudes[this.longitudes.length - 1])
  }

  get latitudes() {
    if (!this._latitudes) {
      this._latitudes = this.points
        .map(el => {
          return el.latitude
        })
        .sort()
    }

    return this._latitudes
  }

  get longitudes() {
    if (!this._longitudes) {
      this._longitudes = this.points
        .map(el => {
          return el.longitude
        })
        .sort()
    }

    return this._longitudes
  }
}
