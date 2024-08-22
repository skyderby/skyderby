import React from 'react'
import { Tournament, Round as RoundRecord } from 'api/tournaments'
import Bracket from './Bracket'
import styles from './styles.module.scss'

type Props = {
  tournament: Tournament
  round: RoundRecord
}

const Round = ({ tournament, round }: Props) => {
  return (
    <div className={styles.round}>
      <div className={styles.roundHeader}>Round {round.order}</div>
      {round.brackets.map((bracket, idx) => (
        <Bracket
          tournament={tournament}
          bracket={bracket}
          key={bracket.id}
          round={round}
          position={idx + 1}
        />
      ))}
    </div>
  )
}

export default Round
