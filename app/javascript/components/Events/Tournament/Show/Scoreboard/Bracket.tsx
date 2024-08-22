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
  const spacingUnits = round.order ** 2
  const useBottomSpacing = round.order === tournament.rounds.length ? 0 : 1
  const useTopSpacing = useBottomSpacing === 0 && position > 1 ? 0 : 1
  return (
    <div
      className={styles.bracket}
      style={
        {
          '--round': round.order,
          '--spacing-units': spacingUnits,
          '--use-bottom-spacing': useBottomSpacing,
          '--use-top-spacing': useTopSpacing
        } as React.CSSProperties
      }
    >
      {bracket.slots.map(slot => (
        <Slot key={slot.id} slot={slot} tournament={tournament} />
      ))}
    </div>
  )
}

export default Bracket
