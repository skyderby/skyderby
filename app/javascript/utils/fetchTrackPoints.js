export default async function fetchTrackPoints(url, options = {}) {
  const params = new URLSearchParams(options)

  const response = await fetch(`${url}?${params}`, {
    headers: { Accept: 'application/json' }
  })
  const data = await response.json()

  if (data.points) {
    data.points = data.points.map(point => ({
      ...point,
      gpsTime: new Date(point.gpsTime)
    }))
  }

  return data
}
