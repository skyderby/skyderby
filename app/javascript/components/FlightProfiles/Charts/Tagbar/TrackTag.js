import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'

import { selectTrack } from 'redux/flightProfiles'
import { Tag, DeleteButton, Label } from './elements'

const TrackTag = ({ trackId, onDelete }) => {
  const track = useSelector(state => selectTrack(state, trackId))

  if (!track) return null

  return (
    <Tag>
      <Label>
        {track.pilotName} - #{trackId}
      </Label>
      <DeleteButton type="button" onClick={onDelete}>
        <IconTimes />
      </DeleteButton>
    </Tag>
  )
}

TrackTag.propTypes = {
  trackId: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default TrackTag
