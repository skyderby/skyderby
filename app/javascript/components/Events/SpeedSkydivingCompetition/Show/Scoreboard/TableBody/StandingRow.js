import React from 'react'
import PropTypes from 'prop-types'

import CompetitorCells from './CompetitorCells'
import styles from './styles.module.scss'

const StandingRow = ({ event, row, rounds }) => {
  return (
    <tr>
      <td></td>
      <CompetitorCells event={event} competitorId={row.competitorId} />
      {rounds.map(round => (
        <td key={round.id} className={styles.resultCell}></td>
      ))}
      <td></td>
      <td></td>
    </tr>
  )
}

StandingRow.propTypes = {
  event: PropTypes.object.isRequired,
  row: PropTypes.shape({
    competitorId: PropTypes.number.isRequired
  }).isRequired,
  rounds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired
    })
  ).isRequired
}

export default StandingRow
