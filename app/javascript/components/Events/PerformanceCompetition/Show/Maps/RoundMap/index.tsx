import React, { useState } from 'react'

import Map from './Map'
import MapLegend from './MapLegend'
import CompetitorsList from './CompetitorsList'

import { useCompetitorsQuery, usePerformanceCompetitionQuery, useResultsQuery } from 'api/performanceCompetitions'
import groupByJumpRun from './groupByJumpRun'
import styles from './styles.module.scss'

type RoundMapProps = {
  eventId: number
  roundId: number
}

const RoundMap = ({ eventId, roundId }: RoundMapProps) => {
  const { data: competitors = [] } = useCompetitorsQuery(eventId)
  const { data: event } = usePerformanceCompetitionQuery(eventId)
  const { data: results = [] } = useResultsQuery(eventId, {
    select: data => data.filter(result => result.roundId === roundId)
  })

  const [selectedCompetitors, setSelectedCompetitors] = useState([])

  const toggleCompetitor = id => setSelectedCompetitors([id])
  const selectGroup = group =>
    setSelectedCompetitors(group.competitors.map(record => record.id))

  const competitorsByGroup = groupByJumpRun(competitors, results)

  return (
    <section className={styles.container}>
      <Map>
        <MapLegend rangeFrom={event?.rangeFrom} rangeTo={event?.rangeTo}/>
      </Map>

      <CompetitorsList
        groups={competitorsByGroup}
        selectedCompetitors={selectedCompetitors}
        toggleCompetitor={toggleCompetitor}
        selectGroup={selectGroup}
      />
    </section>
  )
}

export default RoundMap
