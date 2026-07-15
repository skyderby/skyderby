const workerBody = () => {
  const toRad = deg => (deg * Math.PI) / 180

  const vincenty = (lat1, lon1, lat2, lon2) => {
    const a = 6378137
    const f = 1 / 298.257223563
    const b = (1 - f) * a

    const L = toRad(lon2 - lon1)
    const tanU1 = (1 - f) * Math.tan(toRad(lat1))
    const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1)
    const sinU1 = tanU1 * cosU1
    const tanU2 = (1 - f) * Math.tan(toRad(lat2))
    const cosU2 = 1 / Math.sqrt(1 + tanU2 * tanU2)
    const sinU2 = tanU2 * cosU2

    let lambda = L
    let lambdaPrev
    let iterations = 0
    let sinSigma
    let cosSigma
    let sigma
    let cosSqAlpha
    let cos2SigmaM

    do {
      const sinLambda = Math.sin(lambda)
      const cosLambda = Math.cos(lambda)
      sinSigma = Math.sqrt(
        cosU2 * sinLambda * (cosU2 * sinLambda) +
          (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) *
            (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda)
      )
      if (sinSigma === 0) return 0

      cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda
      sigma = Math.atan2(sinSigma, cosSigma)
      const sinAlpha = (cosU1 * cosU2 * sinLambda) / sinSigma
      cosSqAlpha = 1 - sinAlpha * sinAlpha
      cos2SigmaM = cosSqAlpha !== 0 ? cosSigma - (2 * sinU1 * sinU2) / cosSqAlpha : 0
      const C = (f / 16) * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha))
      lambdaPrev = lambda
      lambda =
        L +
        (1 - C) *
          f *
          sinAlpha *
          (sigma +
            C *
              sinSigma *
              (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)))
    } while (Math.abs(lambda - lambdaPrev) > 1e-12 && ++iterations < 100)

    const uSq = (cosSqAlpha * (a * a - b * b)) / (b * b)
    const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)))
    const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)))
    const deltaSigma =
      B *
      sinSigma *
      (cos2SigmaM +
        (B / 4) *
          (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
            (B / 6) *
              cos2SigmaM *
              (-3 + 4 * sinSigma * sinSigma) *
              (-3 + 4 * cos2SigmaM * cos2SigmaM)))

    return b * A * (sigma - deltaSigma)
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

      const distance = vincenty(entry.lat, entry.lng, exit.lat, exit.lng)
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
