import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'
import { Result, Round } from 'api/performanceCompetitions'
import { PlayerPoint } from './types'
import { PointRecord } from 'api/tracks/points'
import { differenceInMilliseconds } from 'date-fns'

function roundTime(time: number) {
  return Math.round(time / 100) / 10
}

function getTime(currentTime: Date, startTime: Date, endTime: Date) {
  if (currentTime < startTime) return undefined
  if (currentTime > endTime)
    return roundTime(differenceInMilliseconds(endTime, startTime))

  return roundTime(differenceInMilliseconds(currentTime, startTime))
}

function distanceBetween(first: PointRecord, second: PointRecord) {
  const firstCoordinates = new LatLon(first.latitude, first.longitude)
  const secondCoordinates = new LatLon(second.latitude, second.longitude)

  return Math.round(firstCoordinates.distanceTo(secondCoordinates))
}

function getChartDistance(point: PointRecord, startPoint: PointRecord) {
  if (point.gpsTime < startPoint.gpsTime) return -distanceBetween(startPoint, point)

  return distanceBetween(startPoint, point)
}

function getDistance(point: PointRecord, startPoint: PointRecord, endPoint: PointRecord) {
  if (point.gpsTime < startPoint.gpsTime) return undefined
  if (point.gpsTime > endPoint.gpsTime) return distanceBetween(startPoint, endPoint)

  return distanceBetween(startPoint, point)
}

function getSpeed(
  gpsTime: Date,
  distance: number | undefined,
  time: number | undefined,
  endTime: Date,
  result?: number
) {
  if (!distance || !time) return undefined

  const speed = Math.round((distance / time) * 3.6)

  if (gpsTime > endTime) return result || speed

  return speed
}

function processPoints(
  task: Round['task'],
  rangeFrom: number,
  rangeTo: number,
  {
    id,
    points,
    startPoint,
    endPoint,
    result
  }: {
    id: number
    points: PointRecord[]
    startPoint: PointRecord | null
    endPoint: PointRecord | null
    result: Result
  }
): PlayerPoint[] {
  if (!startPoint || !endPoint) return []

  const startTime = startPoint.gpsTime
  const endTime = endPoint.gpsTime

  return points
    .map(el => {
      const gpsTime = el.gpsTime
      const time = getTime(gpsTime, startTime, endTime)
      const playerTime = roundTime(differenceInMilliseconds(gpsTime, startTime))
      const distance = getDistance(el, startPoint, endPoint)
      const chartDistance = getChartDistance(el, startPoint)
      const speed = getSpeed(
        gpsTime,
        distance,
        time,
        endTime,
        task === 'speed' ? Math.round(result.result) : undefined
      )

      const taskResult = { speed, distance, time }[task]

      return {
        id,
        playerTime,
        altitude: el.altitude,
        vSpeed: Math.round(el.vSpeed * 3.6),
        chartDistance,
        gpsTime,
        startTime,
        endTime,
        taskResult
      }
    })
    .filter(
      <T extends { playerTime: number; altitude: number }>(el: T) =>
        el.playerTime >= -5.1 && el.altitude > rangeTo - (rangeFrom - rangeTo) * 0.2
    )
}

export default processPoints
