import React from 'react'
import PlaceLabel from 'components/PlaceLabel'
import { OnlineRanking } from 'api/onlineRankings'
import Navbar from './Navbar'
import styles from './styles.module.scss'

type Props = {
  onlineRanking: OnlineRanking
}

const Header = ({ onlineRanking }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.eventName}>{onlineRanking.name}</h2>
        <PlaceLabel
          withIcon
          withMsl
          placeId={onlineRanking.placeId}
          fallbackName="Worldwide"
        />
      </div>

      <Navbar onlineRanking={onlineRanking} />
    </div>
  )
}

export default Header
