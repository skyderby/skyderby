import React from 'react'

import Map from 'components/Map'
import MapLegend from './MapLegend'
import Group from './Group'
import CompetitorRow from './CompetitorRow'

import { usePerformanceCompetitionQuery } from 'api/performanceCompetitions'
import { I18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'
import FlightPath from 'components/Events/PerformanceCompetition/Show/Maps/RoundMap/FlightPath'
import DesignatedLane from 'components/Events/PerformanceCompetition/Show/Maps/RoundMap/DesignatedLane'
import useRoundMapState from 'components/Events/PerformanceCompetition/Show/Maps/RoundMap/useRoundMapState'

type RoundMapProps = {
  eventId: number
  roundId: number
}

const RoundMap = ({ eventId, roundId }: RoundMapProps) => {
  const { data: event, isLoading } = usePerformanceCompetitionQuery(eventId)
  const {
    groups,
    competitorsWithResults,
    competitorsWithoutResults,
    competitorToShowDL,
    referencePoints,
    selectGroup,
    toggleCompetitor,
    toggleDL
  } = useRoundMapState(eventId, roundId)

  if (isLoading || !event) return null

  return (
    <section className={styles.container}>
      <main className={styles.map}>
        <Map autoFitBounds>
          {competitorsWithResults
            .filter(competitor => competitor.selected)
            .map(competitor => (
              <FlightPath key={competitor.id} event={event} competitor={competitor} />
            ))}

          {referencePoints.map(referencePoint => (
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
