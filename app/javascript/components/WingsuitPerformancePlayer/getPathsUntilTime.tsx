import { Round } from 'api/performanceCompetitions'
import { PlayerPoint } from './types'

const interpolatedAttrs = ['altitude', 'chartDistance', 'vSpeed'] as const

function interpolatedPoint(
  first: PlayerPoint,
  second: PlayerPoint,
  time: number,
  task: Round['task']
) {
  const interpolationFactor =
    (time - first.playerTime) / (second.playerTime - first.playerTime)

  const interpolatedPoint = interpolatedAttrs.reduce(
    (acc: PlayerPoint, key: typeof interpolatedAttrs[number]) => {
      if (acc[key] === undefined || first[key] === undefined) return acc
      acc[key] = interpolate(first[key], second[key], interpolationFactor)

      return acc
    },
    Object.assign({}, first)
  )

  if (first.taskResult !== undefined && second.taskResult !== undefined) {
    const taskResult = interpolate(
      first.taskResult,
      second.taskResult,
      interpolationFactor
    )

    if (task === 'time') {
      interpolatedPoint.taskResult = Math.round(taskResult * 10) / 10
    } else if (['distance', 'speed'].includes(task)) {
      interpolatedPoint.taskResult = Math.round(taskResult)
    }
  }

  interpolatedPoint.vSpeed = Math.round(interpolatedPoint.vSpeed)

  return interpolatedPoint
}

function interpolate(first: number, second: number, factor: number) {
  return first + (second - first) * factor
}

const getClosestIndex = (points: PlayerPoint[], time: number) => {
  let start = 0
  let end = points.length - 1

  if (time < points[start].playerTime) return start
  if (time > points[end].playerTime) return end

  while (start <= end) {
    const middle = Math.floor((start + end) / 2)

    if (time === points[middle].playerTime) {
      return middle
    }

    if (time <= points[middle].playerTime && time >= points[middle - 1].playerTime) {
      return middle - 1
    }

    if (time < points[middle].playerTime) {
      end = middle - 1
    } else {
      start = middle + 1
    }
  }

  // This should never happen and is here to satisfy TypeScript
  throw new Error('Could not find closest index')
}

export default function getPathsUntilTime(
  points: PlayerPoint[],
  time: number,
  task: Round['task']
) {
  const seekTime = time - 5
  const closestIndex = getClosestIndex(points, seekTime)
  const pointsBeforeTime = points.slice(0, closestIndex + 1)

  if (pointsBeforeTime.length === 0) return pointsBeforeTime

  const nextPoint = points[pointsBeforeTime.length]

  if (nextPoint) {
    pointsBeforeTime.push(
      interpolatedPoint(
        pointsBeforeTime[pointsBeforeTime.length - 1],
        nextPoint,
        seekTime,
        task
      )
    )
  }

  return pointsBeforeTime
}
