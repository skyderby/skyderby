import React from 'react'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'

import styles from './styles.module.scss'
import { useTrackQuery } from 'api/hooks/tracks'
import { useProfileQuery } from 'api/hooks/profiles'

const TrackTag = ({ trackId, onDelete }) => {
  const { data: track } = useTrackQuery(trackId)
  const { data: profile } = useProfileQuery(track?.profileId)

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
