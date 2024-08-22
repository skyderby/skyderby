import React from 'react'
import ProfileLabel from 'components/ProfileLabel'
import { useProfileQuery } from 'api/profiles'
import styles from './styles.module.scss'

const defaultPhotoUrl = '/images/thumb/missing.png'

type ProfileProps = {
  profileId?: number | null
  pilotName?: string | null
}

const Profile = ({ profileId, pilotName: userProvidedName }: ProfileProps) => {
  const { data: profile } = useProfileQuery(profileId, { enabled: false })
  const photoUrl = profile?.photo?.thumb ?? defaultPhotoUrl

  return (
    <div className={styles.profile}>
      <img src={photoUrl} alt="profile photo" />
      <div className={styles.pilot}>
        {profileId ? <ProfileLabel id={profileId} /> : userProvidedName}
      </div>
    </div>
  )
}

export default Profile
