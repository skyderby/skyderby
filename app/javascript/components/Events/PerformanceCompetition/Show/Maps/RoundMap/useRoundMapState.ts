import { useMemo, useState } from 'react'
import { compareAsc, differenceInSeconds } from 'date-fns'

import {
  Competitor,
  ReferencePoint,
  Result,
  useCompetitorsQuery,
  useReferencePointAssignmentsQuery,
  useReferencePointsQuery,
  useResultsQuery
} from 'api/performanceCompetitions'
import { colorByIndex } from 'utils/colors'

const ids = (records: { id: number }[]) => records.map(record => record.id)

interface CompetitorRoundMapData extends Competitor {
  selected: boolean
  referencePoint: ReferencePoint | null
  result: Result | undefined
}

interface CompetitorWithResult extends Omit<CompetitorRoundMapData, 'result'> {
  result: Result
}

interface CompetitorWithResultAndColor extends CompetitorWithResult {
  color: string
}

interface CompetitorWithoutResult extends Omit<CompetitorRoundMapData, 'result'> {
  result: undefined
}

const splitByStartTime = (jumpRunSeparation: number) => (
  acc: CompetitorWithResultAndColor[][],
  record: CompetitorWithResultAndColor
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
  competitorsWithResults: CompetitorWithResultAndColor[],
  jumpRunSeparation = 120
): CompetitorWithResultAndColor[][] =>
  Array.from(competitorsWithResults).reduce(splitByStartTime(jumpRunSeparation), [])

const useRoundMapState = (eventId: number, roundId: number) => {
  const { data: competitors = [] } = useCompetitorsQuery(eventId)
  const { data: results = [] } = useResultsQuery(eventId, {
    select: data => data.filter(result => result.roundId === roundId)
  })
  const { data: referencePoints = [] } = useReferencePointsQuery(eventId)
  const { data: referencePointAssignments = [] } = useReferencePointAssignmentsQuery(
    eventId,
    {
      select: data => data.filter(record => record.roundId === roundId)
    }
  )

  const [selectedCompetitors, setSelectedCompetitors] = useState<number[]>([])
  const [designatedLaneId, setDesignatedLaneId] = useState<number | null>(null)

  const competitorsRoundMapData = useMemo(
    () =>
      competitors.map(competitor => {
        const referencePointAssignment = referencePointAssignments.find(
          assignment => assignment.competitorId === competitor.id
        )
        const referencePointId = referencePointAssignment?.referencePointId
        const referencePoint =
          referencePoints.find(({ id }) => id === referencePointId) ?? null
        const result = results.find(({ competitorId }) => competitor.id === competitorId)
        const selected = selectedCompetitors.includes(competitor.id)

        return { ...competitor, result, referencePoint, selected }
      }),
    [
      competitors,
      results,
      referencePoints,
      referencePointAssignments,
      selectedCompetitors
    ]
  )

  const competitorsWithoutResults = useMemo(
    () =>
      competitorsRoundMapData.filter(
        (record: CompetitorRoundMapData): record is CompetitorWithoutResult =>
          !record.result
      ),
    [competitorsRoundMapData]
  )

  const competitorsWithResults = competitorsRoundMapData
    .filter(
      (record: CompetitorRoundMapData): record is CompetitorWithResult =>
        record.result !== undefined
    )
    .sort((a, b) => compareAsc(a.result.exitedAt, b.result.exitedAt))
    .map(
      (competitor, idx): CompetitorWithResultAndColor => ({
        ...competitor,
        color: colorByIndex(idx)
      })
    )

  const competitorToShowDL =
    designatedLaneId &&
    competitorsWithResults.find(competitor => competitor.id === designatedLaneId)

  const groups = groupByJumpRun(competitorsWithResults)

  const toggleCompetitor = (id: number) =>
    setSelectedCompetitors(currentState => {
      if (currentState.includes(id)) {
        return currentState.filter(el => el !== id)
      } else {
        return [...currentState, id]
      }
    })

  const toggleDL = (id: number) => {
    setDesignatedLaneId(id)
    if (selectedCompetitors.includes(id)) return

    const group = groups.find(group => ids(group).includes(id)) || []
    setSelectedCompetitors(ids(group))
  }

  const selectGroup = (group: Competitor[]) =>
    setSelectedCompetitors(group.map(record => record.id))

  const referencePointsUsedInCurrentRound = referencePoints.filter(referencePoint =>
    referencePointAssignments.find(
      assignment => assignment.referencePointId === referencePoint.id
    )
  )

  return {
    groups,
    competitorsWithResults,
    competitorsWithoutResults,
    competitorToShowDL,
    referencePoints: referencePointsUsedInCurrentRound,
    selectGroup,
    toggleCompetitor,
    toggleDL
  }
}

export default useRoundMapState
