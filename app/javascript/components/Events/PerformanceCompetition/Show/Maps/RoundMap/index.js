import React, { useState } from 'react'
import PropTypes from 'prop-types'

import Map from './Map'
import CompetitorsList from './CompetitorsList'

import { useCompetitorsQuery, useResultsQuery } from 'api/hooks/performanceCompetitions'
import groupByJumpRun from './groupByJumpRun'
import styles from './styles.module.scss'

const RoundMap = ({ eventId, roundId }) => {
  const { data: competitors = [] } = useCompetitorsQuery(eventId)
  const { data: results = [] } = useResultsQuery(eventId)

  const [selectedCompetitors, setSelectedCompetitors] = useState([])

  const toggleCompetitor = id => setSelectedCompetitors([id])
  const selectGroup = group =>
    setSelectedCompetitors(group.competitors.map(record => record.id))

  const roundResults = results.filter(result => result.roundId === roundId)
  const competitorsByGroup = groupByJumpRun(competitors, roundResults)

  return (
    <section className={styles.container}>
      <Map />

      <CompetitorsList
        groups={competitorsByGroup}
        selectedCompetitors={selectedCompetitors}
        toggleCompetitor={toggleCompetitor}
        selectGroup={selectGroup}
      />
    </section>
  )
}

RoundMap.propTypes = {
  eventId: PropTypes.number.isRequired,
  roundId: PropTypes.number.isRequired
}

export default RoundMap
