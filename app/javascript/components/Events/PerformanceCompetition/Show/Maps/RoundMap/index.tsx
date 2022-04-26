import React, { useMemo, useState } from 'react'

import Map from './Map'
import MapLegend from './MapLegend'
import Group from './Group'
import CompetitorRow from './CompetitorRow'

import {
  useCompetitorsQuery,
  usePerformanceCompetitionQuery,
  useResultsQuery,
  Competitor
} from 'api/performanceCompetitions'
import { I18n } from 'components/TranslationsProvider'
import { colorByIndex } from 'utils/colors'
import groupByJumpRun from './groupByJumpRun'
import styles from './styles.module.scss'

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

  const [selectedCompetitors, setSelectedCompetitors] = useState<number[]>([])
  const [designatedLaneId, setDesignatedLaneId] = useState<number | null>(null)

  if (isLoading || !event) return null

  const competitorsWithResults = useMemo(
    () =>
      competitors.map(competitor => ({
        ...competitor,
        result: results.find(({ competitorId }) => competitor.id === competitorId)
      })),
    [competitors, results]
  )

  const competitorsWithoutResults = useMemo(
    () => competitorsWithResults.filter(record => !record.result),
    [competitorsWithResults]
  )

  const groups = useMemo(() => groupByJumpRun(competitorsWithResults, results), [
    competitorsWithResults,
    results
  ])

  const toggleCompetitor = (id: number) => setSelectedCompetitors(currentState => {
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

  return (
    <section className={styles.container}>
      <Map>
        <MapLegend rangeFrom={event.rangeFrom} rangeTo={event.rangeTo} />
      </Map>

      <aside className={styles.competitors}>
        {groups.map((group, idx) => (
          <Group
            selectable
            key={idx}
            name={`${I18n.t('events.rounds.map.group')} ${idx + 1}`}
            onToggle={() => selectGroup(group)}
          >
            {group.map((competitor, idx) => (
              <CompetitorRow.WithResult
                key={competitor.id}
                competitor={competitor}
                checked={selectedCompetitors.includes(competitor.id)}
                color={colorByIndex(idx)}
                onToggle={() => toggleCompetitor(competitor.id)}
                onToggleDL={() => toggleDL(competitor.id)}
              />
            ))}
          </Group>
        ))}

        {competitorsWithoutResults.length > 0 && (
          <Group name="Without results" selectable={false}>
            {competitorsWithoutResults.map((competitor, idx) => (
              <CompetitorRow.WithoutResult key={competitor.id} competitor={competitor} />
            ))}
          </Group>
        )}
      </aside>
    </section>
  )
}

export default RoundMap
