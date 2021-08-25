import React from 'react'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'

import styles from './styles.module.scss'
import { useTrackQuery } from 'api/hooks/tracks'
import { useProfileQuery } from 'api/hooks/profiles'

const TrackTag = ({ trackId, onDelete }) => {
  const { data: track, isLoading: trackIsLoading } = useTrackQuery(trackId)
  const { data: profile, isLoading: profileIsLoading } = useProfileQuery(track?.profileId)

  if (trackIsLoading || profileIsLoading) return null

  const label = [profile?.name ?? track?.pilotName, `#${trackId}`]
    .filter(Boolean)
    .join(' - ')

  return (
    <motion.li
      className={styles.tag}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <span className={styles.label}>{label}</span>
      <button
        className={styles.deleteButton}
        type="button"
        onClick={onDelete}
        aria-label={`Remove ${label}`}
      >
        <IconTimes />
      </button>
    </motion.li>
  )
}

TrackTag.propTypes = {
  trackId: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default TrackTag
