import React from 'react'

import { Tournament } from 'api/tournaments'
import Navbar from './Navbar'
import styles from './styles.module.scss'

type Props = {
  tournament: Tournament
}

const TournamentHeader = ({ tournament }: Props) => {
  if (!tournament) return null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.eventName}>{tournament.name}</h2>
      </div>
      <Navbar tournament={tournament} />
    </div>
  )
}

export default TournamentHeader
