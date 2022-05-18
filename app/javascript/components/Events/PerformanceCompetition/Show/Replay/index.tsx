import React from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { compareAsc } from 'date-fns'

import { Round, useRoundsQuery } from 'api/performanceCompetitions'
import RoundsBar from 'components/Events/PerformanceCompetition/Show/RoundsBar'
import RoundReplay from './RoundReplay'
import styles from './styles.module.scss'

type ReplayProps = {
  eventId: number
}

const orderChronologically = (rounds: Round[]) =>
  Array.from(rounds).sort((a, b) => compareAsc(a.createdAt, b.createdAt))

const replayPath = (eventId: number, roundId: number) =>
  `/events/performance/${eventId}/replay/${roundId}`

const Replay = ({ eventId }: ReplayProps) => {
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

  if (!roundId) return <Navigate replace to={replayPath(eventId, rounds[0].id)} />

  return (
    <div className={styles.container}>
      <RoundsBar rounds={rounds} link={roundId => replayPath(eventId, roundId)} />
      <RoundReplay eventId={eventId} roundId={roundId} />
    </div>
  )
}

export default Replay
