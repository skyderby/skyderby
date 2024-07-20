import React from 'react'
import { Tournament, Slot as SlotRecord } from 'api/tournaments'
import styles from './styles.module.scss'
import { SuitName } from 'components/SuitLabel'

type Props = {
  slot: SlotRecord
  tournament: Tournament
}

const Slot = ({ slot, tournament }: Props) => {
  const competitor = tournament.competitors.find(
    competitor => competitor.id === slot.competitorId
  )

  if (!competitor) return null

  const profile = competitor.profile
  const suit = competitor.suit

  return (
    <div className={styles.slot}>
      <img src={profile.photo.thumb} alt={profile.name} className={styles.profilePhoto} />
      <div className={styles.profile}>
        <div className={styles.profileName}>{profile.name}</div>
        <SuitName
          name={suit.name}
          code={suit.manufacturer?.code}
          className={styles.suit}
        />
      </div>
      <div className={styles.result}>{slot.result?.toFixed(3)}</div>
    </div>
  )
}

export default Slot
