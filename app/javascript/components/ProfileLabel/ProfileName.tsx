import React from 'react'
import cx from 'clsx'
import { ProfileRecord } from 'api/profiles'
import styles from './styles.module.scss'

type Props = {
  profile: ProfileRecord
  className?: string
  withPhoto?: boolean
}

const ProfileName = ({ profile, className, withPhoto = false }: Props) => {
  return (
    <span
      className={cx(profile.contributor && styles.contributor, styles.profile, className)}
    >
      {withPhoto && (
        <img
          src={profile.photo.thumb}
          alt={profile.name}
          className={styles.profilePhoto}
        />
      )}
      {profile.name}
    </span>
  )
}

export default ProfileName
