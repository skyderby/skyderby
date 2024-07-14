import React from 'react'
import { Tournament, Bracket as BracketRecord } from 'api/tournaments'
import Slot from './Slot'
import styles from './styles.module.scss'

type Props = {
  tournament: Tournament
  bracket: BracketRecord
}

const Bracket = ({ tournament, bracket }: Props) => {
  return (
    <div className={styles.bracket}>
      {bracket.slots.map(slot => (
        <Slot key={slot.id} slot={slot} tournament={tournament} />
      ))}
    </div>
  )
}

export default Bracket
