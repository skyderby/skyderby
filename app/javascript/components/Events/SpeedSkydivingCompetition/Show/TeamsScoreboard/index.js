import React from 'react'
import PropTypes from 'prop-types'

import {
  useSpeedSkydivingCompetitionQuery,
  useTeamStandingsQuery
} from 'api/hooks/speedSkydivingCompetitions'
import ActionsBar from './ActionsBar'
import styles from './styles.module.scss'
import StandingRow from 'components/Events/SpeedSkydivingCompetition/Show/TeamsScoreboard/StandingRow'

const TeamsScoreboard = ({ match }) => {
  const eventId = Number(match.params.eventId)

  const { data: teamStandings, isLoading } = useTeamStandingsQuery(eventId, {
    preload: ['competitors', 'teams']
  })
  const { data: event } = useSpeedSkydivingCompetitionQuery(eventId)

  if (isLoading) return null

  return (
    <div className={styles.container}>
      {event.permissions.canEdit && <ActionsBar eventId={eventId} />}

      <table className={styles.scoreboardTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {teamStandings.map(row => (
            <StandingRow
              key={row.teamId}
              event={event}
              teamId={row.teamId}
              rank={row.rank}
              total={row.total}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

TeamsScoreboard.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      eventId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default TeamsScoreboard
