import React from 'react'
import { useProfileQuery } from 'api/profiles'
import ProfileName from 'components/ProfileName'
import { OnlineRanking, StandingsRow } from 'api/onlineRankings'
import formatResult from 'utils/formatResult'
import styles from './styles.module.scss'

type Props = {
  row: StandingsRow
  onlineRanking: OnlineRanking
}

const PodiumCard = ({ row, onlineRanking }: Props) => {
  const { data: profile } = useProfileQuery(row.profileId)

  if (!profile) return null

  return (
    <div className={styles.podiumCard}>
      <img src={profile.photo.medium} />
      <div className={styles.name}>
        <ProfileName id={row.profileId} />
      </div>
      <div className={styles.result}>
        {formatResult(row.result, onlineRanking.discipline, { showUnits: true })}
      </div>
    </div>
  )
}

export default PodiumCard
