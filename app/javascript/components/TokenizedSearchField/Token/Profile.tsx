import React, { useRef } from 'react'

import IconTimes from 'icons/times.svg'

import styles from './styles.module.scss'
import { useProfileQuery } from 'api/hooks/profiles'

type ProfileProps = {
  value: string | number
  onDelete: (e?: React.MouseEvent) => unknown
  onClick?: (e?: React.MouseEvent) => unknown
}

const Profile = ({ value, onClick, onDelete }: ProfileProps): JSX.Element | null => {
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const profileId = Number(value)
  const { data: profile } = useProfileQuery(profileId)

  if (!profile) return null

  const handleTokenClick = (e: React.MouseEvent) => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current ||
      deleteButtonRef.current?.contains(e.target as Node)

    if (deleteButtonClicked) {
      onDelete()
    }

    onClick?.()
  }

  const title = `Profile: ${profile.name}`

  return (
    <li className={styles.profileContainer} onClick={handleTokenClick} title={title}>
      <div className={styles.type}>Profile</div>
      <div className={styles.value}>
        {profile.name}
        <button
          className={styles.deleteButton}
          title="Delete"
          type="button"
          ref={deleteButtonRef}
        >
          <IconTimes />
        </button>
      </div>
    </li>
  )
}

export default Profile
