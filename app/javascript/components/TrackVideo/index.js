import React from 'react'
import { useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'

import { createTrackSelector } from 'redux/tracks'
import { createTrackVideoSelector } from 'redux/tracks/videos'
import { usePageContext } from 'components/PageContext'

const TrackVideo = () => {
  const { trackId } = usePageContext()
  const track = useSelector(createTrackSelector(trackId))
  const video = useSelector(createTrackVideoSelector(trackId))

  if (!track.hasVideo) {
    if (track.editable) {
      return <Redirect to={`/tracks/${trackId}/video/edit`} />
    } else {
      return <Redirect to={`/tracks/${trackId}`} />
    }
  }

  return <h2>Track video, {JSON.stringify(video)}</h2>
}

export default TrackVideo
