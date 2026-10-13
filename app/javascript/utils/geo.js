export const EARTH_MEAN_RADIUS = 6371000

export const toRadians = degrees => (degrees * Math.PI) / 180

const toDegrees = radians => (radians * 180) / Math.PI

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

const WGS84_A = 6378137
const WGS84_B = 6356752.314245
const WGS84_F = 1 / 298.257223563
const VINCENTY_EPSILON = 1e-12
const COINCIDENT_EPSILON = 1e-24
const VINCENTY_MAX_ITERATIONS = 1000

const vincentyInverse = (from, to) => {
  const phi1 = toRadians(Number(from.latitude))
  const phi2 = toRadians(Number(to.latitude))
  const L = toRadians(Number(to.longitude) - Number(from.longitude))

  const tanU1 = (1 - WGS84_F) * Math.tan(phi1)
  const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1)
  const sinU1 = tanU1 * cosU1
  const tanU2 = (1 - WGS84_F) * Math.tan(phi2)
  const cosU2 = 1 / Math.sqrt(1 + tanU2 * tanU2)
  const sinU2 = tanU2 * cosU2

  let lambda = L
  let sinLambda
  let cosLambda
  let sinSigma = 0
  let cosSigma = 0
  let sigma = 0
  let cosSqAlpha = 1
  let cos2SigmaM = 0
  let iterations = 0
  let lambdaPrev

  do {
    sinLambda = Math.sin(lambda)
    cosLambda = Math.cos(lambda)
    const sinSqSigma =
      (cosU2 * sinLambda) ** 2 + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) ** 2
    if (Math.abs(sinSqSigma) < COINCIDENT_EPSILON) break

    sinSigma = Math.sqrt(sinSqSigma)
    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda
    sigma = Math.atan2(sinSigma, cosSigma)
    const sinAlpha = (cosU1 * cosU2 * sinLambda) / sinSigma
    cosSqAlpha = 1 - sinAlpha * sinAlpha
    cos2SigmaM = cosSqAlpha !== 0 ? cosSigma - (2 * sinU1 * sinU2) / cosSqAlpha : 0
    const C = (WGS84_F / 16) * cosSqAlpha * (4 + WGS84_F * (4 - 3 * cosSqAlpha))
    lambdaPrev = lambda
    lambda =
      L +
      (1 - C) *
        WGS84_F *
        sinAlpha *
        (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM ** 2)))

    if (++iterations >= VINCENTY_MAX_ITERATIONS) {
      throw new Error('Vincenty formula failed to converge')
    }
  } while (Math.abs(lambda - lambdaPrev) > VINCENTY_EPSILON)

  const uSq = (cosSqAlpha * (WGS84_A ** 2 - WGS84_B ** 2)) / WGS84_B ** 2
  const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)))
  const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)))
  const deltaSigma =
    B *
    sinSigma *
    (cos2SigmaM +
      (B / 4) *
        (cosSigma * (-1 + 2 * cos2SigmaM ** 2) -
          (B / 6) * cos2SigmaM * (-3 + 4 * sinSigma ** 2) * (-3 + 4 * cos2SigmaM ** 2)))

  const distance = WGS84_B * A * (sigma - deltaSigma)
  const alpha1 =
    Math.abs(distance) < VINCENTY_EPSILON
      ? NaN
      : Math.atan2(cosU2 * sinLambda, cosU1 * sinU2 - sinU1 * cosU2 * cosLambda)

  return { distance, initialBearing: (toDegrees(alpha1) + 360) % 360 }
}

export const vincentyDistance = (from, to) => vincentyInverse(from, to).distance

export const vincentyBearing = (from, to) => vincentyInverse(from, to).initialBearing

export const vincentyDestination = (from, distance, bearing) => {
  const phi1 = toRadians(Number(from.latitude))
  const lambda1 = toRadians(Number(from.longitude))
  const alpha1 = toRadians(bearing)
  const sinAlpha1 = Math.sin(alpha1)
  const cosAlpha1 = Math.cos(alpha1)

  const tanU1 = (1 - WGS84_F) * Math.tan(phi1)
  const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1)
  const sinU1 = tanU1 * cosU1
  const sigma1 = Math.atan2(tanU1, cosAlpha1)
  const sinAlpha = cosU1 * sinAlpha1
  const cosSqAlpha = 1 - sinAlpha * sinAlpha
  const uSq = (cosSqAlpha * (WGS84_A ** 2 - WGS84_B ** 2)) / WGS84_B ** 2
  const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)))
  const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)))

  let sigma = distance / (WGS84_B * A)
  let sinSigma
  let cosSigma
  let cos2SigmaM
  let sigmaPrev
  let iterations = 0

  do {
    cos2SigmaM = Math.cos(2 * sigma1 + sigma)
    sinSigma = Math.sin(sigma)
    cosSigma = Math.cos(sigma)
    const deltaSigma =
      B *
      sinSigma *
      (cos2SigmaM +
        (B / 4) *
          (cosSigma * (-1 + 2 * cos2SigmaM ** 2) -
            (B / 6) * cos2SigmaM * (-3 + 4 * sinSigma ** 2) * (-3 + 4 * cos2SigmaM ** 2)))
    sigmaPrev = sigma
    sigma = distance / (WGS84_B * A) + deltaSigma

    if (++iterations >= VINCENTY_MAX_ITERATIONS) {
      throw new Error('Vincenty formula failed to converge')
    }
  } while (Math.abs(sigma - sigmaPrev) > VINCENTY_EPSILON)

  const x = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1
  const phi2 = Math.atan2(
    sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
    (1 - WGS84_F) * Math.sqrt(sinAlpha * sinAlpha + x * x)
  )
  const lambda = Math.atan2(
    sinSigma * sinAlpha1,
    cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1
  )
  const C = (WGS84_F / 16) * cosSqAlpha * (4 + WGS84_F * (4 - 3 * cosSqAlpha))
  const L =
    lambda -
    (1 - C) *
      WGS84_F *
      sinAlpha *
      (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM ** 2)))
  const lambda2 = lambda1 + L

  return {
    latitude: toDegrees(phi2),
    longitude: ((toDegrees(lambda2) + 540) % 360) - 180
  }
}

export const vincentyMidpoint = (from, to) => {
  const { distance, initialBearing } = vincentyInverse(from, to)
  if (!(distance > 0))
    return { latitude: Number(from.latitude), longitude: Number(from.longitude) }

  return vincentyDestination(from, distance / 2, initialBearing)
}
