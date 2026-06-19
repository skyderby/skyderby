const workerBody = () => {
  const R = 6371000
  const toRad = deg => (deg * Math.PI) / 180

  const haversine = (lat1, lon1, lat2, lon2) => {
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  self.onmessage = event => {
    const { alt, lat, lng, t, windowSize, step } = event.data
    const n = alt.length

    const crossing = (targetAlt, fromIdx) => {
      let i = fromIdx
      while (i < n && alt[i] > targetAlt) i++
      if (i >= n) return null
      if (i === 0) return { lat: lat[0], lng: lng[0], t: t[0], idx: 0 }

      const a0 = alt[i - 1]
      const a1 = alt[i]
      const coeff = a0 === a1 ? 0 : (a0 - targetAlt) / (a0 - a1)

      return {
        lat: lat[i - 1] + (lat[i] - lat[i - 1]) * coeff,
        lng: lng[i - 1] + (lng[i] - lng[i - 1]) * coeff,
        t: t[i - 1] + (t[i] - t[i - 1]) * coeff,
        idx: i
      }
    }

    const best = {
      speed: { value: -Infinity },
      distance: { value: -Infinity },
      time: { value: -Infinity }
    }

    let entryHint = 0
    let exitHint = 0
    const topAlt = Math.floor(alt[0])

    for (let from = topAlt; ; from -= step) {
      const to = from - windowSize

      const entry = crossing(from, entryHint)
      if (!entry) break
      entryHint = entry.idx

      const exit = crossing(to, Math.max(entry.idx, exitHint))
      if (!exit) break
      exitHint = exit.idx

      const distance = haversine(entry.lat, entry.lng, exit.lat, exit.lng)
      const time = (exit.t - entry.t) / 1000
      const speed = time > 0 ? (distance / time) * 3.6 : 0

      if (speed > best.speed.value) {
        best.speed = { from, to, value: speed, distance, time }
      }
      if (distance > best.distance.value) {
        best.distance = { from, to, value: distance, distance, time }
      }
      if (time > best.time.value) {
        best.time = { from, to, value: time, distance, time }
      }
    }

    if (best.speed.value === -Infinity) {
      self.postMessage(null)
      return
    }

    self.postMessage(best)
  }
}

export const computeBestWindows = (points, { windowSize = 1000, step = 1 } = {}) => {
  return new Promise((resolve, reject) => {
    if (!points || points.length < 2) {
      resolve(null)
      return
    }

    const alt = points.map(p => p.altitude)
    if (alt[0] - alt[alt.length - 1] < windowSize) {
      resolve(null)
      return
    }

    const lat = points.map(p => p.latitude)
    const lng = points.map(p => p.longitude)
    const t = points.map(p => p.gpsTime.getTime())

    const blob = new Blob([`(${workerBody})()`], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    const worker = new Worker(url)

    worker.onmessage = event => {
      resolve(event.data)
      worker.terminate()
      URL.revokeObjectURL(url)
    }

    worker.onerror = error => {
      reject(error)
      worker.terminate()
      URL.revokeObjectURL(url)
    }

    worker.postMessage({ alt, lat, lng, t, windowSize, step })
  })
}
