function apiClient(url, method, data) {
  return fetch(url, {
    method,
    headers: {
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
}

apiClient.post = (url, data) => apiClient(url, 'POST', data)
apiClient.put = (url, data) => apiClient(url, 'PUT', data)
apiClient.delete = (url, data) => apiClient(url, 'DELETE', data)

apiClient.fetchTrackPoints = async (trackId, options = {}) => {
  const params = new URLSearchParams(options)

  const response = await fetch(`/tracks/${trackId}/points?${params}`, {
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

export default apiClient
