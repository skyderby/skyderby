import React from 'react'
import { Link } from 'react-router-dom'

import { SuitRecord } from 'api/hooks/suits'
import styles from './styles.module.scss'
import { useSuitStatsQuery } from 'api/hooks/suitsStats'

type SuitProps = {
  suit: SuitRecord
}

const Suit = ({ suit }: SuitProps): JSX.Element => {
  const { data: stats } = useSuitStatsQuery(suit.id, { enabled: false })
  return (
    <Link className={styles.link} to={`/suits/${suit.id}`}>
      <div className={styles.suitName}>{suit.name}</div>
      <div className={styles.usageStat}>
        <div>&nbsp;{stats?.profiles}&nbsp;</div>
        <div>Pilots</div>
      </div>
      <div className={styles.usageStat}>
        <div>&nbsp;{stats?.baseTracks}&nbsp;</div>
        <div>BASE</div>
      </div>
      <div className={styles.usageStat}>
        <div>&nbsp;{stats?.skydiveTracks}&nbsp;</div>
        <div>Skydive</div>
      </div>
    </Link>
  )
}

export default Suit
