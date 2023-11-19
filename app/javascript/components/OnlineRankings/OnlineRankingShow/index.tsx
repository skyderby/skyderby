import React from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { OnlineRanking, useOnlineRankingQuery } from 'api/onlineRankings'
import Header from './Header'
import Interval from './Interval'
import Overall from './Overall'
import Year from './Year'
import styles from './styles.module.scss'

const redirectPath = (onlineRanking: OnlineRanking) => {
  const baseUrl = `/online_rankings/${onlineRanking.id}`
  if (onlineRanking.intervalType === 'annual') {
    const lastYear = onlineRanking.years[onlineRanking.years.length - 1]

    if (lastYear) return `${baseUrl}/year/${lastYear}`
  } else {
    const lastInterval = onlineRanking.intervals[onlineRanking.intervals.length - 1]

    if (lastInterval) `${baseUrl}/periods/${lastInterval.slug}`
  }

  return `${baseUrl}/overall`
}

const OnlineRankingShow = () => {
  const params = useParams()
  const id = Number(params.id)
  const { data: onlineRanking } = useOnlineRankingQuery(id)

  return (
    <div className={styles.container}>
      <Header onlineRanking={onlineRanking}></Header>

      <Routes>
        <Route path="/overall" element={<Overall onlineRanking={onlineRanking} />} />
        <Route path="/year/:year" element={<Year />} />
        <Route path="/periods/:slug" element={<Interval />} />
        <Route path="*" element={<Navigate to={redirectPath(onlineRanking)} />} />
      </Routes>
    </div>
  )
}

export default OnlineRankingShow
