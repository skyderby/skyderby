import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'

import { msToKmh } from 'utils/unitsConversion'
import { MeasurementRecord } from 'api/terrainProfileMeasurements'
import { PointRecord } from 'api/tracks/points'

interface Coordinates {
  latitude: number
  longitude: number
}

interface FlightProfileChartPoint {
  x: number
  y: number
  custom: {
    hSpeed: number
    vSpeed: number
  }
}

export interface TerrainClearanceChartPoint {
  x: number
  y: number
  custom: {
    presentation: string | number
  }
}

const calculateDistance = (first: Coordinates, second: Coordinates): number => {
  const firstPosition = new LatLon(first.latitude, first.longitude)
  const secondPosition = new LatLon(second.latitude, second.longitude)

  return firstPosition.distanceTo(secondPosition)
}

const getTerrainElevation = (measurements: MeasurementRecord[], distance: number) => {
  for (let idx = 0; idx < measurements.length - 1; idx++) {
    const prevRecord = measurements[idx]
    const nextRecord = measurements[idx + 1]

    if (!prevRecord || !nextRecord) continue

    const { distance: prevDistance, altitude: prevAltitude } = prevRecord
    const { distance: nextDistance, altitude: nextAltitude } = nextRecord

    if (prevDistance <= distance && nextDistance >= distance) {
      const altitudeDiff = nextAltitude - prevAltitude
      const coeff = (distance - prevDistance) / (nextDistance - prevDistance)

      return prevAltitude + altitudeDiff * coeff
    }
  }

  return null
}

const distanceToTerrainValue = (value: number): string | number => {
  if (value < 1) return '<1'
  if (value > 120) return '>120'

  return Math.round(value)
}

const distanceToTerrainY = (y: number): number => Math.max(1, Math.min(y, 120))

export const calculateFlightProfile = (
  points: PointRecord[],
  straightLine: boolean
): FlightProfileChartPoint[] => {
  const firstPoint = points[0]
  if (!firstPoint) return []

  let accumulatedDistance = 0

  return points.map((point, idx) => {
    // The only way prev point could be undefined is at position -1
    // Nullish coalescing added to satisfy TypeScript's noUncheckedIndexedAccess
    const prevPoint = points[idx - 1] ?? firstPoint
    const distance = straightLine
      ? calculateDistance(point, firstPoint)
      : accumulatedDistance + calculateDistance(prevPoint, point)

    accumulatedDistance = distance

    return {
      x: distance,
      y: Math.round(Math.max(0, firstPoint.altitude - point.altitude)),
      custom: {
        hSpeed: Math.round(msToKmh(point.hSpeed)),
        vSpeed: Math.round(msToKmh(point.vSpeed))
      }
    }
  })
}

export const calculateTerrainClearance = (
  points: PointRecord[],
  measurements: MeasurementRecord[],
  straightLine: boolean
): TerrainClearanceChartPoint[] => {
  const flightProfile = calculateFlightProfile(points, straightLine)

  return flightProfile.map(({ x: distance, y: altitude }) => {
    const terrainElevation = getTerrainElevation(measurements, distance)

    if (terrainElevation === null) {
      return {
        x: distance,
        y: 120,
        custom: {
          presentation: '>120'
        }
      }
    }

    const distanceToTerrain = terrainElevation - altitude

    return {
      x: distance,
      y: distanceToTerrainY(distanceToTerrain),
      custom: {
        presentation: distanceToTerrainValue(distanceToTerrain)
      }
    }
  })
}
