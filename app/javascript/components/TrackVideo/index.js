import React from 'react'
import { useSelector } from 'react-redux'

import { createTrackVideoSelector } from 'redux/tracks/videos'
import { usePageContext } from 'components/PageContext'

const TrackVideo = () => {
  const { trackId } = usePageContext()
  const video = useSelector(createTrackVideoSelector(trackId))

  return <h2>Track video, {JSON.stringify(video)}</h2>
}

export default TrackVideo
