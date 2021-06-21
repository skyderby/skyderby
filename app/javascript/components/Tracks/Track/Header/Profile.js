import React from 'react'
import PropTypes from 'prop-types'

import { useProfileQuery } from 'api/hooks/profiles'
import styles from './styles.module.scss'

const defaultPhotoUrl = '/images/thumb/missing.png'

const Profile = ({ profileId, pilotName: userProvidedName }) => {
  const { data: profile } = useProfileQuery(profileId)
  const photoUrl = profile?.photo?.thumb ?? defaultPhotoUrl

  const pilotName = profileId ? profile?.name : userProvidedName

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
