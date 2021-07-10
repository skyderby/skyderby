import React from 'react'
import PropTypes from 'prop-types'

import { useResultsQuery } from 'api/hooks/speedSkydivingCompetitions'
import CompetitorCells from './CompetitorCells'
import ResultCell from './ResultCell'
import styles from './styles.module.scss'

const StandingRow = ({ event, row, rounds }) => {
  const { data: results } = useResultsQuery(event.id, {
    select: data => data.filter(result => result.competitorId === row.competitorId)
  })

  return (
    <tr className={styles.standingRow}>
      <td>{row.rank}</td>
      <CompetitorCells event={event} competitorId={row.competitorId} />
      {rounds.map(round => (
        <ResultCell
          key={round.id}
          event={event}
          roundId={round.id}
          competitorId={row.competitorId}
          result={results.find(result => result.roundId === round.id)}
        />
      ))}
      <td>{results.length > 0 ? row.total : ''}</td>
      <td>{results.length > 0 ? row.average : ''}</td>
    </tr>
  )
}

StandingRow.propTypes = {
  event: PropTypes.object.isRequired,
  row: PropTypes.shape({
    rank: PropTypes.number.isRequired,
    competitorId: PropTypes.number.isRequired,
    total: PropTypes.number,
    average: PropTypes.number
  }).isRequired,
  rounds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired
    })
  ).isRequired
}

export default StandingRow
