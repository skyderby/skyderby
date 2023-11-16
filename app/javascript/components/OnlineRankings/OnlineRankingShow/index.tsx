import React from 'react'
import { useParams } from 'react-router-dom'
import { useOnlineRankingQuery } from 'api/onlineRankings'
import Header from './Header'
import styles from './styles.module.scss'

const OnlineRankingShow = () => {
  const params = useParams()
  const id = Number(params.id)
  const { data: onlineRanking } = useOnlineRankingQuery(id)

  return (
    <div className={styles.container}>
      <Header onlineRanking={onlineRanking}></Header>
    </div>
  )
}

export default OnlineRankingShow
