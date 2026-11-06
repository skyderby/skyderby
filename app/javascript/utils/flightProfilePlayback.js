import { accelerationBetween } from './tracks/playback/indicators'

export const ACCELERATION_LOOKAHEAD = 1

const LABEL_OFFSET = 10
const LABEL_GAP = 4
const LABEL_EDGE = 2

const interpolate = (a, b, ratio) => a + (b - a) * ratio

const timeOf = point => point.custom.time

export const profileDuration = profile =>
  profile.length ? timeOf(profile[profile.length - 1]) : 0

export const positionAt = (profile, time) => {
  if (!profile.length || time < 0 || time > profileDuration(profile)) return null

  let lo = 0
  let hi = profile.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (timeOf(profile[mid]) < time) lo = mid + 1
    else hi = mid
  }

  const after = profile[lo]
  const before = profile[Math.max(lo - 1, 0)]
  const span = timeOf(after) - timeOf(before)
  const ratio = span > 0 ? (time - timeOf(before)) / span : 0
  const hSpeed = interpolate(before.custom.hSpeed, after.custom.hSpeed, ratio)
  const vSpeed = interpolate(before.custom.vSpeed, after.custom.vSpeed, ratio)

  return {
    time,
    x: interpolate(before.x, after.x, ratio),
    y: interpolate(before.y, after.y, ratio),
    hSpeed,
    vSpeed,
    fullSpeed: Math.hypot(hSpeed, vSpeed)
  }
}

export const playbackStateAt = (profile, time) => {
  const position = positionAt(profile, time)
  if (!position) return null

  const future = positionAt(profile, time + ACCELERATION_LOOKAHEAD)
  return {
    ...position,
    acceleration: accelerationBetween(position, future, ACCELERATION_LOOKAHEAD)
  }
}

const overlapsHorizontally = (a, b) =>
  a.left < b.left + b.width && b.left < a.left + a.width

export const layoutLabels = (items, width, height) => {
  items.forEach(item => {
    let left = item.px + LABEL_OFFSET
    if (left + item.width > width - LABEL_EDGE) left = item.px - LABEL_OFFSET - item.width
    item.left = Math.max(LABEL_EDGE, Math.min(left, width - item.width - LABEL_EDGE))
    item.top = item.py - item.height / 2
  })

  const sorted = [...items].sort((a, b) => a.top - b.top)
  sorted.forEach((item, index) => {
    sorted.slice(0, index).forEach(above => {
      if (overlapsHorizontally(item, above)) {
        item.top = Math.max(item.top, above.top + above.height + LABEL_GAP)
      }
    })
  })

  for (let index = sorted.length - 1; index >= 0; index--) {
    const item = sorted[index]
    item.top = Math.min(item.top, height - item.height - LABEL_EDGE)
    sorted.slice(index + 1).forEach(below => {
      if (overlapsHorizontally(item, below)) {
        item.top = Math.min(item.top, below.top - item.height - LABEL_GAP)
      }
    })
    item.top = Math.max(item.top, LABEL_EDGE)
  }

  return items
}
