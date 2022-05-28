import React from 'react'

import Profile from './Profile'
import Suit from './Suit'
import Navbar from './Navbar'
import styles from './styles.module.scss'
import PlaceLabel from 'components/PlaceLabel'
import { TrackRecord } from 'api/tracks'

type HeaderProps = {
  track: TrackRecord
}

const Header = ({ track }: HeaderProps): JSX.Element => (
  <div className={styles.container}>
    <div className={styles.content}>
      <div className={styles.row}>
        <Profile profileId={track.profileId} pilotName={track.pilotName} />
        <div className={styles.suitAndPlace}>
          <PlaceLabel withIcon placeId={track.placeId} fallbackName={track.location} />
          <Suit suitId={track.suitId} suitName={track.missingSuitName} />
        </div>
        <div className={styles.trackId}>#{track.id}</div>
      </div>

      <Navbar track={track} />
    </div>
  </div>
)

export default Header
