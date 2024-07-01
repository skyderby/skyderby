import React from 'react'

import { Tournament } from 'api/tournaments'
import Navbar from './Navbar'
import styles from './styles.module.scss'

type Props = {
  event: Tournament
}

const TournamentHeader = ({ event }: Props) => {
  if (!event) return null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.eventName}>{event.name}</h2>
      </div>
      <Navbar event={event} />
    </div>
  )
}

export default TournamentHeader
