import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

export class RangeSummary {
  constructor(points, { straightLine = false } = {}) {
    this.points = points
    this.straightLine = straightLine
  }

  get distance() {
    if (this.straightLine) {
      return this.straightLineDistance
    } else {
      return this.trajectoryDistance
    }
  }

  get straightLineDistance() {
    if (this.points.length === 0) return null

    const startPoint = this.points[0]
    const endPoint = this.points[this.points.length - 1]

    const startPosition = new LatLon(startPoint.latitude, startPoint.longitude)
    const endPosition = new LatLon(endPoint.latitude, endPoint.longitude)

    return startPosition.distanceTo(endPosition)
  }

  get trajectoryDistance() {
    if (this.points.length === 0) return null

    return this.points.reduce((acc, point, idx) => {
      if (idx === 0) return acc

      const prevPoint = this.points[idx -1]
      const currentPosition = new LatLon(point.latitude, point.longitude)
      const prevPosition = new LatLon(prevPoint.latitude, prevPoint.longitude)

      return acc + currentPosition.distanceTo(prevPosition)
    }, 0)
  }

  get horizontalSpeed() {
    if (this.points.length === 0) return {}

    const avg = this.distance / this.time

    const speedValues = this.points.map(el => el.hSpeed).sort((a, b) => a - b)
    const min = speedValues[0]
    const max = speedValues[speedValues.length - 1]

    return { avg, min, max }
  }

  get glideRatio() {
    if (this.points.length === 0) return {}

    const avg = this.distance / this.elevation

    const glideRatioValues = this.points.map(el => el.glideRatio).sort((a, b) => a - b)
    const min = glideRatioValues[0]
    const max = glideRatioValues[glideRatioValues.length - 1]

    return { avg, min, max }
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
