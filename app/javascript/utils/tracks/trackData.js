import { get } from '@rails/request.js'

const MAX_ATTEMPTS = 3

const isRetryable = error =>
  error.name === 'TypeError' || (error.status >= 500 && error.status < 600)

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const convertSpeedsToKmh = point => {
  point.hSpeed = point.hSpeed * 3.6
  point.vSpeed = point.vSpeed * 3.6
  point.fullSpeed = point.fullSpeed * 3.6
  if (point.zerowindHSpeed) point.zerowindHSpeed = point.zerowindHSpeed * 3.6
}

const requestJson = async (url, { params = {}, attempt = 1 } = {}) => {
  try {
    const response = await get(url, { query: params, responseKind: 'json' })

    if (!response.ok) {
      const error = new Error(`HTTP ${response.statusCode}`)
      error.status = response.statusCode
      throw error
    }

    return await response.json
  } catch (error) {
    if (isRetryable(error) && attempt < MAX_ATTEMPTS) {
      await delay(attempt * 1000)
      return requestJson(url, { params, attempt: attempt + 1 })
    }

    throw error
  }
}

export const fetchTrackPoints = async (
  url,
  { params = {}, convertSpeeds = false } = {}
) => {
  const data = await requestJson(url, { params })

  if (data.points) {
    data.points.forEach(point => {
      point.gpsTime = new Date(point.gpsTime)
      if (convertSpeeds) convertSpeedsToKmh(point)
    })
  }

  return data
}

export const fetchTrackWeather = async (url, { params = {} } = {}) => {
  try {
    return await requestJson(url, { params })
  } catch {
    return []
  }
}
