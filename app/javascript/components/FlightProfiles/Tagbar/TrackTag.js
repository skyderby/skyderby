import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'

import { createTrackSelector } from 'redux/tracks'
import { createProfileSelector } from 'redux/profiles'
import { Tag, DeleteButton, Label } from './elements'

const TrackTag = ({ trackId, onDelete }) => {
  const track = useSelector(createTrackSelector(trackId))
  const profile = useSelector(createProfileSelector(track?.profileId))

  const label = [profile?.name, `#${trackId}`].filter(Boolean).join(' - ')

  return (
    <Tag>
      <Label>{label}</Label>
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
