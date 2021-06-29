import React from 'react'
import PropTypes from 'prop-types'

import Profile from './Profile'
import Suit from './Suit'
import Navbar from './Navbar'
import styles from './styles.module.scss'
import PlaceLabel from 'components/PlaceLabel'

const Header = ({ track }) => (
  <div className={styles.container}>
    <div className={styles.content}>
      <div className={styles.row}>
        <Profile profileId={track.profileId} pilotName={track.pilotName} />
        <PlaceLabel withIcon placeId={track.placeId} fallbackName={track.location} />
        <Suit suitId={track.suitId} suitName={track.suitName} />
        <div className={styles.trackId}>#{track.id}</div>
      </div>

      <Navbar track={track} />
    </div>
  </div>
)

Header.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.number,
    pilotName: PropTypes.string,
    suitName: PropTypes.string,
    location: PropTypes.string,
    profileId: PropTypes.number,
    placeId: PropTypes.number,
    suitId: PropTypes.number,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired
}

export default Header
