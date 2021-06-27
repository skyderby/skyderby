import { I18n } from 'components/TranslationsProvider'
import { compareAsc, differenceInSeconds, parseISO } from 'date-fns'

const splitterByStartTime = jumpRunSeparation => (acc, record) => {
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

const groupByJumpRun = (competitors, results, jumpRunSeparation = 120) => {
  const competitorsWithResults = competitors.map(competitor => ({
    ...competitor,
    result: results.find(({ competitorId }) => competitor.id === competitorId)
  }))

  const competitorsWithoutResults = competitorsWithResults.filter(
    record => !record.result
  )

  const groups = Array.from(results)
    .map(result => ({ ...result, startTime: parseISO(result.startTime) }))
    .sort((a, b) => compareAsc(a.startTime, b.startTime))
    .reduce(splitterByStartTime(jumpRunSeparation), [])
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
