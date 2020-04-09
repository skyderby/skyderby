import React from 'react'
import { useSelector } from 'react-redux'

import { selectTrack } from 'redux/flightProfiles'
import { Tag } from './elements'

const TrackTag = ({ trackId }) => {
  const track = useSelector(state => selectTrack(state, trackId))

  if (!track) return null

  return (
    <Tag>
      {track.pilotName} - #{trackId}
    </Tag>
  )
}

export default TrackTag
