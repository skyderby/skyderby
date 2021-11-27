import React from 'react'
import type { match } from 'react-router-dom'

import useVideosQuery from 'api/videos'
import VideoThumbnail from 'components/VideoThumbnail'
import styles from './styles.module.scss'

type VideosProps = {
  match: match
}

const Videos = ({ match }: VideosProps): JSX.Element => {
  const placeId = Number(match.params.id)
  const { data } = useVideosQuery({ placeId })

  const items = data?.items ?? []

  return (
    <div className={styles.container}>
      {items.map(video => (
        <VideoThumbnail key={video.trackId} video={video} />
      ))}
    </div>
  )
}

export default Videos
