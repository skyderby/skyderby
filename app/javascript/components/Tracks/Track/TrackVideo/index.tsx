import React, { useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { useI18n } from 'components/TranslationsProvider'
import YoutubePlayer from 'components/YoutubePlayer'
import PageContainer from 'components/Tracks/Track/PageContainer'
import CogIcon from 'icons/cog.svg'
import Indicators from './Indicators'
import { getDataForTime } from './utils'
import { useTrackQuery } from 'api/tracks'
import { PointRecord, useTrackPointsQuery } from 'api/tracks/points'
import { useTrackVideoQuery } from 'api/tracks/video'
import styles from './styles.module.scss'

type VideoPlayerProps = {
  trackId: number
}

const VideoPlayer = ({ trackId }: VideoPlayerProps): JSX.Element | null => {
  const { t } = useI18n()
  const { data: track } = useTrackQuery(trackId)
  const { data: points = [] } = useTrackPointsQuery(trackId)
  const { data: video } = useTrackVideoQuery(trackId)

  const requestId = useRef<number>()
  const playerRef = useRef<{ getPlayerTime: () => number | undefined }>()
  const indicatorsRef = useRef<{
    setData: (point: Partial<PointRecord> | null) => void
  }>()

  const drawFrame = () => {
    const currentTime = playerRef.current?.getPlayerTime()
    const currentData = currentTime ? getDataForTime(points, video, currentTime) : null

    indicatorsRef.current?.setData(currentData)

    requestId.current = requestAnimationFrame(drawFrame)
  }

  const onPlay = () => (requestId.current = requestAnimationFrame(drawFrame))

  const onPause = () => {
    if (requestId.current) {
      cancelAnimationFrame(requestId.current)
      requestId.current = undefined
    }
  }

  useEffect(() => {
    return () => {
      requestId.current && cancelAnimationFrame(requestId.current)
    }
  }, [])

  if (!track?.hasVideo) {
    if (track?.permissions.canEdit) {
      return <Navigate to={`/tracks/${trackId}/video/edit`} />
    } else {
      return <Navigate to={`/tracks/${trackId}`} />
    }
  }

  if (!video) return null

  return (
    <PageContainer shrinkToContent>
      {track.permissions.canEdit && (
        <PageContainer.Settings>
          <Link to={`/tracks/${trackId}/video/edit`} className={styles.flatButton}>
            <CogIcon />
            <span>{t('general.settings')}</span>
          </Link>
        </PageContainer.Settings>
      )}

      <YoutubePlayer
        ref={playerRef}
        videoId={video.videoCode}
        onPlay={onPlay}
        onPause={onPause}
      />
      <Indicators ref={indicatorsRef} />
    </PageContainer>
  )
}

export default VideoPlayer
