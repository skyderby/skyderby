const SEGMENT_SHARES = [0.15, 0.35, 0.35, 0.15]

const lerp = (a, b, fraction) => a + (b - a) * fraction

const interpolateField = (curr, next, fraction, field) =>
  lerp(curr[field], next[field], fraction)

const interpolateAtAltitude = (points, altitude) => {
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]

    if (curr.altitude >= altitude && next.altitude < altitude) {
      const fraction = (curr.altitude - altitude) / (curr.altitude - next.altitude)

      return {
        altitude,
        distance: interpolateField(curr, next, fraction, 'distance'),
        playerTime: interpolateField(curr, next, fraction, 'playerTime'),
        fullSpeed: interpolateField(curr, next, fraction, 'fullSpeed'),
        hSpeed: interpolateField(curr, next, fraction, 'hSpeed'),
        vSpeed: interpolateField(curr, next, fraction, 'vSpeed')
      }
    }
  }

  const fallback = altitude >= points[0].altitude ? points[0] : points.at(-1)
  return {
    altitude,
    distance: fallback.distance,
    playerTime: fallback.playerTime,
    fullSpeed: fallback.fullSpeed,
    hSpeed: fallback.hSpeed,
    vSpeed: fallback.vSpeed
  }
}

const kineticEnergy = kmh => {
  const ms = kmh / 3.6
  return 0.5 * ms * ms
}

export const computeSegmentAnalysis = (points, { from, to }) => {
  if (!points || points.length < 2 || !(from > to)) return null

  const drop = from - to

  const boundaries = [from]
  let share = 0
  SEGMENT_SHARES.forEach(part => {
    share += part
    boundaries.push(from - drop * share)
  })

  const marks = boundaries.map(altitude => interpolateAtAltitude(points, altitude))

  const segments = SEGMENT_SHARES.map((_, index) => {
    const entry = marks[index]
    const exit = marks[index + 1]

    return {
      index,
      fromAltitude: entry.altitude,
      toAltitude: exit.altitude,
      distance: exit.distance - entry.distance,
      time: exit.playerTime - entry.playerTime,
      deltaSpeed: exit.fullSpeed - entry.fullSpeed,
      deltaEnergy: kineticEnergy(exit.fullSpeed) - kineticEnergy(entry.fullSpeed)
    }
  })

  const windowEntry = marks[0]
  const maxSpeedBefore = points
    .filter(point => point.altitude >= from)
    .reduce((max, point) => Math.max(max, point.fullSpeed), windowEntry.fullSpeed)

  return {
    entry: {
      maxSpeedBefore,
      fullSpeed: windowEntry.fullSpeed,
      hSpeed: windowEntry.hSpeed,
      vSpeed: windowEntry.vSpeed,
      deltaFromMax: windowEntry.fullSpeed - maxSpeedBefore,
      energyFromMax: kineticEnergy(windowEntry.fullSpeed) - kineticEnergy(maxSpeedBefore)
    },
    segments
  }
}

export default computeSegmentAnalysis
