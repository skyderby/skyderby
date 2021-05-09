import React, { useCallback, useEffect, useRef } from 'react'
import { Link, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import YoutubePlayer from 'components/YoutubePlayer'
import TrackShowContainer from 'components/TrackShowContainer'
import CogIcon from 'icons/cog.svg'
import Indicators from './Indicators'
import { getDataForTime } from './utils'
import { useTrackQuery } from 'api/hooks/tracks'
import { useTrackPointsQuery } from 'api/hooks/tracks/points'
import { useTrackVideoQuery } from 'api/hooks/tracks/video'
import styles from './styles.module.scss'

const TrackVideo = ({ match }) => {
  const trackId = Number(match.params.id)
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
    <TrackShowContainer shrinkToContent>
      {track.permissions.canEdit && (
        <TrackShowContainer.Settings>
          <Link to={`/tracks/${trackId}/video/edit`} className={styles.flatButton}>
            <CogIcon />
            <span>{t('general.settings')}</span>
          </Link>
        </TrackShowContainer.Settings>
      )}

      <YoutubePlayer
        ref={playerRef}
        videoId={video.videoCode}
        onPlay={onPlay}
        onPause={onPause}
      />
      <Indicators ref={indicatorsRef} />
    </TrackShowContainer>
  )
}

TrackVideo.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default TrackVideo
