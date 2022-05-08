import React from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Round, useRoundsQuery } from 'api/performanceCompetitions'
import { compareAsc } from 'date-fns'

import RoundsBar from './RoundsBar'
import RoundMap from './RoundMap'
import styles from './styles.module.scss'

type MapsProps = {
  eventId: number
}

const mapsPath = (eventId: number, roundId: number) =>
  `/events/performance/${eventId}/maps/${roundId}`

const orderChronologically = (rounds: Round[]) =>
  Array.from(rounds).sort((a, b) => compareAsc(a.createdAt, b.createdAt))

const Maps = ({ eventId }: MapsProps) => {
  const params = useParams()
  const roundId = Number(params.roundId)
  const { data: rounds, isLoading } = useRoundsQuery(eventId, {
    select: data => orderChronologically(data)
  })

  if (isLoading || !rounds) return null
  if (rounds.length === 0)
    return (
      <div className={styles.emptyState}>No rounds added to this scoreboard yet.</div>
    )

  if (!roundId) return <Navigate replace to={mapsPath(eventId, rounds[0].id)} />

  return (
    <div className={styles.container}>
      <RoundsBar eventId={eventId} rounds={rounds} />
      <RoundMap eventId={eventId} roundId={roundId} />
    </div>
  )
}

export default Maps
