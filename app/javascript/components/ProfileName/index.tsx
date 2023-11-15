import React from 'react'
import cx from 'clsx'
import { useProfileQuery } from 'api/profiles'
import styles from './styles.module.scss'

interface Props {
  id: number
  className?: string
}

const ProfileName = ({ id, className }: Props) => {
  const { data: profile } = useProfileQuery(id, { enabled: false })

  if (!profile) return null

  return (
    <span className={cx(profile.contributor && styles.profileName, className)}>
      {profile.name}
    </span>
  )
}

export default ProfileName
