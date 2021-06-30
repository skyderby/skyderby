import React from 'react'
import PropTypes from 'prop-types'

import {
  useCategoriesQuery,
  useRoundsQuery,
  useSpeedSkydivingCompetitionQuery
} from 'api/hooks/speedSkydivingCompetitions'
import { useStandingsQuery } from 'api/hooks/speedSkydivingCompetitions'
import ActionsBar from './ActionsBar'
import TableHeader from './TableHeader'
import TableBody from './TableBody'
import styles from './styles.module.scss'

const Scoreboard = ({ match }) => {
  const eventId = Number(match.params.eventId)
  const { data: standings, isLoading } = useStandingsQuery(eventId)
  const { data: rounds } = useRoundsQuery(eventId)
  const { data: categories } = useCategoriesQuery(eventId)
  const { data: event } = useSpeedSkydivingCompetitionQuery(eventId)

  if (isLoading) return null

  return (
    <div>
      {event.permissions.canEdit && <ActionsBar eventId={eventId} />}

      <table className={styles.scoreboardTable}>
        <TableHeader event={event} rounds={rounds} />
        <TableBody
          event={event}
          rounds={rounds}
          categories={categories}
          standings={standings}
        />
      </table>
    </div>
  )
}

Scoreboard.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      eventId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}
export default Scoreboard
