import React from 'react'
import type { Organizer as OrganizerRecord } from 'api/organizers'
import { useProfileQuery } from 'api/profiles'
import styles from './styles.module.scss'

type OrganizerProps = {
  organizer: OrganizerRecord
  editable: boolean
}

const Organizer = ({ organizer }: OrganizerProps) => {
  const { data: profile, isSuccess } = useProfileQuery(organizer.profileId)

  if (!isSuccess) return null

  return (
    <div className={styles.container}>
      <img
        className={styles.photo}
        alt={`${profile.name} photo`}
        src={profile.photo.medium}
      />
      {profile.name}
    </div>
  )
}

export default Organizer
