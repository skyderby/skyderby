import { differenceInSeconds } from 'date-fns'
import { Result } from 'api/performanceCompetitions'

interface CompetitorWithResult {
  result: Result
}

const splitByStartTime = (jumpRunSeparation: number) => (
  acc: CompetitorWithResult[][],
  record: CompetitorWithResult
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

const groupByJumpRun = (
  competitorsWithResults: CompetitorWithResult[],
  jumpRunSeparation = 120
): CompetitorWithResult[][] => {
  return Array.from(competitorsWithResults).reduce(
    splitByStartTime(jumpRunSeparation),
    []
  )
}

export default groupByJumpRun
