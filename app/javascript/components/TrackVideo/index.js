import React, { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'

import { createTrackSelector } from 'redux/tracks'
import { createPointsSelector } from 'redux/tracks/points'
import { createTrackVideoSelector } from 'redux/tracks/videos'
import { usePageContext } from 'components/PageContext'
import YoutubePlayer from 'components/YoutubePlayer'
import Indicators from './Indicators'
import { getDataForTime } from './utils'

const TrackVideo = () => {
  const { trackId } = usePageContext()
  const track = useSelector(createTrackSelector(trackId))
  const points = useSelector(createPointsSelector(trackId))
  const video = useSelector(createTrackVideoSelector(trackId))

  const requestId = useRef()
  const playerRef = useRef()
  const indicatorsRef = useRef()

  const drawFrame = useCallback(() => {
    const currentTime = playerRef.current.getPlayerTime()
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
    if (track.editable) {
      return <Redirect to={`/tracks/${trackId}/video/edit`} />
    } else {
      return <Redirect to={`/tracks/${trackId}`} />
    }
  }

  if (!video) return null

  return (
    <div>
      <YoutubePlayer
        ref={playerRef}
        videoId={video.videoCode}
        onPlay={onPlay}
        onPause={onPause}
      />
      <Indicators ref={indicatorsRef} />
    </div>
  )
}

export default TrackVideo
