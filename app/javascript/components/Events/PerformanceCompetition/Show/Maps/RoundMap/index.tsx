import React, { useMemo, useState } from 'react'

import Map from 'components/Map'
import MapLegend from './MapLegend'
import Group from './Group'
import CompetitorRow from './CompetitorRow'

import {
  useCompetitorsQuery,
  usePerformanceCompetitionQuery,
  useResultsQuery,
  useReferencePointsQuery,
  useReferencePointAssignmentsQuery,
  Competitor,
  Result
} from 'api/performanceCompetitions'
import { I18n } from 'components/TranslationsProvider'
import { colorByIndex } from 'utils/colors'
import groupByJumpRun from './groupByJumpRun'
import styles from './styles.module.scss'
import FlightPath from 'components/Events/PerformanceCompetition/Show/Maps/RoundMap/FlightPath'
import { compareAsc } from 'date-fns'
import DesignatedLane from 'components/Events/PerformanceCompetition/Show/Maps/RoundMap/DesignatedLane'

type RoundMapProps = {
  eventId: number
  roundId: number
}

const ids = (records: { id: number }[]) => records.map(record => record.id)

const RoundMap = ({ eventId, roundId }: RoundMapProps) => {
  const { data: event, isLoading } = usePerformanceCompetitionQuery(eventId)
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
    () => competitorsRoundMapData.filter(record => !record.result),
    [competitorsRoundMapData]
  )

  const competitorsWithResults = competitorsRoundMapData
    .filter(
      (record: { result: Result | undefined }): record is { result: Result } =>
        record.result !== undefined
    )
    .sort((a, b) => compareAsc(a.result.exitedAt, b.result.exitedAt))
    .map((competitor, idx) => ({ ...competitor, color: colorByIndex(idx) }))

  const groups = groupByJumpRun(competitorsWithResults)

  const referencePointsUsedInCurrentRound = referencePoints.filter(referencePoint =>
    referencePointAssignments.find(
      assignment => assignment.referencePointId === referencePoint.id
    )
  )

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

  if (isLoading || !event) return null

  const competitorToShowDL =
    designatedLaneId &&
    competitorsWithResults.find(competitor => competitor.id === designatedLaneId)

  return (
    <section className={styles.container}>
      <main className={styles.map}>
        <Map autoFitBounds>
          {competitorsWithResults
            .filter(competitor => competitor.selected)
            .map(competitor => (
              <FlightPath key={competitor.id} event={event} competitor={competitor} />
            ))}

          {referencePointsUsedInCurrentRound.map(referencePoint => (
            <Map.Marker
              key={referencePoint.id}
              latitude={referencePoint.latitude}
              longitude={referencePoint.longitude}
            />
          ))}

          {competitorToShowDL && (
            <DesignatedLane event={event} competitor={competitorToShowDL} />
          )}
        </Map>
        <MapLegend rangeFrom={event.rangeFrom} rangeTo={event.rangeTo} />
      </main>

      <aside className={styles.competitors}>
        {groups.map((group, idx) => (
          <Group
            selectable
            key={idx}
            name={`${I18n.t('events.rounds.map.group')} ${idx + 1}`}
            onToggle={() => selectGroup(group)}
          >
            {group.map(competitor => (
              <CompetitorRow.WithResult
                key={competitor.id}
                event={event}
                competitor={competitor}
                checked={competitor.selected}
                onToggle={() => toggleCompetitor(competitor.id)}
                onToggleDL={() => toggleDL(competitor.id)}
              />
            ))}
          </Group>
        ))}

        {competitorsWithoutResults.length > 0 && (
          <Group name="Without results" selectable={false}>
            {competitorsWithoutResults.map(competitor => (
              <CompetitorRow.WithoutResult key={competitor.id} competitor={competitor} />
            ))}
          </Group>
        )}
      </aside>
    </section>
  )
}

export default RoundMap
