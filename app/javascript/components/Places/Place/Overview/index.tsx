import React from 'react'
import { usePlaceStatsQuery } from 'api/places'
import styles from './styles.module.scss'
import PopularTimes from 'components/Places/Place/Overview/PopularTimes'

type OverviewProps = {
  placeId: number
}

const Overview = ({ placeId }: OverviewProps) => {
  const { data: stats, isSuccess } = usePlaceStatsQuery(placeId)

  if (!isSuccess) return null

  return (
    <div className={styles.container}>
      <PopularTimes popularTimes={stats.popularTimes} />
      Last track recorded: {stats.lastTrackRecordedAt.toLocaleDateString()}
    </div>
  )
}

export default Overview
