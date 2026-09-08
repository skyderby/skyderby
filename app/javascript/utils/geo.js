export const EARTH_MEAN_RADIUS = 6371000

export const toRadians = degrees => (degrees * Math.PI) / 180

export const toDegrees = radians => (radians * 180) / Math.PI

export const haversineDistance = (from, to) => {
  const dLat = toRadians(to.latitude - from.latitude)
  const dLon = toRadians(to.longitude - from.longitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  return EARTH_MEAN_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const calculateBearing = (from, to) => {
  const lat1 = toRadians(from.latitude)
  const lat2 = toRadians(to.latitude)
  const dLon = toRadians(to.longitude - from.longitude)

  const y = Math.sin(dLon) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)

  return (toDegrees(Math.atan2(y, x)) + 360) % 360
}

export const segmentIntersection = (a, b, c, d) => {
  const denom =
    (a.latitude - b.latitude) * (c.longitude - d.longitude) -
    (a.longitude - b.longitude) * (c.latitude - d.latitude)
  if (Math.abs(denom) < 1e-12) return null

  const t =
    ((a.latitude - c.latitude) * (c.longitude - d.longitude) -
      (a.longitude - c.longitude) * (c.latitude - d.latitude)) /
    denom
  const u =
    -(
      (a.latitude - b.latitude) * (a.longitude - c.longitude) -
      (a.longitude - b.longitude) * (a.latitude - c.latitude)
    ) / denom

  if (t < 0 || t > 1 || u < 0 || u > 1) return null

  return {
    latitude: a.latitude + t * (b.latitude - a.latitude),
    longitude: a.longitude + t * (b.longitude - a.longitude),
    fraction: t
  }
}

export const crossTrackDistance = (point, lineStart, lineEnd) => {
  const d12 = haversineDistance(lineStart, lineEnd)
  if (d12 === 0) return 0

  const d13 = haversineDistance(lineStart, point)
  const bearing12 = toRadians(calculateBearing(lineStart, lineEnd))
  const bearing13 = toRadians(calculateBearing(lineStart, point))

  return (
    Math.asin(Math.sin(d13 / EARTH_MEAN_RADIUS) * Math.sin(bearing13 - bearing12)) *
    EARTH_MEAN_RADIUS
  )
}

export const midpoint = (a, b) => ({
  latitude: (a.latitude + b.latitude) / 2,
  longitude: (a.longitude + b.longitude) / 2
})
