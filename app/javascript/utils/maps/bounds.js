export default class Bounds {
  constructor(points) {
    this.points = points
    this.latitudes = this.points.map(el => el.latitude).sort()
    this.longitudes = this.points.map(el => el.longitude).sort()
    this.minLatitude = this.latitudes[0]
    this.maxLatitude = this.latitudes.at(-1)
    this.minLongitude = this.longitudes[0]
    this.maxLongitude = this.longitudes.at(-1)
  }
}
