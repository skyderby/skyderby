import React from 'react'
import { Redirect, useRouteMatch } from 'react-router-dom'
import { useRoundsQuery } from 'api/hooks/performanceCompetitions'
import { compareAsc, parseISO } from 'date-fns'
import PropTypes from 'prop-types'

import RoundsBar from './RoundsBar'
import RoundMap from './RoundMap'
import styles from './styles.module.scss'

const mapsPath = (eventId, roundId) => `/events/performance/${eventId}/maps/${roundId}`
const orderChronologically = rounds =>
  Array.from(rounds).sort((a, b) =>
    compareAsc(parseISO(a.createdAt), parseISO(b.createdAt))
  )

const Maps = ({ eventId }) => {
  const match = useRouteMatch()
  const roundId = Number(match.params.roundId)
  const { data: rounds, isLoading } = useRoundsQuery(eventId)

  if (isLoading) return null
  if (rounds.length === 0)
    return (
      <div className={styles.emptyState}>No rounds added to this scoreboard yet.</div>
    )

  const sortedRounds = orderChronologically(rounds)

  if (!roundId) return <Redirect to={mapsPath(eventId, sortedRounds[0].id)} />

  return (
    <div className={styles.container}>
      <RoundsBar eventId={eventId} rounds={sortedRounds} />
      <RoundMap eventId={eventId} roundId={roundId} />
    </div>
  )
}

Maps.propTypes = {
  eventId: PropTypes.number.isRequired
}

export default Maps
