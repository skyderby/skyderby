import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

export const WINDOW_START = 10
export const REFERENCE_DROP = 200

const MIN_ONE_TO_ONE_DROP = 50
const SAMPLE_STEP = 1
const REFERENCE_BAND = 50

const GLIDE_EDGES = {
  wingsuit: [3.5, 3, 2.5],
  default: [2, 1.5, 1]
}
const SPEED_EDGES = [250, 200, 150]

const buildBuckets = edges => [
  ...edges.map((min, index) => ({ min, max: index === 0 ? null : edges[index - 1] })),
  { min: null, max: edges[edges.length - 1] }
]

export const glideBuckets = wingsuit =>
  buildBuckets(wingsuit ? GLIDE_EDGES.wingsuit : GLIDE_EDGES.default)

export const speedBuckets = () => buildBuckets(SPEED_EDGES)

const horizontalDistance = (from, to) =>
  new LatLon(from.latitude, from.longitude).distanceTo(
    new LatLon(to.latitude, to.longitude)
  )

const buildProfile = points => {
  const first = points[0]
  let distance = 0

  return points.map((point, index) => {
    if (index > 0) distance += horizontalDistance(points[index - 1], point)

    return {
      t: point.flTime,
      x: distance,
      altitude: point.altitude,
      drop: Math.max(0, first.altitude - point.altitude)
    }
  })
}

const stateAt = (profile, t) => {
  const last = profile[profile.length - 1]
  if (t <= profile[0].t) return profile[0]
  if (t >= last.t) return last

  for (let i = 1; i < profile.length; i++) {
    if (profile[i].t < t) continue

    const prev = profile[i - 1]
    const curr = profile[i]
    const fraction = curr.t === prev.t ? 0 : (t - prev.t) / (curr.t - prev.t)

    return {
      t,
      x: prev.x + (curr.x - prev.x) * fraction,
      altitude: prev.altitude + (curr.altitude - prev.altitude) * fraction,
      drop: prev.drop + (curr.drop - prev.drop) * fraction
    }
  }

  return last
}

const findOneToOneDrop = profile => {
  for (let i = 1; i < profile.length; i++) {
    const prev = profile[i - 1]
    const curr = profile[i]
    if (curr.drop < MIN_ONE_TO_ONE_DROP) continue

    const prevDiff = prev.drop - prev.x
    const currDiff = curr.drop - curr.x
    if (prevDiff * currDiff >= 0) continue

    const fraction = prevDiff / (prevDiff - currDiff)
    return prev.drop + fraction * (curr.drop - prev.drop)
  }

  return null
}

const distanceAtDrop = (profile, drop) => {
  for (let i = 1; i < profile.length; i++) {
    const prev = profile[i - 1]
    const curr = profile[i]
    if (curr.drop < drop) continue

    const fraction =
      curr.drop === prev.drop ? 0 : (drop - prev.drop) / (curr.drop - prev.drop)
    return prev.x + fraction * (curr.x - prev.x)
  }

  return null
}

const dropBands = (profile, drop, step) => {
  const bands = []

  for (let from = 0; from < drop; from += step) {
    const start = distanceAtDrop(profile, from)
    const end = distanceAtDrop(profile, from + step)

    bands.push({
      from,
      to: from + step,
      distance: start === null || end === null ? null : end - start
    })
  }

  return bands
}

const sampleWindow = (profile, from, to) => {
  const samples = []
  if (!(to > from)) return samples

  for (let t = from; t < to; t += SAMPLE_STEP) {
    const end = Math.min(t + SAMPLE_STEP, to)
    const head = stateAt(profile, t)
    const tail = stateAt(profile, end)

    samples.push({
      dt: end - t,
      dx: tail.x - head.x,
      dv: head.altitude - tail.altitude
    })
  }

  return samples
}

const glideOf = sample => (sample.dv > 0 ? sample.dx / sample.dv : Infinity)

const speedOf = sample =>
  sample.dt > 0 ? (Math.hypot(sample.dx, sample.dv) / sample.dt) * 3.6 : 0

const bucketIndex = (buckets, value) =>
  buckets.findIndex(
    bucket =>
      (bucket.min === null || value >= bucket.min) &&
      (bucket.max === null || value < bucket.max)
  )

const distribution = (samples, buckets, valueOf) => {
  const seconds = buckets.map(() => 0)

  samples.forEach(sample => {
    const index = bucketIndex(buckets, valueOf(sample))
    if (index >= 0) seconds[index] += sample.dt
  })

  return buckets.map((bucket, index) => ({ ...bucket, seconds: seconds[index] }))
}

const sum = (samples, valueOf) =>
  samples.reduce((total, sample) => total + valueOf(sample), 0)

export const computeBaseJumpSummary = (
  points,
  { exitFlTime = null, deployFlTime = null, wingsuit = false } = {}
) => {
  if (!points || points.length < 2) return null

  const profile = buildProfile(points)
  const exit = exitFlTime ?? profile[0].t
  const samples = sampleWindow(
    profile,
    exit + WINDOW_START,
    deployFlTime ?? profile[profile.length - 1].t
  )

  const totalTime = sum(samples, sample => sample.dt)
  const totalDrop = sum(samples, sample => sample.dv)
  const totalDistance = sum(samples, sample => sample.dx)
  const totalPath = sum(samples, sample => Math.hypot(sample.dx, sample.dv))

  return {
    oneToOneDrop: findOneToOneDrop(profile),
    referenceDrop: REFERENCE_DROP,
    referenceDistance: distanceAtDrop(profile, REFERENCE_DROP),
    referenceBands: dropBands(profile, REFERENCE_DROP, REFERENCE_BAND),
    glide: {
      value: totalDrop > 0 ? totalDistance / totalDrop : null,
      buckets: distribution(samples, glideBuckets(wingsuit), glideOf)
    },
    speed: {
      value: totalTime > 0 ? (totalPath / totalTime) * 3.6 : null,
      buckets: distribution(samples, speedBuckets(), speedOf)
    }
  }
}
