import { differenceInSeconds } from 'date-fns'
import { Result } from 'api/performanceCompetitions'

const splitByStartTime = <T extends { result: Result }>(jumpRunSeparation: number) => (
  acc: T[][],
  record: T
) => {
  if (acc.length === 0) return [[record]]

  const lastGroup = acc[acc.length - 1]
  const lastRecord = lastGroup[lastGroup.length - 1]
  const nextJumpRun =
    differenceInSeconds(record.result.exitedAt, lastRecord.result.exitedAt) >=
    jumpRunSeparation

  if (nextJumpRun) {
    acc.push([record])
    return acc
  }

  lastGroup.push(record)
  return acc
}

const groupByJumpRun = <T extends { result: Result }>(
  competitorsWithResults: T[],
  jumpRunSeparation = 120
): T[][] =>
  Array.from(competitorsWithResults).reduce(splitByStartTime(jumpRunSeparation), [])

export default groupByJumpRun
