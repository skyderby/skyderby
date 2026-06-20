export const calculateBearing = (from, to) => {
  const lat1 = (from.latitude * Math.PI) / 180
  const lat2 = (to.latitude * Math.PI) / 180
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180

  const y = Math.sin(dLon) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)

  const bearing = (Math.atan2(y, x) * 180) / Math.PI
  return (bearing + 360) % 360
}

export const targetIndexFrom = (points, fromIndex, milliseconds = 3000) => {
  const targetTime = points[fromIndex].gpsTime + milliseconds

  for (let i = fromIndex + 1; i < points.length; i++) {
    if (points[i].gpsTime >= targetTime) {
      return i
    }
  }

  return points.length - 1
}

export const closestIndexByPlayerTime = (points, playerTime) => {
  let closestIndex = 0
  let minDiff = Infinity

  points.forEach((point, index) => {
    const diff = Math.abs(point.playerTime - playerTime)
    if (diff < minDiff) {
      minDiff = diff
      closestIndex = index
    }
  })

  return closestIndex
}

export const interpolateByPlayerTime = (points, targetTime) => {
  if (!points || points.length === 0) return null

  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]

    if (targetTime >= curr.playerTime && targetTime < next.playerTime) {
      const fraction =
        (targetTime - curr.playerTime) / (next.playerTime - curr.playerTime)
      return {
        altitude: curr.altitude + (next.altitude - curr.altitude) * fraction,
        distance: curr.distance + (next.distance - curr.distance) * fraction,
        fullSpeed: curr.fullSpeed + (next.fullSpeed - curr.fullSpeed) * fraction,
        hSpeed: curr.hSpeed + (next.hSpeed - curr.hSpeed) * fraction,
        vSpeed: curr.vSpeed + (next.vSpeed - curr.vSpeed) * fraction,
        glideRatio:
          (curr.glideRatio ?? 0) +
          ((next.glideRatio ?? 0) - (curr.glideRatio ?? 0)) * fraction
      }
    }
  }

  if (targetTime < points[0].playerTime) {
    return points[0]
  }

  return points[points.length - 1]
}
