import React from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import { useTournamentQuery } from 'api/tournaments'
import Header from './Header'
import Scoreboard from './Scoreboard'
import Competitors from './Competitors'
import styles from './styles.module.scss'

const TournamentShow = () => {
  const params = useParams()
  const tournamentId = Number(params.id)
  if (!tournamentId) throw new Error('No tournament ID provided')

  const { data: tournament } = useTournamentQuery(tournamentId)

  return (
    <div className={styles.container}>
      <Header tournament={tournament} />

      <Routes>
        <Route index element={<Scoreboard tournament={tournament} />} />
        <Route path="competitors" element={<Competitors tournament={tournament} />} />
      </Routes>
    </div>
  )
}

export default TournamentShow
