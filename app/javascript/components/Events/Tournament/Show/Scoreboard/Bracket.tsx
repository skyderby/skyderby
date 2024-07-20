import React from 'react'
import { Tournament, Bracket as BracketRecord, Round } from 'api/tournaments'
import Slot from './Slot'
import styles from './styles.module.scss'

type Props = {
  tournament: Tournament
  bracket: BracketRecord
  position: number
  round: Round
}

const Bracket = ({ tournament, bracket, round, position }: Props) => {
  const margin = round.order > 1 ? 3 : 0
  return (
    <div className={styles.bracket} style={{ '--margin': margin } as React.CSSProperties}>
      {bracket.slots.map(slot => (
        <Slot key={slot.id} slot={slot} tournament={tournament} />
      ))}
    </div>
  )
}

export default Bracket
