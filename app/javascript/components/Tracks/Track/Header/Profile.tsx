import React from 'react'
import PropTypes from 'prop-types'

import { useProfileQuery } from 'api/profiles'
import styles from './styles.module.scss'

const defaultPhotoUrl = '/images/thumb/missing.png'

type ProfileProps = {
  profileId?: number | null
  pilotName?: string | null
}

const Profile = ({
  profileId,
  pilotName: userProvidedName
}: ProfileProps): JSX.Element => {
  const { data: profile } = useProfileQuery(profileId, { enabled: false })
  const photoUrl = profile?.photo?.thumb ?? defaultPhotoUrl

  const pilotName = profileId ? profile?.name : userProvidedName

  return (
    <div className={styles.profile}>
      <img src={photoUrl} alt="profile photo" />
      <div className={styles.pilot}>{pilotName}</div>
    </div>
  )
}

Profile.propTypes = {
  profileId: PropTypes.number,
  pilotName: PropTypes.string
}

export default Profile
