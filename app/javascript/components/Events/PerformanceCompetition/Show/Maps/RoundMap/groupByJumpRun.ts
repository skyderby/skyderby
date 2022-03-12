import { I18n } from 'components/TranslationsProvider'
import { compareAsc, differenceInSeconds } from 'date-fns'
import { Competitor, Result } from 'api/performanceCompetitions'

const splitByStartTime = (jumpRunSeparation: number) => (acc: Result[][], record: Result) => {
  if (acc.length === 0) return [[record]]

  const lastGroup = acc[acc.length - 1]
  const lastRecord = lastGroup[lastGroup.length - 1]
  const nextJumpRun =
    differenceInSeconds(record.startTime, lastRecord.startTime) >= jumpRunSeparation

  if (nextJumpRun) {
    acc.push([record])
    return acc
  }

  lastGroup.push(record)
  return acc
}

const groupByJumpRun = (
  competitors: Competitor[],
  results: Result[],
  jumpRunSeparation = 120
) => {
  const competitorsWithResults = competitors.map(competitor => ({
    ...competitor,
    result: results.find(({ competitorId }) => competitor.id === competitorId)
  }))

  const competitorsWithoutResults = competitorsWithResults.filter(
    record => !record.result
  )

  const groups = Array.from(results)
    .sort((a, b) => compareAsc(a.startTime, b.startTime))
    .reduce(splitByStartTime(jumpRunSeparation), [])
    .map((results, idx) => ({
      name: `${I18n.t('events.rounds.map.group')} ${idx + 1}`,
      selectable: true,
      competitors: results.map(result =>
        competitorsWithResults.find(({ id }) => id === result.competitorId)
      )
    }))

  return groups.concat([
    { name: 'Without results', selectable: false, competitors: competitorsWithoutResults }
  ])
}

export default groupByJumpRun
