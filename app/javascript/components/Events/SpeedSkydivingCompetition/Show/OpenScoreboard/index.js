import React from 'react'
import PropTypes from 'prop-types'

import {
  useRoundsQuery,
  useOpenStandingsQuery,
  useSpeedSkydivingCompetitionQuery
} from 'api/hooks/speedSkydivingCompetitions'
import StandingRow from './StandingRow'
import styles from './styles.module.scss'

const OpenScoreboard = ({ match }) => {
  const eventId = Number(match.params.eventId)
  const { data: standings, isLoading } = useOpenStandingsQuery(eventId)
  const { data: event } = useSpeedSkydivingCompetitionQuery(eventId)
  const { data: rounds } = useRoundsQuery(eventId)

  if (isLoading) return null

  return (
    <div className={styles.container}>
      <table className={styles.scoreboardTable}>
        <thead>
          <tr>
            <th>#</th>
            <th colSpan={2}>Competitor</th>
            {rounds.map(round => (
              <th key={round.id}>{round.number}</th>
            ))}
            <th>Total</th>
            <th>Avg</th>
          </tr>
        </thead>
        <tbody>
          {standings.map(row => (
            <StandingRow
              key={row.competitorId}
              event={event}
              rank={row.rank}
              total={row.total}
              competitorId={row.competitorId}
              average={row.average}
              rounds={rounds}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

OpenScoreboard.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      eventId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default OpenScoreboard
