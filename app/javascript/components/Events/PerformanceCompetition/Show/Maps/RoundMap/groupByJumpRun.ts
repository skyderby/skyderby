import { I18n } from 'components/TranslationsProvider'
import { compareAsc, differenceInSeconds } from 'date-fns'
import { Competitor, Result } from 'api/performanceCompetitions'
import { ManufacturerRecord } from 'api/manufacturer'

const splitByStartTime = (jumpRunSeparation: number) => (
  acc: Result[][],
  record: Result
) => {
  if (acc.length === 0) return [[record]]

  const lastGroup = acc[acc.length - 1]
  const lastRecord = lastGroup[lastGroup.length - 1]
  const nextJumpRun =
    differenceInSeconds(record.exitedAt, lastRecord.exitedAt) >= jumpRunSeparation

  if (nextJumpRun) {
    acc.push([record])
    return acc
  }

  lastGroup.push(record)
  return acc
}

type CompetitorWithResult = Competitor & {
  result: Result
}

const groupByJumpRun = (
  competitorsWithResults: Competitor[],
  results: Result[],
  jumpRunSeparation = 120
): CompetitorWithResult[][] => {
  const groups = Array.from(results)
    .sort((a, b) => compareAsc(a.exitedAt, b.exitedAt))
    .reduce(splitByStartTime(jumpRunSeparation), [])
    .map((results, idx) =>
      results
        .map(result =>
          competitorsWithResults.find(({ id }) => id === result.competitorId)
        )
        .filter((record): record is CompetitorWithResult => record !== undefined)
    )

  return groups
}

export default groupByJumpRun
