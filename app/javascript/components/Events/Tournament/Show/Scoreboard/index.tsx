import React from 'react'
import { Tournament } from 'api/tournaments'
import Round from './Round'
import styles from './styles.module.scss'

type Props = {
  tournament: Tournament
}

const Scoreboard = ({ tournament }: Props) => {
  return (
    <div className={styles.container}>
      {tournament.rounds.map(round => (
        <Round tournament={tournament} round={round} key={round.id} />
      ))}
    </div>
  )
}

export default Scoreboard
