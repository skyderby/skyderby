import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import CogIcon from 'icons/cog.svg'
import Profile from './Profile'
import Suit from './Suit'
import Place from './Place'

import styles from './styles.module.scss'

const Header = ({ track }) => (
  <div className={styles.container}>
    <div className={styles.row}>
      <Profile profileId={track.profileId} pilotName={track.pilotName} />
      {track.permissions.canEdit && (
        <Link
          className={styles.editLink}
          to={location => ({
            pathname: `/tracks/${track.id}/edit`,
            state: location.state
          })}
        >
          <CogIcon />
          <span>Edit</span>
        </Link>
      )}
    </div>

    <div className={styles.row}>
      <Place placeId={track.placeId} placeName={track.placeName} />
      <Suit suitId={track.suitId} suitName={track.suitName} />
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
  }).isRequired
}

export default Header
