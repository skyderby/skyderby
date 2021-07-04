import React from 'react'
import PropTypes from 'prop-types'

import CompetitorCells from './CompetitorCells'
import ResultCell from './ResultCell'

const StandingRow = ({ event, row, rounds }) => {
  return (
    <tr>
      <td>{row.rank}</td>
      <CompetitorCells event={event} competitorId={row.competitorId} />
      {rounds.map(round => (
        <ResultCell
          key={round.id}
          event={event}
          roundId={round.id}
          competitorId={row.competitorId}
        />
      ))}
      <td></td>
      <td></td>
    </tr>
  )
}

StandingRow.propTypes = {
  event: PropTypes.object.isRequired,
  row: PropTypes.shape({
    rank: PropTypes.number.isRequired,
    competitorId: PropTypes.number.isRequired
  }).isRequired,
  rounds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired
    })
  ).isRequired
}

export default StandingRow
