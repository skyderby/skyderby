import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'

import { createTrackSelector } from 'redux/tracks'
import { createProfileSelector } from 'redux/profiles'

import styles from './styles.module.scss'

const TrackTag = ({ trackId, onDelete }) => {
  const track = useSelector(createTrackSelector(trackId))
  const profile = useSelector(createProfileSelector(track?.profileId))

  const label = [profile?.name, `#${trackId}`].filter(Boolean).join(' - ')

  return (
    <li className={styles.tag}>
      <span className={styles.label}>{label}</span>
      <button
        className={styles.deleteButton}
        type="button"
        onClick={onDelete}
        aria-label={`Remove ${label}`}
      >
        <IconTimes />
      </button>
    </li>
  )
}

TrackTag.propTypes = {
  trackId: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default TrackTag
