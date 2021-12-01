import React from 'react'

import useVideosQuery from 'api/videos'
import VideoThumbnail from 'components/VideoThumbnail'
import styles from './styles.module.scss'

type VideosProps = {
  placeId: number
}

const Videos = ({ placeId }: VideosProps): JSX.Element => {
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
