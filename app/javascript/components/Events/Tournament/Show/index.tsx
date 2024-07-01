import React from 'react'
import { useParams } from 'react-router-dom'
import { useTournamentQuery } from 'api/tournaments'
import Header from './Header'
import styles from './styles.module.scss'

const TournamentShow = () => {
  const params = useParams()
  const tournamentId = Number(params.id)
  if (!tournamentId) throw new Error('No tournament ID provided')

  const { data: tournament } = useTournamentQuery(tournamentId)

  return (
    <div className={styles.container}>
      <Header event={tournament} />
    </div>
  )
}

export default TournamentShow
