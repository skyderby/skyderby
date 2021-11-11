import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'
import { useTrackQuery } from 'api/tracks'
import { useProfileQuery } from 'api/profiles'
import { useSuitQuery } from 'api/suits'

const thumbnailUrl = videoCode =>
  `url(https://img.youtube.com/vi/${videoCode}/mqdefault.jpg)`

const Card = ({ video }) => {
  const { data: track } = useTrackQuery(video.trackId)
  const { data: profile } = useProfileQuery(track?.profileId)
  const { data: suit } = useSuitQuery(track?.suitId)

  return (
    <Link
      key={video.trackId}
      to={`/tracks/${video.trackId}/video`}
      className={styles.card}
    >
      <div
        className={styles.cover}
        style={{ backgroundImage: thumbnailUrl(video.videoCode) }}
      />

      <div className={styles.details}>
        <strong>{profile?.name}</strong>
        <p>{suit?.name}</p>
      </div>
    </Link>
  )
}

Card.propTypes = {
  video: PropTypes.shape({
    trackId: PropTypes.number.isRequired,
    videoCode: PropTypes.string.isRequired
  })
}
export default Card
