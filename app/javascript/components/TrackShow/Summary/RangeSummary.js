export class RangeSummary {
  constructor(points) {
    this.points = points
  }

  get time() {
    if (this.points.length === 0) return null

    return (this.lastPoint.gpsTime - this.firstPoint.gpsTime) / 1000
  }

  get elevation() {
    if (this.points.length === 0) return null

    return this.firstPoint.altitude - this.lastPoint.altitude
  }

  get verticalSpeed() {
    if (this.points.length === 0) return {}

    const avg = this.elevation / this.time

    const speedValues = this.points.map(el => el.vSpeed).sort((a, b) => a - b)
    const min = speedValues[0]
    const max = speedValues[speedValues.length - 1]

    return { avg, min, max }
  }

  get firstPoint() {
    return this.points[0]
  }

  get lastPoint() {
    return this.points[this.points.length - 1]
  }
}
