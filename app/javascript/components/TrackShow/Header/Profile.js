import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { selectProfile, selectProfilePhoto } from 'redux/profiles'

import styles from './styles.module.scss'

const defaultPhotoUrl = '/images/thumb/missing.png'

const Profile = ({ profileId, pilotName: userProvidedName }) => {
  const profile = useSelector(state => selectProfile(state, profileId))
  const photo = useSelector(state => selectProfilePhoto(state, profileId))

  const pilotName = profileId ? profile.name : userProvidedName
  const { thumb: photoUrl = defaultPhotoUrl } = photo || {}

  return (
    <div className={styles.profile}>
      <img src={photoUrl} />
      <div className={styles.pilot}>{pilotName}</div>
    </div>
  )
}

Profile.propTypes = {
  profileId: PropTypes.number,
  pilotName: PropTypes.string
}

export default Profile
