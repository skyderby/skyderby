import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

const emptyValueWithAvgMinMax = {
  avg: null,
  min: null,
  max: null
}

export default class RangeSummary {
  constructor(points, { straightLine = false } = {}) {
    this.points = points
    this.straightLine = straightLine
    this.hasWindData =
      this.points.length > 0 &&
      'zerowindLatitude' in this.points[0] &&
      'zerowindLongitude' in this.points[0]
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
    const endPoint = this.points.at(-1)

    const startPosition = new LatLon(startPoint.latitude, startPoint.longitude)
    const endPosition = new LatLon(endPoint.latitude, endPoint.longitude)

    return startPosition.distanceTo(endPosition)
  }

  get zerowindStraightLineDistance() {
    if (this.points.length === 0 || !this.hasWindData) return null

    const startPoint = this.points[0]
    const endPoint = this.points.at(-1)

    const startPosition = new LatLon(
      startPoint.zerowindLatitude,
      startPoint.zerowindLongitude
    )
    const endPosition = new LatLon(endPoint.zerowindLatitude, endPoint.zerowindLongitude)

    return startPosition.distanceTo(endPosition)
  }

  get trajectoryDistance() {
    if (this.points.length === 0) return null

    return this.points.reduce((acc, point, idx) => {
      if (idx === 0) return acc

      const prevPoint = this.points[idx - 1]
      const currentPosition = new LatLon(point.latitude, point.longitude)
      const prevPosition = new LatLon(prevPoint.latitude, prevPoint.longitude)

      return acc + currentPosition.distanceTo(prevPosition)
    }, 0)
  }

  get zerowindTrajectoryDistance() {
    if (this.points.length === 0 || !this.hasWindData) return null

    return this.points.reduce((acc, point, idx) => {
      if (idx === 0) return acc

      const prevPoint = this.points[idx - 1]
      const currentPosition = new LatLon(point.zerowindLatitude, point.zerowindLongitude)
      const prevPosition = new LatLon(
        prevPoint.zerowindLatitude,
        prevPoint.zerowindLongitude
      )

      return acc + currentPosition.distanceTo(prevPosition)
    }, 0)
  }

  get zerowindDistance() {
    if (!this.hasWindData) return null

    if (this.straightLine) {
      return this.zerowindStraightLineDistance
    } else {
      return this.zerowindTrajectoryDistance
    }
  }

  get distanceWindEffect() {
    if (this.points.length === 0 || !this.hasWindData) return null

    const value = this.zerowindDistance
    const windEffect = this.distance - this.zerowindDistance
    const windEffectPercent = (Math.abs(windEffect) / this.distance) * 100

    return { value, windEffect, windEffectPercent }
  }

  get horizontalSpeed() {
    if (this.points.length === 0 || this.distance === null || this.time === null) {
      return emptyValueWithAvgMinMax
    }

    const avg = (this.distance / this.time) * 3.6

    const speedValues = this.points.map(el => el.hSpeed).sort((a, b) => a - b)
    const min = speedValues[0]
    const max = speedValues[speedValues.length - 1]

    return { avg, min, max }
  }

  get zerowindHorizontalSpeed() {
    if (this.zerowindDistance === null || this.time === null) return null

    return (this.zerowindDistance / this.time) * 3.6
  }

  get horizontalSpeedWindEffect() {
    if (this.horizontalSpeed.avg === null || this.zerowindHorizontalSpeed === null) {
      return null
    }

    const value = this.zerowindHorizontalSpeed
    const windEffect = this.horizontalSpeed.avg - this.zerowindHorizontalSpeed
    const windEffectPercent = (Math.abs(windEffect) / this.horizontalSpeed.avg) * 100

    return { value, windEffect, windEffectPercent }
  }

  get glideRatio() {
    if (this.points.length === 0 || this.distance === null || this.elevation === null) {
      return emptyValueWithAvgMinMax
    }

    const avg = this.distance / this.elevation

    const glideRatioValues = this.points.map(el => el.glideRatio).sort((a, b) => a - b)
    const min = glideRatioValues[0]
    const max = glideRatioValues[glideRatioValues.length - 1]

    return { avg, min, max }
  }

  get zerowindGlideRatio() {
    if (this.zerowindDistance === null || this.elevation === null) return null

    return this.zerowindDistance / this.elevation
  }

  get glideRatioWindEffect() {
    if (this.glideRatio.avg === null || this.zerowindGlideRatio === null) {
      return null
    }

    const value = this.zerowindGlideRatio
    const windEffect = this.glideRatio.avg - this.zerowindGlideRatio
    const windEffectPercent = (Math.abs(windEffect) / this.glideRatio.avg) * 100

    return { value, windEffect, windEffectPercent }
  }

  get time() {
    if (this.points.length === 0) return null

    return (this.lastPoint.gpsTime.getTime() - this.firstPoint.gpsTime.getTime()) / 1000
  }

  get elevation() {
    if (this.points.length === 0) return null

    return this.firstPoint.altitude - this.lastPoint.altitude
  }

  get verticalSpeed() {
    if (this.points.length === 0 || this.elevation === null || this.time === null) {
      return emptyValueWithAvgMinMax
    }

    const avg = (this.elevation / this.time) * 3.6

    const speedValues = this.points.map(el => el.vSpeed).sort((a, b) => a - b)
    const min = speedValues[0]
    const max = speedValues[speedValues.length - 1]

    return { avg, min, max }
  }

  get firstPoint() {
    return this.points[0]
  }

  get lastPoint() {
    return this.points.at(-1)
  }
}
