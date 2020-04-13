import React from 'react'
import { useSelector } from 'react-redux'

import IconTimes from 'icons/times.svg'

import { createTerrainProfileSelector } from 'redux/terrainProfiles'
import { Tag, DeleteButton, Label } from './elements'

const handleDelete = () => {
  console.log("Kill")
}

const TerrainProfile = ({ terrainProfileId }) => {
  const terrainProfile = useSelector(createTerrainProfileSelector(terrainProfileId))

  if (!terrainProfile) return null

  const { place: { name: placeName }, name } = terrainProfile

  return (
    <Tag>
      <Label>
        {placeName} - {name}
      </Label>
      <DeleteButton type="button" onClick={handleDelete}>
        <IconTimes />
      </DeleteButton>
    </Tag>
  )
}

export default TerrainProfile
