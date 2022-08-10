import React from 'react'
import { useContributionStatsQuery } from 'api/contributions'
import styles from './styles.module.scss'

const ContributionSummary = () => {
  const { data: stats, isSuccess } = useContributionStatsQuery()

  if (!isSuccess) return null

  return (
    <div className={styles.container}>
      <div className={styles.title}>Contributions</div>
      <div className={styles.thisMonth}>
        <div>${stats.thisMonthAmount}</div>
      </div>
      <div className={styles.past90Days}>
        <div>${stats.past90DaysAmount}</div>
        <div>in past 90 days</div>
      </div>
      <div className={styles.pastYear}>
        <div>${stats.pastYearAmount}</div>
        <div>in past 365 days</div>
      </div>
    </div>
  )
}

export default ContributionSummary
