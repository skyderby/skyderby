import React from 'react'
import { Link } from 'react-router-dom'

import { useTrackQuery } from 'api/tracks'
import { useProfileQuery } from 'api/profiles'
import { useSuitQuery } from 'api/suits'
import { usePlaceQuery } from 'api/places'
import { TrackVideo } from 'api/tracks'
import styles from './styles.module.scss'
import { useI18n } from 'components/TranslationsProvider'
import SuitIcon from 'icons/suit.svg'
import LocationIcon from 'icons/location.svg'

const thumbnailUrl = (videoCode: string) =>
  `url(https://img.youtube.com/vi/${videoCode}/mqdefault.jpg)`

type VideoThumbnailProps = {
  video: TrackVideo
}

const VideoThumbnail = ({ video }: VideoThumbnailProps) => {
  const { formatDate } = useI18n()
  const { data: track } = useTrackQuery(video.trackId)
  const { data: profile } = useProfileQuery(track?.profileId, { enabled: false })
  const { data: suit } = useSuitQuery(track?.suitId, { enabled: false })
  const { data: place } = usePlaceQuery(track?.placeId, { enabled: false })

  return (
    <Link
      key={video.trackId}
      to={`/tracks/${video.trackId}/video`}
      className={styles.card}
      style={{ backgroundImage: thumbnailUrl(video.videoCode) }}
    >
      <div className={styles.details}>
        <strong>{profile?.name}</strong>
        {track?.recordedAt && formatDate(track?.recordedAt, 'dd MMM yyyy')}
        <hr />

        <div className={styles.description}>
          <span>
            <SuitIcon />
            {suit?.name}
          </span>
          <span>
            <LocationIcon />
            {place?.name}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default VideoThumbnail
