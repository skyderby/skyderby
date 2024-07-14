import React from 'react'
import { Tournament, Slot as SlotRecord } from 'api/tournaments'
import styles from './styles.module.scss'

type Props = {
  slot: SlotRecord
  tournament: Tournament
}

const Slot = ({ slot, tournament }: Props) => {
  const competitor = tournament.competitors.find(
    competitor => competitor.id === slot.competitorId
  )

  const profile = competitor?.profile

  return (
    <div className={styles.slot}>
      <img
        src={profile?.photo.thumb}
        alt={profile?.name}
        className={styles.profilePhoto}
      />
      {profile?.name}
    </div>
  )
}

export default Slot
