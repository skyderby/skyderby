import React from 'react'
import PropTypes from 'prop-types'

import Profile from './Profile'
import Suit from './Suit'
import Place from './Place'

import styles from './styles.module.scss'

const Header = ({ track, children }) => (
  <div className={styles.container}>
    <div className={styles.content}>
      <div className={styles.row}>
        <Profile profileId={track.profileId} pilotName={track.pilotName} />
        <Place placeId={track.placeId} placeName={track.placeName} />
        <Suit suitId={track.suitId} suitName={track.suitName} />
        <div className={styles.trackId}>#{track.id}</div>
      </div>

      {children}
    </div>
  </div>
)

Header.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.number,
    pilotName: PropTypes.string,
    suitName: PropTypes.string,
    placeName: PropTypes.string,
    profileId: PropTypes.number,
    placeId: PropTypes.number,
    suitId: PropTypes.number,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  children: PropTypes.node
}

export default Header
