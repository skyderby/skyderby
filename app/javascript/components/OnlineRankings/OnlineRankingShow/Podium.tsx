import React from 'react'
import { OnlineRanking, StandingsRow } from 'api/onlineRankings'
import PodiumCard from './PodiumCard'
import styles from './styles.module.scss'

type Props = {
  standings: StandingsRow[]
  onlineRanking: OnlineRanking
}

const Podium = ({ standings, onlineRanking }: Props) => {
  return (
    <div className={styles.podium}>
      {standings.slice(0, 3).map(row => (
        <PodiumCard key={row.rank} row={row} onlineRanking={onlineRanking} />
      ))}
    </div>
  )
}

export default Podium
