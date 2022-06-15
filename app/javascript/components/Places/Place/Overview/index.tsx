import React from 'react'
import { usePlaceStatsQuery } from 'api/places'
import PopularTimes from './PopularTimes'
import styles from './styles.module.scss'

type OverviewProps = {
  placeId: number
}

const Overview = ({ placeId }: OverviewProps) => {
  const { data: stats, isSuccess } = usePlaceStatsQuery(placeId)

  if (!isSuccess) return null

  return (
    <div className={styles.container}>
      <PopularTimes popularTimes={stats.popularTimes} />
      Last track recorded:{' '}
      {stats.lastTrackRecordedAt ? (
        stats.lastTrackRecordedAt.toLocaleDateString()
      ) : (
        <>&mdash;</>
      )}
    </div>
  )
}

export default Overview
