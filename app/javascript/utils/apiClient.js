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

export default apiClient
