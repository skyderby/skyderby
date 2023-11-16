import React from 'react'
import { OnlineRankingGroup } from 'api/onlineRankings/groups'
import Navbar from './Navbar'
import styles from './styles.module.scss'

type Props = {
  onlineRankingGroup: OnlineRankingGroup
}

const Header = ({ onlineRankingGroup }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.eventName}>{onlineRankingGroup.name}</h2>
      </div>

      <Navbar onlineRankingGroup={onlineRankingGroup} />
    </div>
  )
}

export default Header
