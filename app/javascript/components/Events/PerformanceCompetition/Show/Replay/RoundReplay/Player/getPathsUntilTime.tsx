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

export default function getPathsUntilTime(
  points: PlayerPoint[],
  time: number,
  task: Round['task']
) {
  const seekTime = time - 5
  const pointsBeforeTime = points.filter(el => el.playerTime <= seekTime)

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
