import React, { useCallback, useEffect, useRef } from 'react'
import { Link, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import YoutubePlayer from 'components/YoutubePlayer'
import PageContainer from 'components/Tracks/Track/PageContainer'
import CogIcon from 'icons/cog.svg'
import Indicators from './Indicators'
import { getDataForTime } from './utils'
import { useTrackQuery } from 'api/hooks/tracks'
import { useTrackPointsQuery } from 'api/hooks/tracks/points'
import { useTrackVideoQuery } from 'api/hooks/tracks/video'
import styles from './styles.module.scss'

const VideoPlayer = ({ trackId }) => {
  const { t } = useI18n()
  const { data: track } = useTrackQuery(trackId)
  const { data: points = [] } = useTrackPointsQuery(trackId)
  const { data: video } = useTrackVideoQuery(trackId)

  const requestId = useRef()
  const playerRef = useRef()
  const indicatorsRef = useRef()

  const drawFrame = useCallback(() => {
    const currentTime = playerRef.current?.getPlayerTime()
    const currentData = getDataForTime(points, video, currentTime)

    indicatorsRef.current.setData(currentData)

    requestId.current = requestAnimationFrame(drawFrame)
  }, [points, video])

  const onPlay = useCallback(() => {
    requestId.current = requestAnimationFrame(drawFrame)
  }, [drawFrame])

  const onPause = useCallback(() => {
    cancelAnimationFrame(requestId.current)
    requestId.current = undefined
  }, [])

  useEffect(() => {
    return () => requestId.current && cancelAnimationFrame(requestId.current)
  }, [])

  if (!track.hasVideo) {
    if (track.permissions.canEdit) {
      return <Redirect to={`/tracks/${trackId}/video/edit`} />
    } else {
      return <Redirect to={`/tracks/${trackId}`} />
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

VideoPlayer.propTypes = {
  trackId: PropTypes.number.isRequired
}

export default VideoPlayer
