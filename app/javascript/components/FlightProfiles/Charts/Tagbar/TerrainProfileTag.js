import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'

import { createTerrainProfileSelector } from 'redux/terrainProfiles'
import { Tag, DeleteButton, Label } from './elements'

const TerrainProfile = ({ terrainProfileId, onDelete }) => {
  const terrainProfile = useSelector(createTerrainProfileSelector(terrainProfileId))

  if (!terrainProfile) return null

  const {
    place: { name: placeName },
    name
  } = terrainProfile

  return (
    <Tag>
      <Label>
        {placeName} - {name}
      </Label>
      <DeleteButton type="button" onClick={onDelete}>
        <IconTimes />
      </DeleteButton>
    </Tag>
  )
}

TerrainProfile.propTypes = {
  terrainProfileId: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default TerrainProfile
