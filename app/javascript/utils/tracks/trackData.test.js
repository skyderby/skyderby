import { describe, test, expect, vi, beforeEach } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@rails/request.js', () => ({ get }))

import { fetchTrackPoints, fetchTrackWeather } from './trackData'

const okResponse = data => ({ ok: true, statusCode: 200, json: Promise.resolve(data) })
const errorResponse = status => ({
  ok: false,
  statusCode: status,
  json: Promise.resolve(null)
})

beforeEach(() => {
  get.mockReset()
})

describe('fetchTrackPoints', () => {
  test('converts gpsTime and speeds when convertSpeeds is true', async () => {
    get.mockResolvedValue(
      okResponse({
        points: [
          {
            gpsTime: '2020-01-01T00:00:00Z',
            hSpeed: 10,
            vSpeed: 20,
            fullSpeed: 30,
            zerowindHSpeed: 5
          }
        ]
      })
    )

    const data = await fetchTrackPoints('/url', { convertSpeeds: true })
    const point = data.points[0]

    expect(point.gpsTime).toBeInstanceOf(Date)
    expect(point.hSpeed).toBeCloseTo(36)
    expect(point.vSpeed).toBeCloseTo(72)
    expect(point.fullSpeed).toBeCloseTo(108)
    expect(point.zerowindHSpeed).toBeCloseTo(18)
  })

  test('keeps raw speeds when convertSpeeds is false', async () => {
    get.mockResolvedValue(
      okResponse({
        points: [
          { gpsTime: '2020-01-01T00:00:00Z', hSpeed: 10, vSpeed: 20, fullSpeed: 30 }
        ]
      })
    )

    const data = await fetchTrackPoints('/url')
    const point = data.points[0]

    expect(point.gpsTime).toBeInstanceOf(Date)
    expect(point.hSpeed).toBe(10)
    expect(point.fullSpeed).toBe(30)
  })

  test('throws on a non-retryable HTTP error without retrying', async () => {
    get.mockResolvedValue(errorResponse(404))

    await expect(fetchTrackPoints('/url')).rejects.toThrow('HTTP 404')
    expect(get).toHaveBeenCalledTimes(1)
  })

  test('retries on a server error and resolves', async () => {
    vi.useFakeTimers()
    get
      .mockResolvedValueOnce(errorResponse(500))
      .mockResolvedValueOnce(okResponse({ points: [] }))

    const promise = fetchTrackPoints('/url')
    await vi.runAllTimersAsync()
    const data = await promise

    expect(data.points).toEqual([])
    expect(get).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })
})

describe('fetchTrackWeather', () => {
  test('returns the payload on success', async () => {
    get.mockResolvedValue(okResponse([{ wind: 1 }]))

    await expect(fetchTrackWeather('/weather')).resolves.toEqual([{ wind: 1 }])
  })

  test('returns an empty array when the request keeps failing', async () => {
    vi.useFakeTimers()
    get.mockRejectedValue(new TypeError('Failed to fetch'))

    const promise = fetchTrackWeather('/weather')
    await vi.runAllTimersAsync()

    await expect(promise).resolves.toEqual([])
    vi.useRealTimers()
  })
})
