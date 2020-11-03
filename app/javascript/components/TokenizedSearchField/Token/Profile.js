import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { loadProfile, createProfileSelector } from 'redux/profiles'
import IconTimes from 'icons/times.svg'

import styles from './styles.module.scss'

const Profile = ({ value, onClick, onDelete }) => {
  const dispatch = useDispatch()
  const deleteButtonRef = useRef()

  useEffect(() => {
    dispatch(loadProfile(value))
  }, [dispatch, value])

  const data = useSelector(createProfileSelector(value))

  if (!data) return null

  const handleTokenClick = e => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current || deleteButtonRef.current.contains(e.target)

    if (deleteButtonClicked) {
      onDelete()
    }

    onClick?.()
  }

  const title = `Profile: ${data.name}`

  return (
    <li className={styles.profileContainer} onClick={handleTokenClick} title={title}>
      <div className={styles.type}>Profile</div>
      <div className={styles.value}>
        {data.name}
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
