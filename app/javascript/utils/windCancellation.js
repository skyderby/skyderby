import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

const EARTH_RADIUS_M = 6371000
const RAD_PER_DEG = Math.PI / 180
const DEG_PER_RAD = 180 / Math.PI

const degToRad = angle => angle * RAD_PER_DEG
const radToDeg = angle => angle * DEG_PER_RAD
const normalizeAngle = angle => ((angle + 540) % 360) - 180

const distanceBetween = (lat1, lon1, lat2, lon2) => {
  const p1 = new LatLon(lat1, lon1)
  const p2 = new LatLon(lat2, lon2)
  return p1.distanceTo(p2)
}

const shiftPosition = (origLatDeg, origLonDeg, distance, bearing) => {
  const origLatRad = degToRad(origLatDeg)
  const origLonRad = degToRad(origLonDeg)
  const angularDist = distance / EARTH_RADIUS_M
  const bearingRad = degToRad(bearing)

  const destLatRad = Math.asin(
    Math.sin(origLatRad) * Math.cos(angularDist) +
      Math.cos(origLatRad) * Math.sin(angularDist) * Math.cos(bearingRad)
  )

  const atan2X = Math.cos(angularDist) - Math.sin(origLatRad) * Math.sin(destLatRad)
  const atan2Y = Math.sin(bearingRad) * Math.sin(angularDist) * Math.cos(origLatRad)
  const destLonRad = origLonRad + Math.atan2(atan2Y, atan2X)

  return {
    latitude: Math.round(normalizeAngle(radToDeg(destLatRad)) * 1e10) / 1e10,
    longitude: Math.round(normalizeAngle(radToDeg(destLonRad)) * 1e10) / 1e10
  }
}

class WeatherData {
  constructor(weatherData) {
    this.weatherData = weatherData.map(record => ({
      ...record,
      actualOn: new Date(record.actualOn)
    }))
  }

  weatherOn(date, altitude) {
    const filtered = this.filterByDate(date)
    const grouped = this.groupByAltitude(filtered)
    return this.selectByAltitude(grouped, altitude)
  }

  filterByDate(date) {
    const targetHour = new Date(date)
    targetHour.setMinutes(0, 0, 0)
    targetHour.setMilliseconds(0)

    return this.weatherData.filter(
      record => record.actualOn.getTime() === targetHour.getTime()
    )
  }

  groupByAltitude(weatherData) {
    const byAltitude = {}
    weatherData.forEach(record => {
      const alt = record.altitude
      if (!byAltitude[alt] || record.actualOn > byAltitude[alt].actualOn) {
        byAltitude[alt] = record
      }
    })
    return Object.values(byAltitude)
  }

  selectByAltitude(weatherData, altitude) {
    if (weatherData.length === 0) {
      return { windSpeed: 0, windDirection: 0 }
    }

    const sorted = [...weatherData].sort((a, b) => a.altitude - b.altitude)

    if (altitude <= sorted[0].altitude) return sorted[0]
    if (altitude > sorted[sorted.length - 1].altitude) return sorted[sorted.length - 1]

    for (let i = 0; i < sorted.length - 1; i++) {
      if (altitude >= sorted[i].altitude && altitude <= sorted[i + 1].altitude) {
        return this.interpolate(sorted[i], sorted[i + 1], altitude)
      }
    }

    return sorted[0]
  }

  interpolate(first, second, altitude) {
    const factor = (altitude - first.altitude) / (second.altitude - first.altitude)

    return {
      altitude,
      windSpeed: first.windSpeed + (second.windSpeed - first.windSpeed) * factor,
      windDirection:
        first.windDirection + (second.windDirection - first.windDirection) * factor
    }
  }
}

const calculateWindCancellation = (points, weatherData) => {
  if (!weatherData || weatherData.length === 0 || points.length === 0) {
    return points
  }

  const weather = new WeatherData(weatherData)
  const referenceTime = points[0].gpsTime
  let accumOffsetX = 0
  let accumOffsetY = 0

  const pointsWithZerowindPosition = points.map((point, idx) => {
    const timeDiff =
      idx === 0 ? 0 : (point.gpsTime.getTime() - points[idx - 1].gpsTime.getTime()) / 1000

    const weatherDatum = weather.weatherOn(referenceTime, point.altitude)
    const offset = weatherDatum.windSpeed * timeDiff
    const directionRad = degToRad(weatherDatum.windDirection)

    accumOffsetX += Math.cos(directionRad) * offset
    accumOffsetY += Math.sin(directionRad) * offset

    const magnitude = Math.sqrt(accumOffsetX * accumOffsetX + accumOffsetY * accumOffsetY)
    const shiftDirection = radToDeg(Math.atan2(accumOffsetY, accumOffsetX))

    const newPosition = shiftPosition(
      point.latitude,
      point.longitude,
      magnitude,
      shiftDirection
    )

    return {
      ...point,
      zerowindLatitude: newPosition.latitude,
      zerowindLongitude: newPosition.longitude,
      timeDiff
    }
  })

  return pointsWithZerowindPosition.map((point, idx) => {
    if (idx === 0) {
      return {
        ...point,
        zerowindHSpeed: point.hSpeed,
        zerowindGlideRatio: point.glideRatio
      }
    }

    const prevPoint = pointsWithZerowindPosition[idx - 1]
    const distance = distanceBetween(
      prevPoint.zerowindLatitude,
      prevPoint.zerowindLongitude,
      point.zerowindLatitude,
      point.zerowindLongitude
    )

    const timeDiff = point.timeDiff
    const zerowindHSpeed = timeDiff > 0 ? (distance / timeDiff) * 3.6 : 0
    const vSpeed = timeDiff > 0 ? (prevPoint.altitude - point.altitude) / timeDiff : 0
    const zerowindGlideRatio = vSpeed !== 0 ? distance / timeDiff / Math.abs(vSpeed) : 0

    return {
      ...point,
      zerowindHSpeed,
      zerowindGlideRatio
    }
  })
}

export default calculateWindCancellation
