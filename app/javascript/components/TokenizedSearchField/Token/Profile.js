import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'

import styles from './styles.module.scss'
import { useProfileQuery } from 'api/hooks/profiles'

const Profile = ({ value, onClick, onDelete }) => {
  const deleteButtonRef = useRef()

  const { data: profile } = useProfileQuery(value)

  if (!profile) return null

  const handleTokenClick = e => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current || deleteButtonRef.current.contains(e.target)

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

Profile.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onDelete: PropTypes.func.isRequired,
  onClick: PropTypes.func
}

export default Profile
